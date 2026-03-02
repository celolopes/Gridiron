import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { PublicOrdersController } from './public-orders.controller';
import { OrdersService } from './orders.service';
import { EventsModule } from '../events/events.module';
import { TenantsModule } from '../tenants/tenants.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EventsModule, TenantsModule, EmailModule],
  controllers: [OrdersController, PublicOrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
