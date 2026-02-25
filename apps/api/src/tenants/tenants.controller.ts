import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { TenantsService, CreateTenantDto } from './tenants.service';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post('register')
  async registerTenant(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.register(createTenantDto);
  }

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
