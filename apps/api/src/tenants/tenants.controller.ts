import { Controller, Get, Param } from '@nestjs/common';
import { TenantsService } from './tenants.service';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get(':slug')
  async getTenantBySlug(@Param('slug') slug: string) {
    return this.tenantsService.findBySlug(slug);
  }

  @Get(':slug/settings')
  async getTenantSettings(@Param('slug') slug: string) {
    return this.tenantsService.getSettings(slug);
  }

  @Get(':slug/suppliers')
  async listSuppliers(@Param('slug') slug: string) {
    return this.tenantsService.listSuppliersBySlug(slug);
  }
}
