
export class CreateCompanyDto {
    name: string;
    nit: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    logoUrl?: string;
    defaultTaxRate?: number;
}
