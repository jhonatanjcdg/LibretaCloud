
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { StockMovementsService } from './stock-movements.service';

@UseGuards(JwtAuthGuard)
@Controller('stock-movements')
export class StockMovementsController {
    constructor(private readonly stockMovementsService: StockMovementsService) { }

    @Post()
    create(@Body() createStockMovementDto: CreateStockMovementDto) {
        return this.stockMovementsService.create(createStockMovementDto);
    }

    @Get()
    findAll(@Query('companyId') companyId: string, @Query('productId') productId?: string) {
        return this.stockMovementsService.findAll(companyId, productId);
    }

    @Get('product/:productId')
    findByProduct(@Query('productId') productId: string) {
        return this.stockMovementsService.findByProduct(productId);
    }
}
