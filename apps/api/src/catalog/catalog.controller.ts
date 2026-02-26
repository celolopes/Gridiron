import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('tenants/:tenantSlug/catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('products')
  async listProducts(@Param('tenantSlug') tenantSlug: string) {
    return this.catalogService.listProducts(tenantSlug);
  }

  @Get('products/:slug')
  async getProduct(
    @Param('tenantSlug') tenantSlug: string,
    @Param('slug') slug: string,
  ) {
    return this.catalogService.getProduct(tenantSlug, slug);
  }

  @Post('products')
  @UseGuards(AuthGuard)
  async createProduct(
    @Param('tenantSlug') tenantSlug: string,
    @Body() data: any,
  ) {
    return this.catalogService.createProduct(tenantSlug, data);
  }

  @Patch('products/:id')
  @UseGuards(AuthGuard)
  async updateProduct(
    @Param('tenantSlug') tenantSlug: string,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.catalogService.updateProduct(tenantSlug, id, data);
  }

  @Delete('products/:id')
  @UseGuards(AuthGuard)
  async deleteProduct(
    @Param('tenantSlug') tenantSlug: string,
    @Param('id') id: string,
  ) {
    return this.catalogService.deleteProduct(tenantSlug, id);
  }
}
