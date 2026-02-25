import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    calculateDemandScores(tenantId: string): Promise<{
        message: string;
        algorithm: string;
    }>;
    getSuggestions(tenantId: string): Promise<any>;
    getFinancialMetrics(tenantId: string): Promise<{
        totalRevenue: number;
        totalProfit: number;
        averageMargin: number;
        ticketMedio: number;
        paidOrdersCount: any;
        totalItemsSold: number;
    }>;
}
