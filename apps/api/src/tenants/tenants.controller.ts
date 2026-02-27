import {
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { TenantsService, CreateTenantDto } from './tenants.service';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post('register')
  async registerTenant(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.register(createTenantDto);
  }

  @Get('by-email/:email')
  async getTenantByEmail(@Param('email') email: string) {
    return this.tenantsService.findByAdminEmail(email);
  }

  @Get(':slug')
  async getTenantBySlug(@Param('slug') slug: string) {
    return this.tenantsService.findBySlug(slug);
  }

  @Get(':slug/settings')
  async getTenantSettings(@Param('slug') slug: string) {
    return this.tenantsService.getSettings(slug);
  }

  @Patch(':slug/settings')
  @UseGuards(AuthGuard)
  async updateTenantSettings(
    @Param('slug') slug: string,
    @Body() body: Record<string, any>,
  ) {
    return this.tenantsService.updateSettings(slug, body);
  }

  @Get(':slug/suppliers')
  async listSuppliers(@Param('slug') slug: string) {
    return this.tenantsService.listSuppliersBySlug(slug);
  }

  @Post(':slug/suppliers')
  @UseGuards(AuthGuard)
  async createSupplier(@Param('slug') slug: string, @Body() body: any) {
    return this.tenantsService.createSupplier(slug, body);
  }

  @Patch(':slug/suppliers/:supplierId')
  @UseGuards(AuthGuard)
  async updateSupplier(
    @Param('slug') slug: string,
    @Param('supplierId') supplierId: string,
    @Body() body: any,
  ) {
    return this.tenantsService.updateSupplier(slug, supplierId, body);
  }

  @Get(':slug/usage')
  @UseGuards(AuthGuard)
  async getUsageStats(@Param('slug') slug: string) {
    const tenant = await this.tenantsService.findBySlug(slug);
    return this.tenantsService.getUsageStats(tenant.id);
  }
}
