import { Controller, Get, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':tenantSlug/diagnostics/db')
  async getDbDiagnostics(@Param('tenantSlug') tenantSlug: string) {
    const health = await this.prisma.checkHealth();

    return {
      tenant: tenantSlug,
      timestamp: new Date().toISOString(),
      database: {
        status: health.status,
        latency: health.latency,
        message: (health as any).message,
        metadata: (health as any).metadata,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        useFallback: process.env.USE_DB_FALLBACK === 'true',
        host:
          (process.env.DATABASE_URL || '').split('@')[1]?.split('/')[0] ||
          'unknown',
      },
    };
  }
}
