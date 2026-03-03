
import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsService } from './payments.service';

@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post()
    create(@Body() createPaymentDto: CreatePaymentDto) {
        return this.paymentsService.create(createPaymentDto);
    }

    @Get()
    findAll(@Query('companyId') companyId: string) {
        return this.paymentsService.findAll(companyId);
    }

    @Get('invoice/:invoiceId')
    findByInvoice(@Param('invoiceId') invoiceId: string) {
        return this.paymentsService.findByInvoice(invoiceId);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.paymentsService.remove(id);
    }
}
