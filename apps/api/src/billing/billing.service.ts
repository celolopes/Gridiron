import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class BillingService {
  private stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const stripeKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.warn(
        '[BillingService] STRIPE_SECRET_KEY not configured. Billing features disabled.',
      );
    }
    this.stripe = new Stripe(stripeKey || '', {
      apiVersion: '2024-06-20',
    });
  }

  /**
   * Get or create a Stripe Customer for the tenant.
   */
  async getOrCreateCustomer(tenantId: string): Promise<string> {
    // Check if tenant already has a subscription record with a Stripe customer
    const existing = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });

    if (existing?.stripeCustomerId) {
      return existing.stripeCustomerId;
    }

    // Fetch tenant to get name and admin email
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { managers: true },
    });

    if (!tenant) throw new NotFoundException('Tenant not found');

    const adminEmail =
      tenant.managers?.[0]?.email || `admin@${tenant.slug}.gridiron.app`;

    // Create Stripe Customer
    const customer = await this.stripe.customers.create({
      name: tenant.name,
      email: adminEmail,
      metadata: {
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
      },
    });

    // Upsert subscription record
    await this.prisma.subscription.upsert({
      where: { tenantId },
      update: { stripeCustomerId: customer.id },
      create: {
        tenantId,
        stripeCustomerId: customer.id,
        status: 'TRIALING',
      },
    });

    return customer.id;
  }

  /**
   * Create a Stripe Checkout Session to start a subscription.
   */
  async createCheckoutSession(
    tenantId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
  ) {
    const customerId = await this.getOrCreateCustomer(tenantId);

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          tenantId,
        },
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        tenantId,
      },
    });

    return { url: session.url, sessionId: session.id };
  }

  /**
   * Create a Stripe Customer Portal session for subscription management.
   */
  async createPortalSession(tenantId: string, returnUrl: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });

    if (!sub?.stripeCustomerId) {
      throw new BadRequestException(
        'No active subscription found. Subscribe first.',
      );
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: returnUrl,
    });

    return { url: session.url };
  }

  /**
   * Get current billing status for a tenant.
   */
  async getBillingStatus(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    const sub = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });

    return {
      plan: tenant?.subscriptionPlan || 'FREE',
      status: sub?.status || 'CANCELED',
      currentPeriodEnd: sub?.currentPeriodEnd,
      trialEndsAt: sub?.trialEndsAt,
      canceledAt: sub?.canceledAt,
      hasActiveSubscription:
        sub?.status === 'ACTIVE' || sub?.status === 'TRIALING',
    };
  }

  /**
   * Handle a Stripe webhook event.
   */
  async handleWebhookEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const tenantId = session.metadata?.tenantId;
        if (tenantId && session.subscription) {
          await this.activateSubscription(
            tenantId,
            session.subscription as string,
          );
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        if (subscriptionId) {
          await this.syncSubscriptionFromStripe(subscriptionId);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        if (subscriptionId) {
          await this.syncSubscriptionFromStripe(subscriptionId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.syncSubscriptionFromStripe(subscription.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.cancelSubscription(subscription.id);
        break;
      }

      default:
        console.log(`[BillingService] Unhandled event type: ${event.type}`);
    }
  }

  private async activateSubscription(
    tenantId: string,
    stripeSubscriptionId: string,
  ) {
    const stripeSubscription =
      await this.stripe.subscriptions.retrieve(stripeSubscriptionId);

    await this.prisma.subscription.update({
      where: { tenantId },
      data: {
        stripeSubscriptionId,
        stripePriceId: stripeSubscription.items.data[0]?.price?.id,
        status: 'ACTIVE',
        currentPeriodStart: new Date(
          stripeSubscription.current_period_start * 1000,
        ),
        currentPeriodEnd: new Date(
          stripeSubscription.current_period_end * 1000,
        ),
        trialEndsAt: stripeSubscription.trial_end
          ? new Date(stripeSubscription.trial_end * 1000)
          : null,
      },
    });

    // Upgrade tenant plan
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { subscriptionPlan: 'PRO' },
    });

    console.log(`[BillingService] Tenant ${tenantId} upgraded to PRO`);
  }

  private async syncSubscriptionFromStripe(stripeSubscriptionId: string) {
    const stripeSubscription =
      await this.stripe.subscriptions.retrieve(stripeSubscriptionId);

    const sub = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId },
    });

    if (!sub) {
      console.warn(
        `[BillingService] No local subscription for Stripe ID ${stripeSubscriptionId}`,
      );
      return;
    }

    const statusMap: Record<string, string> = {
      active: 'ACTIVE',
      trialing: 'TRIALING',
      past_due: 'PAST_DUE',
      canceled: 'CANCELED',
      unpaid: 'UNPAID',
    };

    const newStatus = statusMap[stripeSubscription.status] || 'CANCELED';

    await this.prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: newStatus as any,
        currentPeriodStart: new Date(
          stripeSubscription.current_period_start * 1000,
        ),
        currentPeriodEnd: new Date(
          stripeSubscription.current_period_end * 1000,
        ),
        trialEndsAt: stripeSubscription.trial_end
          ? new Date(stripeSubscription.trial_end * 1000)
          : null,
      },
    });

    // Update tenant plan based on status
    const plan =
      newStatus === 'ACTIVE' || newStatus === 'TRIALING' ? 'PRO' : 'FREE';
    await this.prisma.tenant.update({
      where: { id: sub.tenantId },
      data: { subscriptionPlan: plan },
    });
  }

  private async cancelSubscription(stripeSubscriptionId: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId },
    });

    if (!sub) return;

    await this.prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
      },
    });

    // Downgrade tenant to FREE
    await this.prisma.tenant.update({
      where: { id: sub.tenantId },
      data: { subscriptionPlan: 'FREE' },
    });

    console.log(`[BillingService] Tenant ${sub.tenantId} downgraded to FREE`);
  }
}
