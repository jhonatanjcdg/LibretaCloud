
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import * as PDFDocument from 'pdfkit';
import axios from 'axios';

@Injectable()
export class PdfService {
    constructor(private prisma: PrismaService) { }

    async generateInvoicePDF(invoiceId: string): Promise<Buffer> {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                client: true,
                company: true,
                items: { include: { product: true } }
            }
        });

        if (!invoice) {
            throw new Error('Invoice not found');
        }

        let logoBuffer: Buffer | null = null;
        if (invoice.company?.logoUrl) {
            try {
                const response = await axios.get(invoice.company.logoUrl, { responseType: 'arraybuffer' });
                logoBuffer = Buffer.from(response.data);
            } catch (e) {
                console.error("Could not fetch logo image from URL", e);
            }
        }

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve(pdfBuffer);
            });
            doc.on('error', reject);

            // Logo and Header
            if (logoBuffer) {
                try {
                    doc.image(logoBuffer, 50, 40, { width: 60 });
                } catch (e) {
                    console.error("Could not add logo buffer to PDF", e);
                }
            }

            doc
                .fontSize(20)
                .text('FACTURA ELECTRÓNICA', 120, 50, { align: 'right' })
                .fontSize(10)
                .text(`Factura #${invoice.number || invoice.id.slice(0, 8)}`, 120, 80, { align: 'right' })
                .text(`Fecha: ${new Date(invoice.createdAt).toLocaleDateString('es-ES')}`, 120, 95, { align: 'right' });

            // Company Info
            doc
                .fontSize(12)
                .text('DE:', 50, 130)
                .fontSize(10)
                .text(invoice.company?.name || 'Tu Empresa', 50, 145)
                .text(`NIT: ${invoice.company?.nit || 'N/A'}`, 50, 160)
                .text(invoice.company?.address || '', 50, 175)
                .text(`Tel: ${invoice.company?.phone || ''} | ${invoice.company?.email || ''}`, 50, 190)
                .text(invoice.company?.website || '', 50, 205);

            // Client Info
            doc
                .fontSize(12)
                .text('PARA:', 350, 130)
                .fontSize(10)
                .text(invoice.client.name, 350, 145)
                .text(`NIT: ${invoice.client.nit || 'N/A'}`, 350, 160)
                .text(invoice.client.address || '', 350, 175)
                .text(invoice.client.email || '', 350, 190);

            // Line separator
            doc
                .moveTo(50, 220)
                .lineTo(550, 220)
                .stroke();

            // Table Header
            let yPosition = 240;
            doc
                .fontSize(10)
                .text('PRODUCTO/SERVICIO', 50, yPosition, { width: 200 })
                .text('CANT.', 260, yPosition, { width: 50 })
                .text('PRECIO', 320, yPosition, { width: 80 })
                .text('IMPUESTO', 410, yPosition, { width: 70 })
                .text('TOTAL', 490, yPosition, { width: 80, align: 'right' });

            yPosition += 20;
            doc
                .moveTo(50, yPosition)
                .lineTo(550, yPosition)
                .stroke();

            // Table Items
            yPosition += 10;
            invoice.items.forEach((item) => {
                yPosition += 15;
                doc
                    .fontSize(9)
                    .text(item.product?.name || 'Producto', 50, yPosition, { width: 200 })
                    .text(item.quantity.toString(), 260, yPosition, { width: 50 })
                    .text(`$${Number(item.price).toFixed(2)}`, 320, yPosition, { width: 80 })
                    .text(`$${Number(item.tax).toFixed(2)}`, 410, yPosition, { width: 70 })
                    .text(`$${Number(item.total).toFixed(2)}`, 490, yPosition, { width: 80, align: 'right' });

                if (item.product?.description) {
                    yPosition += 12;
                    doc
                        .fontSize(8)
                        .fillColor('#666')
                        .text(item.product.description, 50, yPosition, { width: 200 })
                        .fillColor('#000');
                }
            });

            // Totals
            yPosition += 30;
            doc
                .moveTo(350, yPosition)
                .lineTo(550, yPosition)
                .stroke();

            yPosition += 15;
            doc
                .fontSize(10)
                .text('Subtotal:', 350, yPosition)
                .text(`$${Number(invoice.subtotal).toFixed(2)}`, 490, yPosition, { width: 80, align: 'right' });

            yPosition += 20;
            doc
                .text('Impuestos:', 350, yPosition)
                .text(`$${Number(invoice.tax).toFixed(2)}`, 490, yPosition, { width: 80, align: 'right' });

            yPosition += 20;
            doc
                .fontSize(12)
                .text('TOTAL:', 350, yPosition)
                .text(`$${Number(invoice.total).toFixed(2)}`, 490, yPosition, { width: 80, align: 'right' });

            // Footer
            doc
                .fontSize(8)
                .fillColor('#999')
                .text('Gracias por su preferencia. Esta es una factura electrónica válida.', 50, 700, { align: 'center' })
                .text(`Estado: ${invoice.status}`, 50, 715, { align: 'center' });

            doc.end();
        });
    }
}
