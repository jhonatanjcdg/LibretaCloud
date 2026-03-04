import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { PdfService } from './pdf.service';

@Module({
  controllers: [InvoicesController],
  providers: [InvoicesService, PrismaService, PdfService],
  exports: [PdfService]
})
export class InvoicesModule { }
