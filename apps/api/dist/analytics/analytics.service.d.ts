import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    calculateDemandScores(tenantId: string): Promise<{
        message: string;
        algorithm: string;
    }>;
    getSuggestions(tenantId: string): Promise<{
        productId: string;
        sku: string;
        demandScore14d: number;
        suggestionQty: number;
    }[]>;
}
