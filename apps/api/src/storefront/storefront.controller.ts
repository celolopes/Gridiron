import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';

@Controller(':tenantSlug')
export class StorefrontController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
  ) {}

  private async getTenant(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  @Get('storefront')
  async getStorefront(@Param('tenantSlug') slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      include: { settings: true },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      primaryColor: tenant.settings?.primaryColor,
      accentColor: tenant.settings?.accentColor,
      glassOpacity: tenant.settings?.glassOpacity,
      blurIntensity: tenant.settings?.blurIntensity,
    };
  }

  @Get('products')
  async listProducts(@Param('tenantSlug') slug: string) {
    const tenant = await this.getTenant(slug);
    return this.prisma.product.findMany({
      where: {
        tenantId: tenant.id,
        status: 'ACTIVE',
      },
      include: { images: true },
    });
  }

  @Get('products/:productSlug')
  async getProduct(
    @Param('tenantSlug') slug: string,
    @Param('productSlug') productSlug: string,
  ) {
    const tenant = await this.getTenant(slug);
    const product = await this.prisma.product.findFirst({
      where: {
        tenantId: tenant.id,
        slug: productSlug,
        status: 'ACTIVE',
      },
      include: { images: true, variants: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  @Post('orders/request-pix')
  async requestPix(@Param('tenantSlug') slug: string, @Body() body: any) {
    const tenant = await this.getTenant(slug);

    // Create order with requested status
    // Note: In a real app we'd create/find a guest user or use sessionId
    const order = await this.prisma.order.create({
      data: {
        tenantId: tenant.id,
        orderNumber: Math.random().toString(36).substring(7).toUpperCase(),
        total: 0, // Should be calculated
        status: 'REQUESTED_PAYMENT',
        customerEmail: body.customerEmail,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        addressStreet: body.addressStreet,
        addressNumber: body.addressNumber,
        addressCity: body.addressCity,
        addressState: body.addressState,
        addressZipCode: body.addressZipCode,
        items: {
          create: [
            {
              productId: body.productId,
              quantity: 1,
              price: 0, // Should be fetched from product
            },
          ],
        },
      },
    });

    return {
      orderNumber: order.orderNumber,
      status: order.status,
    };
  }
}
