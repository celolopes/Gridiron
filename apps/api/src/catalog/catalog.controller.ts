import { Controller, Get, Param, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('tenants/:tenantId/catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('products')
  async listProducts(@Param('tenantId') tenantId: string) {
    return this.catalogService.listProducts(tenantId);
  }

  @Get('products/:slug')
  async getProduct(
    @Param('tenantId') tenantId: string,
    @Param('slug') slug: string,
  ) {
    return this.catalogService.getProduct(tenantId, slug);
  }
}
