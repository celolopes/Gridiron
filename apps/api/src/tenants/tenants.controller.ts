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
}
