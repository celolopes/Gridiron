import { Controller, Get, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':tenantSlug/diagnostics/db')
  async getDbDiagnostics(@Param('tenantSlug') tenantSlug: string) {
    const health = await this.prisma.checkHealth();

    const dbUrl = process.env.DATABASE_URL || '';
    let connectionMode = 'unknown';
    if (dbUrl.includes('pooler.supabase.com')) {
      connectionMode = dbUrl.includes('5432')
        ? 'session_pooler'
        : 'transaction_pooler';
    } else if (dbUrl.includes('supabase.co')) {
      connectionMode = 'direct';
    }

    return {
      tenant: tenantSlug,
      timestamp: new Date().toISOString(),
      database: {
        status: health.status,
        latency: health.latency,
        connectionMode,
        serverInfo:
          health.status === 'ok'
            ? {
                user: (health as any).metadata.user,
                addr: (health as any).metadata.addr,
                port: (health as any).metadata.port,
                version: (health as any).metadata.version,
              }
            : undefined,
        error:
          health.status === 'error'
            ? {
                message: (health as any).message,
                code: (health as any).code,
              }
            : undefined,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        host: dbUrl.split('@')[1]?.split('/')[0] || 'unknown',
        urlMasked: dbUrl.replace(/:[^@:]+@/, ':****@'),
      },
      // Explicitly for debugging as requested
      debug: {
        rawUrlMasked: dbUrl.replace(/:[^@:]+@/, ':****@'),
        expectedUser: 'postgres.mpfqpueldajpmphahezr',
        mode: connectionMode,
      },
    };
  }
}
