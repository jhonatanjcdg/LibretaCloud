import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscriptionsService } from './subscriptions.service';

@Controller('subscriptions')
export class SubscriptionsController {
    constructor(private readonly subscriptionsService: SubscriptionsService) { }

    @UseGuards(JwtAuthGuard)
    @Post('create-preference')
    async createPreference(@Req() req: any) {
        // En un caso real, req.user.companyId
        const companyId = req.user.companyId;
        return this.subscriptionsService.createSubscriptionPreference(companyId);
    }

    @Post('webhook')
    async webhook(@Body() body: any) {
        // MP no envía JWT, así que esta ruta debe estar abierta
        return this.subscriptionsService.handleWebhook(body);
    }
}
