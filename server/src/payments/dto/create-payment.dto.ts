
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
    amount: number;
    method: PaymentMethod;
    date?: Date;
    note?: string;
    invoiceId: string;
    companyId: string;
}
