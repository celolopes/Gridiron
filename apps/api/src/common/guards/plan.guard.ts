import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

export const REQUIRED_PLAN_KEY = 'requiredPlan';

/**
 * Decorator to restrict endpoint access by subscription plan.
 * Usage: @RequiresPlan('PRO') or @RequiresPlan('ENTERPRISE')
 */
export const RequiresPlan = (...plans: string[]) =>
  SetMetadata(REQUIRED_PLAN_KEY, plans);

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPlans = this.reflector.getAllAndOverride<string[]>(
      REQUIRED_PLAN_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no plan requirement is set, allow access
    if (!requiredPlans || requiredPlans.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const tenantSlug = request.params.tenantSlug || request.params.slug;

    if (!tenantSlug) {
      return true; // No tenant context, skip plan check
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      throw new ForbiddenException('Tenant not found');
    }

    // Skip plan check if SaaS mode is disabled for this tenant
    if (!tenant.isSaasEnabled) {
      return true;
    }

    const PLAN_HIERARCHY: Record<string, number> = {
      FREE: 0,
      PRO: 1,
      ENTERPRISE: 2,
    };

    const tenantPlanLevel = PLAN_HIERARCHY[tenant.subscriptionPlan] ?? 0;
    const minRequiredLevel = Math.min(
      ...requiredPlans.map((p) => PLAN_HIERARCHY[p] ?? 0),
    );

    if (tenantPlanLevel < minRequiredLevel) {
      throw new ForbiddenException(
        `Este recurso requer o plano ${requiredPlans.join(' ou ')}. Seu plano atual é ${tenant.subscriptionPlan}. Faça upgrade para continuar.`,
      );
    }

    return true;
  }
}
