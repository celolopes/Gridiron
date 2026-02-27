import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getSuggestions(tenantSlug: string): Promise<any>;
    getFinancialMetrics(tenantSlug: string): Promise<{
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
    calculateDemandScores(tenantSlug: string): Promise<{
        message: string;
        algorithm: string;
    }>;
}
