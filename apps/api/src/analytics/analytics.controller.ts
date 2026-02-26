import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('tenants/:tenantSlug/analytics')
@UseGuards(AuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('suggestions')
  async getSuggestions(@Param('tenantSlug') tenantSlug: string) {
    return this.analyticsService.getSuggestions(tenantSlug);
  }

  @Get('financial')
  async getFinancialMetrics(@Param('tenantSlug') tenantSlug: string) {
    return this.analyticsService.getFinancialMetrics(tenantSlug);
  }

  // Usually triggered by Cron, exposing here for manual trigger/testing
  @Post('calculate-demand')
  async calculateDemandScores(@Param('tenantSlug') tenantSlug: string) {
    return this.analyticsService.calculateDemandScores(tenantSlug);
  }
}
