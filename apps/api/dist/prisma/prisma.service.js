"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@gridiron/database");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
let PrismaService = class PrismaService extends database_1.PrismaClient {
    constructor() {
        let connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            console.error('[PrismaService] DATABASE_URL is not set!');
            throw new Error('DATABASE_URL is not set');
        }
        if (connectionString && !connectionString.includes('localhost')) {
            connectionString = connectionString.replace(/([?&])sslmode=[^&]*/g, '');
            const separator = connectionString.includes('?') ? '&' : '?';
            connectionString = `${connectionString}${separator}sslmode=no-verify`;
            process.env.DATABASE_URL = connectionString;
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
            console.log('[PrismaService] Forced SSL mode to no-verify and disabled unauthorized TLS rejection');
        }
        if (!connectionString) {
            console.error('CRITICAL: DATABASE_URL is not defined in environment variables');
            super();
        }
        else {
            const isLocal = connectionString.includes('localhost') ||
                connectionString.includes('127.0.0.1');
            console.log('[PrismaService] Initializing with custom PostgreSQL adapter...');
            const pool = new pg_1.Pool({
                connectionString,
                ssl: isLocal ? false : { rejectUnauthorized: false },
                connectionTimeoutMillis: 10000,
            });
            pool.on('error', (err) => {
                console.error('[PrismaService] Unexpected error on idle client', err);
            });
            const adapter = new adapter_pg_1.PrismaPg(pool);
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
        }
        catch (error) {
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
                console.error('Check if your corporate network blocks port 5432 or DNS resolution for *.supabase.co.');
                if (dbUrl.includes('pooler.supabase.com')) {
                    console.error('HINT (Supabase): You are using the pooler. If in dev, ensure you are not hitting connection limits.');
                    console.error('Try port 6543 for transaction pooling or 5432 for session pooling.');
                }
            }
            console.error('--------------------------------------');
            return { success: false, error };
        }
    }
    async checkHealth() {
        const start = Date.now();
        try {
            const [dbMetadata] = await this.$queryRaw `
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
        }
        catch (error) {
            return {
                status: 'error',
                latency: `${Date.now() - start}ms`,
                message: error.message,
                code: error.code,
            };
        }
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map