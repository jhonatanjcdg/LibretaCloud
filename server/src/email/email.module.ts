import { Module } from '@nestjs/common';
import { InvoicesModule } from '../invoices/invoices.module';
import { PrismaService } from '../prisma.service';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';

@Module({
    imports: [InvoicesModule],
    controllers: [EmailController],
    providers: [EmailService, PrismaService],
    exports: [EmailService]
})
export class EmailModule { }
