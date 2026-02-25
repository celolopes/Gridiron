import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async listProducts(tenantId: string) {
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

  async getProduct(tenantId: string, slug: string) {
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
