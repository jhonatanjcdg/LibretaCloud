import { Injectable } from '@nestjs/common';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SubscriptionsService {
    private client: MercadoPagoConfig;

    constructor(private prisma: PrismaService) {
        // Inicializa Mercado Pago con el Access Token
        this.client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '' });
    }

    async createSubscriptionPreference(companyId: string) {
        const company = await this.prisma.company.findUnique({ where: { id: companyId } });
        if (!company) throw new Error('Company not found');

        const preference = new Preference(this.client);

        const response = await preference.create({
            body: {
                items: [
                    {
                        id: 'PRO_SUBSCRIPTION',
                        title: 'LibretaCloud Pro (Suscripción Mensual)',
                        quantity: 1,
                        unit_price: 25000, // Ej. $25.000 COP
                        currency_id: 'COP',
                    }
                ],
                payer: {
                    email: company.email || 'correo_temporal@ejemplo.com',
                },
                back_urls: {
                    success: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/settings?payment=success`,
                    failure: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/settings?payment=failure`,
                    pending: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/settings?payment=pending`,
                },
                auto_return: 'approved',
                external_reference: companyId, // Muy importante para el Webhook
            }
        });

        // Retornar la URL de inicio del flujo de pago
        return { init_point: response.init_point };
    }

    async handleWebhook(body: any) {
        // En una app real de MP, deberíamos verificar que notamos el pago o buscar la MerchantOrder
        // Por simplificar en este MVP: asumimos que data.id trae la info
        if (body.type === 'payment' && body.data?.id) {
            // Buscamos el pago en MP
            const fetchResponse = await fetch(`https://api.mercadopago.com/v1/payments/${body.data.id}`, {
                headers: { Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}` }
            });

            if (fetchResponse.ok) {
                const paymentInfo = await fetchResponse.json();

                if (paymentInfo.status === 'approved') {
                    const companyId = paymentInfo.external_reference;
                    if (companyId) {
                        // Activar suscripción
                        await this.prisma.company.update({
                            where: { id: companyId },
                            data: {
                                subscriptionStatus: 'ACTIVE',
                                subscriptionEndDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), // + 1 mes
                            }
                        });
                    }
                }
            }
        }
        return { received: true };
    }
}
