import { Module } from '@nestjs/common';
import { StorefrontController } from './storefront.controller';
import { GlobalEventsController } from './global-events.controller';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [OrdersModule],
  controllers: [StorefrontController, GlobalEventsController],
})
export class StorefrontModule {}
