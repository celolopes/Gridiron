import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { IsString, IsEmail, MinLength, Matches } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  slug: string;

  @IsEmail()
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

    // If a user exists, we will reuse them and grant them access to this new store.

    console.log('[TenantsService] Hashing default password...');
    const hashedPassword = await bcrypt.hash('admin123', 10); // Default password for new stores
    console.log('[TenantsService] Password hashed.');

    try {
      return await this.prisma.$transaction(
        async (tx) => {
          console.log(
            `[TenantsService] Starting registration for: ${data.slug}`,
          );
          const tenant = await tx.tenant.create({
            data: {
              name: data.name,
              slug: data.slug,
              subscriptionPlan: 'FREE',
              isSaasEnabled: true,
              settings: {
                create: {
                  brandName: data.name,
                  // Removed 'currency' as it doesn't exist in the schema yet
                  primaryColor: '#000000',
                  accentColor: '#0a84ff',
                  themeMode: 'dark',
                  glassOpacity: 0.12,
                  blurIntensity: 20,
                },
              },
            },
          });
          console.log(`[TenantsService] Tenant created: ${tenant.id}`);

          if (existingUser) {
            // Add existing user to the new store's managers
            await tx.user.update({
              where: { email: data.adminEmail },
              data: {
                managedStores: {
                  connect: { id: tenant.id },
                },
              },
            });
            console.log(`[TenantsService] Admin user linked to new store`);
          } else {
            // Create new user and link them as manager
            await tx.user.create({
              data: {
                email: data.adminEmail,
                password: hashedPassword,
                name: 'Store Admin',
                role: 'ADMIN',
                managedStores: {
                  connect: { id: tenant.id },
                },
              },
            });
            console.log(`[TenantsService] Admin user created`);
          }

          // Seed Example Products (Elite Collection)
          const eliteProducts = [
            {
              name: 'Jersey Kansas City Home - Mahomes #15',
              price: 499.9,
              category: 'Jerseys',
              image:
                'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&q=80&w=1000',
              description:
                'Jersey oficial modelo Home do quarterback Patrick Mahomes. Material premium com tecnologia de ventilação.',
            },
            {
              name: 'Jersey Philadelphia Home - Hurts #1',
              price: 479.9,
              category: 'Jerseys',
              image:
                'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&q=80&w=1000',
              description:
                'A armadura dos Eagles. Versão oficial de jogador com detalhes bordados e tecido ultra-resistente.',
            },
            {
              name: 'Jersey Cincinnati Home - Burrow #9',
              price: 489.9,
              category: 'Jerseys',
              image:
                'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1000',
              description:
                'Modelo clássico dos Bengals. Conforto excepcional para o dia a dia e para o estádio.',
            },
          ];

          for (const item of eliteProducts) {
            await tx.product.create({
              data: {
                name: item.name,
                description: item.description,
                price: item.price,
                costPrice: item.price * 0.4,
                tenantId: tenant.id,
                category: item.category,
                images: {
                  create: [{ url: item.image, position: 0 }],
                },
              },
            });
          }

          console.log(
            `[TenantsService] Seeded ${eliteProducts.length} elite products`,
          );

          return { tenant };
        },
        {
          timeout: 20000, // Increase timeout to 20s for the seeding process
        },
      );
    } catch (error) {
      console.error('[TenantsService] Registration failed:', error);
      throw error;
    }
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

  async findByAdminEmail(email: string) {
    let user = await this.prisma.user.findUnique({
      where: { email },
      include: { managedStores: true, tenant: true },
    });

    if (!user) {
      throw new NotFoundException(`No tenant found for user email: ${email}`);
    }

    // Backfill legacy users: if they have a tenantId but no managedStores
    if (user.managedStores.length === 0 && user.tenantId && user.tenant) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          managedStores: {
            connect: { id: user.tenantId },
          },
        },
      });
      console.log(
        `[TenantsService] Backfilled managedStores for legacy user ${email}`,
      );
      return [user.tenant];
    }

    if (user.managedStores.length === 0) {
      throw new NotFoundException(`No tenant found for user email: ${email}`);
    }

    return user.managedStores;
  }

  async getSettings(slug: string) {
    const tenant = await this.findBySlug(slug);
    return tenant.settings;
  }

  async updateSettings(slug: string, data: Record<string, any>) {
    const tenant = await this.findBySlug(slug);
    if (!tenant.settings) {
      throw new NotFoundException('Settings not found for tenant');
    }
    const allowedFields = [
      'brandName',
      'logoUrl',
      'heroImageUrl',
      'primaryColor',
      'accentColor',
      'themeMode',
      'glassOpacity',
      'blurIntensity',
    ];
    const updateData: Record<string, any> = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        updateData[key] = data[key];
      }
    }
    return this.prisma.tenantSettings.update({
      where: { id: tenant.settings.id },
      data: updateData,
    });
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
    await this.findBySlug(slug);
    return this.prisma.supplier.findMany({});
  }

  async createSupplier(slug: string, data: any) {
    await this.findBySlug(slug);
    return this.prisma.supplier.create({
      data: {
        name: data.name,
        contactEmail: data.contactEmail,
        leadTimeDays: data.leadTimeDays,
        supportsDropshipping: data.supportsDropshipping,
      },
    });
  }

  async updateSupplier(slug: string, supplierId: string, data: any) {
    await this.findBySlug(slug);
    return this.prisma.supplier.update({
      where: { id: supplierId },
      data: {
        name: data.name,
        contactEmail: data.contactEmail,
        leadTimeDays: data.leadTimeDays,
        supportsDropshipping: data.supportsDropshipping,
      },
    });
  }
}
