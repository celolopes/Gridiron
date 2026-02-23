import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getSuggestions(tenantId: string): Promise<{
        productId: string;
        sku: string;
        demandScore14d: number;
        suggestionQty: number;
    }[]>;
    calculateDemandScores(tenantId: string): Promise<{
        message: string;
        algorithm: string;
    }>;
}
