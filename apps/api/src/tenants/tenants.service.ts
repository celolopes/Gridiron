import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async findBySlug(slug: string) {
    try {
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
    } catch (error) {
      if (process.env.USE_DB_FALLBACK === 'true') {
        console.warn(
          `Database query failed for tenant ${slug}, using dummy fallback.`,
          error.message,
        );
        return this.getDummyTenant(slug);
      }
      throw error;
    }
  }

  private getDummyTenant(slug: string) {
    return {
      id: 'dummy-id',
      name: `Gridiron ${slug.toUpperCase()} Store`,
      slug,
      settings: {
        themeColor: '#1e40af',
        brandName: `Gridiron ${slug.toUpperCase()}`,
        welcomeMessage: `Welcome to Gridiron ${slug.toUpperCase()} Store`,
        logoUrl: '',
        faviconUrl: '',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getSettings(slug: string) {
    const tenant = await this.findBySlug(slug);
    return tenant.settings;
  }
}
