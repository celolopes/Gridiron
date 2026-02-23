import { CatalogService } from './catalog.service';
export declare class CatalogController {
    private readonly catalogService;
    constructor(catalogService: CatalogService);
    listProducts(tenantId: string): Promise<any>;
    getProduct(tenantId: string, slug: string): Promise<any>;
}
