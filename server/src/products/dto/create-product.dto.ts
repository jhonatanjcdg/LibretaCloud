
export class CreateProductDto {
    name: string;
    description?: string;
    sku?: string;
    price: number;
    stock: number;
    taxRate: number;
    companyId: string;
}
