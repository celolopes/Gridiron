import { PrismaService } from '../prisma/prisma.service';
export declare class TenantsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findBySlug(slug: string): Promise<any>;
    getSettings(slug: string): Promise<any>;
    getPlanLimits(tenantId: string): Promise<{
        maxProducts: number;
        maxOrdersPerMonth: number;
    } | {
        maxProducts: number;
        maxOrdersPerMonth: number;
    } | {
        maxProducts: number;
        maxOrdersPerMonth: number;
    }>;
    canAddProduct(tenantId: string): Promise<boolean>;
    listSuppliersBySlug(slug: string): Promise<any>;
}
