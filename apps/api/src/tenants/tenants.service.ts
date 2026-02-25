import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async findBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      include: {
        settings: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with slug ${slug} not found`);
    }

    return tenant;
  }

  async getSettings(slug: string) {
    const tenant = await this.findBySlug(slug);
    return tenant.settings;
  }

  async getPlanLimits(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) throw new NotFoundException('Tenant not found');

    const PLAN_LIMITS = {
      FREE: { maxProducts: 10, maxOrdersPerMonth: 50 },
      PRO: { maxProducts: 200, maxOrdersPerMonth: 1000 },
      ENTERPRISE: { maxProducts: 10000, maxOrdersPerMonth: 100000 },
    };

    const plan = tenant.subscriptionPlan as keyof typeof PLAN_LIMITS;
    return PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;
  }

  async canAddProduct(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant?.isSaasEnabled) return true; // Disabled for Mode A (Individual Stores)

    const limits = await this.getPlanLimits(tenantId);
    const productCount = await this.prisma.product.count({
      where: { tenantId },
    });

    return productCount < limits.maxProducts;
  }

  async listSuppliersBySlug(slug: string) {
    const tenant = await this.findBySlug(slug);
    return this.prisma.supplier.findMany({
      where: {
        // In a shared marketplace mode, we might list all.
        // For individual mode, we list those linked to tenant or all if global.
        // For now, let's list all as partners.
      },
    });
  }
}
