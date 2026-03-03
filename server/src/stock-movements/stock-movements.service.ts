
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';

@Injectable()
export class StockMovementsService {
    constructor(private prisma: PrismaService) { }

    async create(createStockMovementDto: CreateStockMovementDto) {
        return this.prisma.stockMovement.create({
            data: createStockMovementDto,
        });
    }

    async findAll(companyId: string, productId?: string) {
        return this.prisma.stockMovement.findMany({
            where: {
                companyId,
                ...(productId && { productId }),
            },
            include: {
                product: true,
                invoice: true,
            },
            orderBy: { date: 'desc' },
        });
    }

    async findByProduct(productId: string) {
        return this.prisma.stockMovement.findMany({
            where: { productId },
            include: { invoice: true },
            orderBy: { date: 'desc' },
        });
    }
}
