import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EmailService } from './email.service';

@UseGuards(JwtAuthGuard)
@Controller('email')
export class EmailController {
    constructor(private readonly emailService: EmailService) { }

    @Post('invoice/:id')
    async sendInvoiceEmail(@Param('id') id: string, @Body() body: { toEmail?: string }) {
        return this.emailService.sendInvoiceEmail(id, body.toEmail);
    }
}
