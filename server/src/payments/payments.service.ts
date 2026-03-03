
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
    constructor(private prisma: PrismaService) { }

    async create(createPaymentDto: CreatePaymentDto) {
        const { invoiceId } = createPaymentDto;
        return this.prisma.$transaction(async (tx) => {
            // 1. Create the payment
            const payment = await tx.payment.create({
                data: createPaymentDto,
            });

            // 2. Get the invoice and all its payments to update status
            const invoice = await tx.invoice.findUnique({
                where: { id: invoiceId },
                include: { payments: true },
            });

            if (!invoice) throw new NotFoundException('Factura no encontrada');

            const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
            const invoiceTotal = Number(invoice.total);

            let newStatus: any = 'ISSUED';
            if (totalPaid >= invoiceTotal) {
                newStatus = 'PAID';
            } else if (totalPaid > 0) {
                newStatus = 'PARTIAL';
            }

            if (invoice.status !== 'CANCELLED' && invoice.status !== 'DRAFT') {
                await tx.invoice.update({
                    where: { id: invoiceId },
                    data: { status: newStatus },
                });
            }

            return payment;
        });
    }

    async findAll(companyId: string) {
        return this.prisma.payment.findMany({
            where: { companyId },
            include: { invoice: true },
            orderBy: { date: 'desc' },
        });
    }

    async findByInvoice(invoiceId: string) {
        return this.prisma.payment.findMany({
            where: { invoiceId },
            orderBy: { date: 'desc' },
        });
    }

    async remove(id: string) {
        return this.prisma.$transaction(async (tx) => {
            const payment = await tx.payment.findUnique({
                where: { id },
            });
            if (!payment) throw new NotFoundException('Pago no encontrado');

            const invoiceId = payment.invoiceId;
            await tx.payment.delete({ where: { id } });

            // Update invoice status after deletion
            const invoice = await tx.invoice.findUnique({
                where: { id: invoiceId },
                include: { payments: true },
            });

            if (invoice && invoice.status !== 'CANCELLED' && invoice.status !== 'DRAFT') {
                const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
                const invoiceTotal = Number(invoice.total);

                let newStatus: any = 'ISSUED';
                if (totalPaid >= invoiceTotal) {
                    newStatus = 'PAID';
                } else if (totalPaid > 0) {
                    newStatus = 'PARTIAL';
                }

                await tx.invoice.update({
                    where: { id: invoiceId },
                    data: { status: newStatus },
                });
            }

            return payment;
        });
    }
}
