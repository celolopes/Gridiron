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
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TenantsService = class TenantsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findBySlug(slug) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { slug },
            include: {
                settings: true,
            },
        });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with slug ${slug} not found`);
        }
        return tenant;
    }
    async getSettings(slug) {
        const tenant = await this.findBySlug(slug);
        return tenant.settings;
    }
    async getPlanLimits(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
        });
        if (!tenant)
            throw new common_1.NotFoundException('Tenant not found');
        const PLAN_LIMITS = {
            FREE: { maxProducts: 10, maxOrdersPerMonth: 50 },
            PRO: { maxProducts: 200, maxOrdersPerMonth: 1000 },
            ENTERPRISE: { maxProducts: 10000, maxOrdersPerMonth: 100000 },
        };
        const plan = tenant.subscriptionPlan;
        return PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;
    }
    async canAddProduct(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
        });
        if (!tenant?.isSaasEnabled)
            return true;
        const limits = await this.getPlanLimits(tenantId);
        const productCount = await this.prisma.product.count({
            where: { tenantId },
        });
        return productCount < limits.maxProducts;
    }
    async listSuppliersBySlug(slug) {
        const tenant = await this.findBySlug(slug);
        return this.prisma.supplier.findMany({
            where: {},
        });
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map