import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { PrismaService } from 'src/prisma.service';
import { PdfService } from './pdf.service';

@Module({
  controllers: [InvoicesController],
  providers: [InvoicesService, PrismaService, PdfService],
})
export class InvoicesModule { }
