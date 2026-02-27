import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { TenantsService } from '../tenants/tenants.service';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly tenantsService: TenantsService,
  ) {}

  /**
   * POST /billing/checkout
   * Initiates a Stripe Checkout Session to subscribe to a plan.
   */
  @Post('checkout')
  @UseGuards(AuthGuard)
  async createCheckout(
    @Body()
    body: {
      tenantSlug: string;
      priceId: string;
      successUrl: string;
      cancelUrl: string;
    },
  ) {
    const tenant = await this.tenantsService.findBySlug(body.tenantSlug);
    return this.billingService.createCheckoutSession(
      tenant.id,
      body.priceId,
      body.successUrl,
      body.cancelUrl,
    );
  }

  /**
   * POST /billing/portal
   * Creates a Stripe Customer Portal session for subscription management.
   */
  @Post('portal')
  @UseGuards(AuthGuard)
  async createPortal(@Body() body: { tenantSlug: string; returnUrl: string }) {
    const tenant = await this.tenantsService.findBySlug(body.tenantSlug);
    return this.billingService.createPortalSession(tenant.id, body.returnUrl);
  }

  /**
   * GET /billing/status/:tenantSlug
   * Returns current billing status for a tenant.
   */
  @Get('status/:tenantSlug')
  @UseGuards(AuthGuard)
  async getBillingStatus(@Param('tenantSlug') tenantSlug: string) {
    const tenant = await this.tenantsService.findBySlug(tenantSlug);
    return this.billingService.getBillingStatus(tenant.id);
  }
}
