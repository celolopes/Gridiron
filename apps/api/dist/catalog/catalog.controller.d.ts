import { CatalogService } from './catalog.service';
export declare class CatalogController {
    private readonly catalogService;
    constructor(catalogService: CatalogService);
    listProducts(tenantSlug: string): Promise<any>;
    getProduct(tenantSlug: string, slug: string): Promise<any>;
    createProduct(tenantSlug: string, data: any): Promise<any>;
    updateProduct(tenantSlug: string, id: string, data: any): Promise<any>;
    deleteProduct(tenantSlug: string, id: string): Promise<any>;
}
