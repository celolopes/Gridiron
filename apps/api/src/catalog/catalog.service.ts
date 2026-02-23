import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async listProducts(tenantId: string) {
    try {
      return await this.prisma.product.findMany({
        where: {
          tenantId,
        },
        include: {
          images: true,
          variants: true,
        },
      });
    } catch (error) {
      if (process.env.USE_DB_FALLBACK === 'true') {
        console.warn(
          `Database query failed for products of tenant ${tenantId}, using dummy fallback.`,
          error.message,
        );
        return [
          {
            id: 'dummy-p1',
            name: 'Classic Gridiron Jersey',
            slug: 'classic-jersey',
            description: 'A premium gridiron jersey for champions.',
            price: 89.99,
            images: [],
            variants: [{ id: 'v1', name: 'Large', price: 89.99, stock: 10 }],
          },
        ];
      }
      throw error;
    }
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
