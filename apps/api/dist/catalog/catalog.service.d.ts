import { PrismaService } from '../prisma/prisma.service';
export declare class CatalogService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    resolveTenantId(idOrSlug: string): Promise<string>;
    listProducts(idOrSlug: string): Promise<any>;
    getProduct(idOrSlug: string, slugOrId: string): Promise<any>;
    createProduct(idOrSlug: string, data: any): Promise<any>;
    updateProduct(idOrSlug: string, id: string, data: any): Promise<any>;
    deleteProduct(idOrSlug: string, id: string): Promise<any>;
}
