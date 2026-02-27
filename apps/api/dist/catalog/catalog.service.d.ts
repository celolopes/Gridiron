import { PrismaService } from '../prisma/prisma.service';
import { TenantsService } from '../tenants/tenants.service';
export declare class CatalogService {
    private readonly prisma;
    private readonly tenantsService;
    constructor(prisma: PrismaService, tenantsService: TenantsService);
    resolveTenantId(idOrSlug: string): Promise<string>;
    listProducts(idOrSlug: string): Promise<any>;
    getProduct(idOrSlug: string, slugOrId: string): Promise<any>;
    createProduct(idOrSlug: string, data: any): Promise<any>;
    updateProduct(idOrSlug: string, id: string, data: any): Promise<any>;
    deleteProduct(idOrSlug: string, id: string): Promise<any>;
}
