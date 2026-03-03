
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { StockMovementsController } from './stock-movements.controller';
import { StockMovementsService } from './stock-movements.service';

@Module({
    controllers: [StockMovementsController],
    providers: [StockMovementsService, PrismaService],
    exports: [StockMovementsService],
})
export class StockMovementsModule { }
