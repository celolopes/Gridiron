import { PrismaService } from '../prisma/prisma.service';
export declare class TenantsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findBySlug(slug: string): Promise<any>;
    private getDummyTenant;
    getSettings(slug: string): Promise<any>;
}
