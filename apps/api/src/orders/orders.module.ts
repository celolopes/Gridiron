import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { PublicOrdersController } from './public-orders.controller';
import { OrdersService } from './orders.service';
import { EventsModule } from '../events/events.module';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [EventsModule, TenantsModule],
  controllers: [OrdersController, PublicOrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
