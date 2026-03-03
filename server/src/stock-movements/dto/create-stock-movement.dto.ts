
import { StockMovementType } from '@prisma/client';

export class CreateStockMovementDto {
    productId: string;
    quantity: number;
    type: StockMovementType;
    reason?: string;
    companyId: string;
    invoiceId?: string;
}
