
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateInvoiceDto, CreateInvoiceItemDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { PrismaService } from 'src/prisma.service';
import { InvoiceStatus } from '@prisma/client';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) { }

  async create(createInvoiceDto: CreateInvoiceDto) {
    const { items, ...invoiceData } = createInvoiceDto;

    return this.prisma.$transaction(async (tx) => {
      // 1. Calculate totals and CHECK STOCK (inside transaction)
      const totals = await this.calculateTotals(items, tx);

      // 2. Create the invoice
      const invoice = await tx.invoice.create({
        data: {
          ...invoiceData,
          subtotal: totals.subtotal,
          tax: totals.totalTax,
          total: totals.total,
          status: (createInvoiceDto.status as InvoiceStatus) || InvoiceStatus.DRAFT,
          items: {
            create: totals.itemsData
          }
        },
        include: { items: { include: { product: true } }, client: true }
      });

      // 3. Subtract stock from products
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity }
          }
        });
      }

      return invoice;
    });
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto) {
    const { items, ...invoiceData } = updateInvoiceDto;

    const currentInvoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { items: true }
    });
    if (!currentInvoice) throw new NotFoundException('Invoice not found');

    return this.prisma.$transaction(async (tx) => {
      const updateData: any = { ...invoiceData };

      // 1. Handle Status Change Stock Logic
      if (updateInvoiceDto.status === 'CANCELLED' && currentInvoice.status !== 'CANCELLED') {
        for (const item of currentInvoice.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } }
          });
        }
      }
      else if (updateInvoiceDto.status && updateInvoiceDto.status !== 'CANCELLED' && currentInvoice.status === 'CANCELLED') {
        // When moving FROM cancelled, we must check if there's enough stock to re-activate
        const products = await tx.product.findMany({
          where: { id: { in: currentInvoice.items.map(i => i.productId) } }
        });

        for (const item of currentInvoice.items) {
          const product = products.find(p => p.id === item.productId);
          if (product.stock < item.quantity) {
            throw new BadRequestException(`No se puede reactivar la factura. Stock insuficiente para "${product.name}".`);
          }
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } }
          });
        }
      }

      // 2. Handle Item Changes Stock Logic
      if (items) {
        if (currentInvoice.status !== 'CANCELLED') {
          for (const item of currentInvoice.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } }
            });
          }
        }

        const totals = await this.calculateTotals(items as any, tx);
        updateData.subtotal = totals.subtotal;
        updateData.tax = totals.totalTax;
        updateData.total = totals.total;

        await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
        updateData.items = {
          create: totals.itemsData
        };

        const finalStatus = updateInvoiceDto.status || currentInvoice.status;
        if (finalStatus !== 'CANCELLED') {
          for (const item of items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } }
            });
          }
        }
      }

      return tx.invoice.update({
        where: { id },
        data: updateData,
        include: { items: { include: { product: true } }, client: true }
      });
    });
  }

  private async calculateTotals(items: CreateInvoiceItemDto[], tx: any = this.prisma) {
    const productIds = items.map(item => item.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds } }
    });

    let subtotal = 0;
    let totalTax = 0;
    const itemsData = [];

    // Group items by productId to check total requested quantity for each product in this invoice
    const requestedQuantities = items.reduce((acc: any, item) => {
      acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
      return acc;
    }, {});

    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) throw new NotFoundException(`Producto no encontrado.`);

      // Validate global stock for this product in this request
      if (product.stock < requestedQuantities[item.productId]) {
        throw new BadRequestException(`Stock insuficiente para "${product.name}". Disponible: ${product.stock}, Solicitado: ${requestedQuantities[item.productId]}`);
      }

      const quantity = item.quantity;
      const price = Number(product.price);
      const itemTotal = price * quantity;
      const tax = itemTotal * Number(product.taxRate || 0);

      subtotal += itemTotal;
      totalTax += tax;

      itemsData.push({
        productId: product.id,
        quantity: quantity,
        price: price,
        tax: tax,
        total: itemTotal + tax
      });
    }

    return { subtotal, totalTax, total: subtotal + totalTax, itemsData };
  }

  findAll() {
    return this.prisma.invoice.findMany({
      include: {
        client: true,
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  findOne(id: string) {
    return this.prisma.invoice.findUnique({
      where: { id },
      include: { client: true, items: { include: { product: true } }, company: true }
    });
  }

  async remove(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!invoice) throw new NotFoundException('Invoice not found');

    return this.prisma.$transaction(async (tx) => {
      // Return stock to products if NOT already cancelled
      if (invoice.status !== 'CANCELLED') {
        for (const item of invoice.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity }
            }
          });
        }
      }

      return tx.invoice.delete({ where: { id } });
    });
  }
}
