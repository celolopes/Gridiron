import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@gridiron/database';

@Injectable()
export class PrismaService
  extends (PrismaClient as any)
  implements OnModuleInit
{
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
