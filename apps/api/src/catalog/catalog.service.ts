import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantsService } from '../tenants/tenants.service';

@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantsService: TenantsService,
  ) {}

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

  async getProduct(idOrSlug: string, slugOrId: string) {
    const tenantId = await this.resolveTenantId(idOrSlug);
    const product = await this.prisma.product.findFirst({
      where: {
        tenantId,
        OR: [{ slug: slugOrId }, { id: slugOrId }],
      },
      include: {
        images: true,
        variants: {
          include: {
            inventory: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product not found`);
    }

    return product;
  }

  async createProduct(idOrSlug: string, data: any) {
    const tenantId = await this.resolveTenantId(idOrSlug);

    // Enforce plan limits
    const canAdd = await this.tenantsService.canAddProduct(tenantId);
    if (!canAdd) {
      const limits = await this.tenantsService.getPlanLimits(tenantId);
      throw new ForbiddenException(
        `Limite de produtos atingido (${limits.maxProducts}). Faça upgrade do seu plano para adicionar mais produtos.`,
      );
    }

    const slug =
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');

    return this.prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        price: parseFloat(data.price),
        costPrice: data.costPrice ? parseFloat(data.costPrice) : undefined,
        category: data.category,
        tenantId,
        images: {
          create: data.images?.map((url: string) => ({ url })) || [],
        },
      },
    });
  }

  async updateProduct(idOrSlug: string, id: string, data: any) {
    const tenantId = await this.resolveTenantId(idOrSlug);

    // Ensure we are only updating product belonging to this tenant
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
    });
    if (!product) throw new NotFoundException('Product not found in this shop');

    return this.prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price ? parseFloat(data.price) : undefined,
        costPrice: data.costPrice ? parseFloat(data.costPrice) : undefined,
        category: data.category,
        images: data.images
          ? {
              deleteMany: {},
              create: data.images.map((url: string) => ({ url })),
            }
          : undefined,
      },
    });
  }

  async deleteProduct(idOrSlug: string, id: string) {
    const tenantId = await this.resolveTenantId(idOrSlug);
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
    });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.product.delete({ where: { id } });
  }
}
