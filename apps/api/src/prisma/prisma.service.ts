import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@gridiron/database';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends (PrismaClient as any)
  implements OnModuleInit
{
  constructor() {
    let connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      console.error('[PrismaService] DATABASE_URL is not set!');
      throw new Error('DATABASE_URL is not set');
    }

    // Force sslmode=no-verify for database connection
    if (connectionString && !connectionString.includes('localhost')) {
      // Remove any existing sslmode to avoid conflicts
      connectionString = connectionString.replace(/([?&])sslmode=[^&]*/g, '');
      const separator = connectionString.includes('?') ? '&' : '?';
      connectionString = `${connectionString}${separator}sslmode=no-verify`;

      // Update the env var so any other parts of the app use the corrected string
      process.env.DATABASE_URL = connectionString;

      // Also set this for global node TLS handling
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      console.log(
        '[PrismaService] Forced SSL mode to no-verify and disabled unauthorized TLS rejection',
      );
    }

    if (!connectionString) {
      console.error(
        'CRITICAL: DATABASE_URL is not defined in environment variables',
      );
      super();
    } else {
      // Force pg to allow self-signed certificates
      // This is necessary for some hosted databases like Render/Supabase
      const isLocal =
        connectionString.includes('localhost') ||
        connectionString.includes('127.0.0.1');

      console.log(
        '[PrismaService] Initializing with custom PostgreSQL adapter...',
      );
      const pool = new Pool({
        connectionString,
        ssl: isLocal ? false : { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
      });

      pool.on('error', (err) => {
        console.error('[PrismaService] Unexpected error on idle client', err);
      });

      const adapter = new PrismaPg(pool);
      super({ adapter });
      console.log('[PrismaService] Adapter initialized.');
    }
  }
  async onModuleInit() {
    await this.connectWithDiagnostics();
  }

  async connectWithDiagnostics() {
    try {
      await this.$connect();
      console.log('Database connected successfully');
      return { success: true };
    } catch (error) {
      const dbUrl = process.env.DATABASE_URL || '';
      const host = dbUrl.split('@')[1]?.split(':')[0] || 'unknown';
      const sslMode = dbUrl.includes('sslmode=require')
        ? 'require'
        : 'not specified';

      console.error('--- PRISMA CONNECTION DIAGNOSTICS ---');
      console.error(`Error Code: ${error.code}`);
      console.error(`Message: ${error.message}`);
      console.error(`Target Host: ${host}`);
      console.error(`SSL Mode: ${sslMode}`);

      if (error.code === 'P1001') {
        console.error('HINT: This is a network timeout (P1001).');
        console.error(
          'Check if your corporate network blocks port 5432 or DNS resolution for *.supabase.co.',
        );
        if (dbUrl.includes('pooler.supabase.com')) {
          console.error(
            'HINT (Supabase): You are using the pooler. If in dev, ensure you are not hitting connection limits.',
          );
          console.error(
            'Try port 6543 for transaction pooling or 5432 for session pooling.',
          );
        }
      }
      console.error('--------------------------------------');

      return { success: false, error };
    }
  }

  async checkHealth() {
    const start = Date.now();
    try {
      const [dbMetadata]: any[] = await this.$queryRaw`
        SELECT 
          current_user as "user",
          inet_server_addr()::text as "addr",
          inet_server_port() as "port",
          version() as "version"
      `;
      return {
        status: 'ok',
        latency: `${Date.now() - start}ms`,
        metadata: dbMetadata,
      };
    } catch (error) {
      return {
        status: 'error',
        latency: `${Date.now() - start}ms`,
        message: error.message,
        code: error.code,
      };
    }
  }
}
