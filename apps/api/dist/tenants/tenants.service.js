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
        try {
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
        catch (error) {
            if (process.env.USE_DB_FALLBACK === 'true') {
                console.warn(`Database query failed for tenant ${slug}, using dummy fallback.`, error.message);
                return this.getDummyTenant(slug);
            }
            throw error;
        }
    }
    getDummyTenant(slug) {
        return {
            id: 'dummy-id',
            name: `Gridiron ${slug.toUpperCase()} Store`,
            slug,
            settings: {
                themeColor: '#1e40af',
                brandName: `Gridiron ${slug.toUpperCase()}`,
                welcomeMessage: `Welcome to Gridiron ${slug.toUpperCase()} Store`,
                logoUrl: '',
                faviconUrl: '',
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }
    async getSettings(slug) {
        const tenant = await this.findBySlug(slug);
        return tenant.settings;
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map