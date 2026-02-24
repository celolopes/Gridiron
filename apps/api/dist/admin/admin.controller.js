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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminController = class AdminController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDbDiagnostics(tenantSlug) {
        const health = await this.prisma.checkHealth();
        const dbUrl = process.env.DATABASE_URL || '';
        let connectionMode = 'unknown';
        if (dbUrl.includes('pooler.supabase.com')) {
            connectionMode = dbUrl.includes('5432')
                ? 'session_pooler'
                : 'transaction_pooler';
        }
        else if (dbUrl.includes('supabase.co')) {
            connectionMode = 'direct';
        }
        return {
            tenant: tenantSlug,
            timestamp: new Date().toISOString(),
            database: {
                status: health.status,
                latency: health.latency,
                connectionMode,
                serverInfo: health.status === 'ok'
                    ? {
                        user: health.metadata.user,
                        addr: health.metadata.addr,
                        port: health.metadata.port,
                        version: health.metadata.version,
                    }
                    : undefined,
                error: health.status === 'error'
                    ? {
                        message: health.message,
                        code: health.code,
                    }
                    : undefined,
            },
            environment: {
                nodeEnv: process.env.NODE_ENV,
                host: dbUrl.split('@')[1]?.split('/')[0] || 'unknown',
                urlMasked: dbUrl.replace(/:[^@:]+@/, ':****@'),
            },
            debug: {
                rawUrlMasked: dbUrl.replace(/:[^@:]+@/, ':****@'),
                expectedUser: 'postgres.mpfqpueldajpmphahezr',
                mode: connectionMode,
            },
        };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)(':tenantSlug/diagnostics/db'),
    __param(0, (0, common_1.Param)('tenantSlug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDbDiagnostics", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map