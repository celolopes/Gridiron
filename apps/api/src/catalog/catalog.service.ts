import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveTenantId(idOrSlug: string): Promise<string> {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(idOrSlug)) {
      return idOrSlug;
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: idOrSlug },
    });

    if (!tenant) {
      throw new Error(`Tenant with slug or ID ${idOrSlug} not found`);
    }

    return tenant.id;
  }

  async listProducts(idOrSlug: string) {
    const tenantId = await this.resolveTenantId(idOrSlug);
    return await this.prisma.product.findMany({
      where: {
        tenantId,
      },
      include: {
        images: true,
        variants: {
          include: {
            inventory: true,
          },
        },
        demandScores: true,
      },
    });
  }

  async getProduct(idOrSlug: string, slug: string) {
    const tenantId = await this.resolveTenantId(idOrSlug);
    const product = await this.prisma.product.findFirst({
      where: { tenantId, slug },
      include: {
        images: true,
        variants: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    return product;
  }
}
