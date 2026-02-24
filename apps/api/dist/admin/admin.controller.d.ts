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
            connectionMode: string;
            serverInfo: {
                user: any;
                addr: any;
                port: any;
                version: any;
            } | undefined;
            error: {
                message: any;
                code: any;
            } | undefined;
        };
        environment: {
            nodeEnv: string | undefined;
            host: string;
            urlMasked: string;
        };
        debug: {
            rawUrlMasked: string;
            expectedUser: string;
            mode: string;
        };
    }>;
}
