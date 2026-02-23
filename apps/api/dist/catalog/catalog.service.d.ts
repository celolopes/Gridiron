import { PrismaService } from '../prisma/prisma.service';
export declare class CatalogService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listProducts(tenantId: string): Promise<any>;
    getProduct(tenantId: string, slug: string): Promise<any>;
}
