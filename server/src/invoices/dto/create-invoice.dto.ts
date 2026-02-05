
export class CreateInvoiceItemDto {
    productId: string;
    quantity: number;
}

export class CreateInvoiceDto {
    clientId: string;
    companyId: string;
    items: CreateInvoiceItemDto[];
    dueDate?: string;
    status?: string; // DRAFT, ISSUED, PAID, CANCELLED
}
