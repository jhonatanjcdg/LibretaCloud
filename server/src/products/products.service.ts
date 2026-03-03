
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) { }

  async create(createProductDto: CreateProductDto) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: createProductDto,
      });

      if (product.stock > 0) {
        await tx.stockMovement.create({
          data: {
            productId: product.id,
            quantity: product.stock,
            type: 'IN',
            reason: 'Stock inicial',
            companyId: product.companyId,
          },
        });
      }

      return product;
    });
  }

  findAll(companyId?: string) {
    return this.prisma.product.findMany({
      where: {
        deletedAt: null,
        ...(companyId ? { companyId } : {})
      },
      include: {
        company: true,
        category: true
      }
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: { category: true }
    });
    if (!product) throw new Error('Producto no encontrado');
    return product;
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}
