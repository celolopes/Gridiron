import { TenantsService, CreateTenantDto } from './tenants.service';
export declare class TenantsController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    registerTenant(createTenantDto: CreateTenantDto): Promise<any>;
    getTenantByEmail(email: string): Promise<any>;
    getTenantBySlug(slug: string): Promise<any>;
    getTenantSettings(slug: string): Promise<any>;
    updateTenantSettings(slug: string, body: Record<string, any>): Promise<any>;
    listSuppliers(slug: string): Promise<any>;
    createSupplier(slug: string, body: any): Promise<any>;
    updateSupplier(slug: string, supplierId: string, body: any): Promise<any>;
}
