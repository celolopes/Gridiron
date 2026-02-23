import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TenantsModule } from './tenants/tenants.module';
import { CatalogModule } from './catalog/catalog.module';
import { OrdersModule } from './orders/orders.module';
import { EventsModule } from './events/events.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { EmailModule } from './email/email.module';
import { AdminModule } from './admin/admin.module';

import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    AdminModule,
    TenantsModule,
    CatalogModule,
    OrdersModule,
    EventsModule,
    AnalyticsModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
