import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { PdfService } from '../invoices/pdf.service';
import { PrismaService } from '../prisma.service';

@Injectable()
export class EmailService {
    constructor(
        private readonly mailerService: MailerService,
        private readonly pdfService: PdfService,
        private readonly prisma: PrismaService,
    ) { }

    async sendInvoiceEmail(invoiceId: string, toEmail?: string) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { client: true, company: true }
        });

        if (!invoice) throw new Error('Factura no encontrada');

        const recipientEmail = toEmail || invoice.client.email;
        if (!recipientEmail) {
            throw new Error('El cliente no tiene un email configurado para enviar la factura.');
        }

        // Generar PDF
        const pdfBuffer = await this.pdfService.generateInvoicePDF(invoiceId);

        // Nombres amigables para el adjunto
        const documentTypePrefix =
            invoice.type === 'QUOTE' ? 'Cotizacion' :
                invoice.type === 'CREDIT_NOTE' ? 'Nota_Credito' :
                    invoice.type === 'DEBIT_NOTE' ? 'Nota_Debito' : 'Factura';

        const fileName = `${documentTypePrefix}-${invoice.number || invoice.id.slice(0, 8)}.pdf`;
        const companyName = invoice.company?.name || 'Tu Proveedor';

        await this.mailerService.sendMail({
            to: recipientEmail,
            subject: `Documento de ${companyName}: ${documentTypePrefix} #${invoice.number || invoice.id.slice(0, 8)}`,
            text: `Hola ${invoice.client.name},\n\nAdjunto encontrarás tu documento: ${documentTypePrefix} #${invoice.number || invoice.id.slice(0, 8)} expedido por ${companyName}.\n\nSaludos,\nEl equipo de ${companyName}.`,
            attachments: [
                {
                    filename: fileName,
                    content: pdfBuffer,
                    contentType: 'application/pdf',
                },
            ],
        });

        return { success: true, message: `Email enviado con éxito a ${recipientEmail}` };
    }
}
