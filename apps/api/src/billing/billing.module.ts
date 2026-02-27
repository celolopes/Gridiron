import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { WebhookController } from './webhook.controller';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [ConfigModule, TenantsModule],
  controllers: [BillingController, WebhookController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
