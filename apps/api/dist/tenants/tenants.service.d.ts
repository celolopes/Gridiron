import { PrismaService } from '../prisma/prisma.service';
export declare class CreateTenantDto {
    name: string;
    slug: string;
    adminEmail: string;
}
export declare class TenantsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    register(data: CreateTenantDto): Promise<any>;
    findBySlug(slug: string): Promise<any>;
    findByAdminEmail(email: string): Promise<any>;
    getSettings(slug: string): Promise<any>;
    updateSettings(slug: string, data: Record<string, any>): Promise<any>;
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
    createSupplier(slug: string, data: any): Promise<any>;
    updateSupplier(slug: string, supplierId: string, data: any): Promise<any>;
}
