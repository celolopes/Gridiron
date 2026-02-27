import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    calculateDemandScores(tenantId: string): Promise<{
        message: string;
        algorithm: string;
    }>;
    resolveTenantId(idOrSlug: string): Promise<string>;
    getSuggestions(idOrSlug: string): Promise<any>;
    getFinancialMetrics(idOrSlug: string): Promise<{
        totalRevenue: number;
        totalProfit: number;
        averageMargin: number;
        ticketMedio: number;
        paidOrdersCount: any;
        awaitingPaymentCount: any;
        ordersTodayCount: any;
        totalItemsSold: number;
        revenueByMonth: any[];
    }>;
}
