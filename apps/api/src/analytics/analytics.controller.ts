import { Controller, Get, Param, Post } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('tenants/:tenantId/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('suggestions')
  async getSuggestions(@Param('tenantId') tenantId: string) {
    return this.analyticsService.getSuggestions(tenantId);
  }

  // Usually triggered by Cron, exposing here for manual trigger/testing
  @Post('calculate-demand')
  async calculateDemandScores(@Param('tenantId') tenantId: string) {
    return this.analyticsService.calculateDemandScores(tenantId);
  }
}
