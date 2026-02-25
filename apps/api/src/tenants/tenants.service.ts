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

    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    const hashedPassword = await bcrypt.hash('admin123', 10); // Default password for new stores

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

          await tx.user.create({
            data: {
              email: data.adminEmail,
              password: hashedPassword,
              name: 'Store Admin',
              role: 'ADMIN',
              tenantId: tenant.id,
            },
          });
          console.log(`[TenantsService] Admin user created`);

          // Seeding initial "Elite" products for the client
          const initialProducts = [
            {
              name: 'Home Jersey Elite 24/25',
              slug: 'home-jersey-24-25',
              price: 349.9,
              description:
                'A armadura oficial para os jogos em casa. Tecido ultra-respirável com tecnologia de absorção de suor e detalhes bordados em alta definição.',
              image:
                'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?q=80&w=1000&auto=format&fit=crop',
            },
            {
              name: 'Away Jersey Legend Series',
              slug: 'away-jersey-legend',
              price: 329.9,
              description:
                'Design clássico inspirado nas grandes vitórias históricas. O equilíbrio perfeito entre nostalgia e performance moderna.',
              image:
                'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1000&auto=format&fit=crop',
            },
            {
              name: 'Pro Training Hoodie - Stealth',
              slug: 'training-hoodie-stealth',
              price: 249.9,
              description:
                'Ideal para treinos em dias frios ou para compor seu estilo lifestyle com a identidade do futebol americano.',
              image:
                'https://images.unsplash.com/photo-1510283310217-18751336427d?q=80&w=1000&auto=format&fit=crop',
            },
            {
              name: 'Elite Match Gloves',
              slug: 'elite-match-gloves',
              price: 189.9,
              description:
                'Grip superior em todas as condições climáticas. Usada pelos profissionais para garantir aquela recepção decisiva.',
              image:
                'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1000&auto=format&fit=crop',
            },
          ];

          for (const p of initialProducts) {
            await tx.product.create({
              data: {
                tenantId: tenant.id,
                name: p.name,
                slug: `${data.slug}-${p.slug}`,
                price: p.price,
                description: p.description,
                images: {
                  create: { url: p.image },
                },
                variants: {
                  create: {
                    name: 'Padrão',
                    sku: `${data.slug}-${p.slug}-std`,
                    inventory: {
                      create: { available: 50 },
                    },
                  },
                },
              },
            });
          }
          console.log(`[TenantsService] Products seeded successfully`);

          return { tenant };
        },
        {
          timeout: 15000, // Increase timeout to 15s for the seeding process
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
