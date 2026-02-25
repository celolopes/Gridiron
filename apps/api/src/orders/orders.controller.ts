import { Controller, Post, Get, Patch, Param, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('tenants/:tenantId/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(
    @Param('tenantId') tenantId: string,
    @Body() body: CreateOrderDto,
    // Note: userId could come from auth guard in future. For now, we take it from Body if exists or set to null
  ) {
    const userId = (body as any).userId || null;
    return this.ordersService.createOrder(tenantId, userId, body);
  }

  @Get()
  async listAdminOrders(@Param('tenantId') tenantId: string) {
    return this.ordersService.listAdminOrders(tenantId);
  }

  @Patch(':id/payment-link')
  async setPaymentLink(
    @Param('tenantId') tenantId: string,
    @Param('id') orderId: string,
    @Body('url') url: string,
  ) {
    return this.ordersService.updateOrderLink(tenantId, orderId, url);
  }

  @Patch(':id/mark-paid')
  async markAsPaid(
    @Param('tenantId') tenantId: string,
    @Param('id') orderId: string,
  ) {
    return this.ordersService.markAsPaid(tenantId, orderId);
  }

  @Patch(':id/forward-to-supplier')
  async forwardToSupplier(
    @Param('tenantId') tenantId: string,
    @Param('id') orderId: string,
  ) {
    return this.ordersService.forwardToSupplier(tenantId, orderId);
  }
}
