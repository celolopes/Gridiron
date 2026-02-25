import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getSuggestions(tenantId: string): Promise<any>;
    getFinancialMetrics(tenantId: string): Promise<{
        totalRevenue: number;
        totalProfit: number;
        averageMargin: number;
        ticketMedio: number;
        paidOrdersCount: any;
        totalItemsSold: number;
    }>;
    calculateDemandScores(tenantId: string): Promise<{
        message: string;
        algorithm: string;
    }>;
}
