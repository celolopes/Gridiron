import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('public/orders')
export class PublicOrdersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':orderNumber')
  async getOrderByNumber(@Param('orderNumber') orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        orderItems: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: true,
                  },
                },
              },
            },
          },
        },
        tenant: {
          include: {
            settings: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Sanitize output for public view
    return {
      orderNumber: order.orderNumber,
      status: order.status,
      customerName: order.customerName,
      totalAmount: order.totalAmount,
      shippingAmount: order.shippingAmount,
      createdAt: order.createdAt,
      items: order.orderItems.map((item) => ({
        name: item.variant.product.name,
        variant: item.variant.name,
        quantity: item.quantity,
        price: item.price,
        image: item.variant.product.images[0]?.url,
      })),
      tenant: {
        name: order.tenant.name,
        brandName: order.tenant.settings?.brandName,
        logoUrl: order.tenant.settings?.logoUrl,
        primaryColor: order.tenant.settings?.primaryColor,
      },
    };
  }
}
