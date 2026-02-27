import {
  Controller,
  Post,
  Req,
  RawBodyRequest,
  BadRequestException,
  Headers,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BillingService } from './billing.service';
import { Request } from 'express';
import Stripe from 'stripe';

@Controller('webhooks')
export class WebhookController {
  private stripe: Stripe;

  constructor(
    private readonly billingService: BillingService,
    private readonly config: ConfigService,
  ) {
    this.stripe = new Stripe(
      this.config.get<string>('STRIPE_SECRET_KEY') || '',
      {
        apiVersion: '2024-12-18.acacia',
      },
    );
  }

  /**
   * POST /webhooks/stripe
   * Receives and processes Stripe webhook events.
   * Must be configured with raw body parsing for signature verification.
   */
  @Post('stripe')
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      throw new BadRequestException('Stripe webhook secret not configured');
    }

    let event: Stripe.Event;

    try {
      const rawBody = req.rawBody;
      if (!rawBody) {
        throw new BadRequestException('No raw body available');
      }

      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err: any) {
      console.error(
        '[WebhookController] Signature verification failed:',
        err.message,
      );
      throw new BadRequestException(
        `Webhook signature verification failed: ${err.message}`,
      );
    }

    console.log(`[WebhookController] Received event: ${event.type}`);

    await this.billingService.handleWebhookEvent(event);

    return { received: true };
  }
}
