import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

export class CreateTenantDto {
  name: string;
  slug: string;
  adminEmail: string;
}

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async register(data: CreateTenantDto) {
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug: data.slug },
    });

    if (existingTenant) {
      throw new ConflictException('A store with this slug already exists');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.adminEmail },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    const hashedPassword = await bcrypt.hash('admin123', 10); // Default password for new stores

    return this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: data.name,
          slug: data.slug,
          subscriptionPlan: 'FREE',
          isSaasEnabled: true,
          settings: {
            create: {
              storeName: data.name,
              currency: 'BRL',
              primaryColor: '#2563eb',
            },
          },
        },
      });

      const user = await tx.user.create({
        data: {
          email: data.adminEmail,
          password: hashedPassword,
          name: 'Store Admin',
          role: 'ADMIN',
          tenantId: tenant.id,
        },
      });

      return { tenant, user };
    });
  }

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
