import { TenantsService } from './tenants.service';
export declare class TenantsController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    getTenantBySlug(slug: string): Promise<any>;
    getTenantSettings(slug: string): Promise<any>;
}
