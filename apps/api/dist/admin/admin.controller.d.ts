import { PrismaService } from '../prisma/prisma.service';
export declare class AdminController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getDbDiagnostics(tenantSlug: string): Promise<{
        tenant: string;
        timestamp: string;
        database: {
            status: string;
            latency: string;
            message: any;
            metadata: any;
        };
        environment: {
            nodeEnv: string | undefined;
            useFallback: boolean;
            host: string;
        };
    }>;
}
