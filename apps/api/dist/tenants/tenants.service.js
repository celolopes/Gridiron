"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantsService = exports.CreateTenantDto = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const class_validator_1 = require("class-validator");
class CreateTenantDto {
    name;
    slug;
    adminEmail;
}
exports.CreateTenantDto = CreateTenantDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[a-z0-9-]+$/),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "slug", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "adminEmail", void 0);
let TenantsService = class TenantsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async register(data) {
        const existingTenant = await this.prisma.tenant.findUnique({
            where: { slug: data.slug },
        });
        if (existingTenant) {
            throw new common_1.ConflictException('A store with this slug already exists');
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email: data.adminEmail },
        });
        console.log('[TenantsService] Hashing default password...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        console.log('[TenantsService] Password hashed.');
        try {
            return await this.prisma.$transaction(async (tx) => {
                console.log(`[TenantsService] Starting registration for: ${data.slug}`);
                const tenant = await tx.tenant.create({
                    data: {
                        name: data.name,
                        slug: data.slug,
                        subscriptionPlan: 'FREE',
                        isSaasEnabled: true,
                        settings: {
                            create: {
                                brandName: data.name,
                                primaryColor: '#000000',
                                accentColor: '#0a84ff',
                                themeMode: 'dark',
                                glassOpacity: 0.12,
                                blurIntensity: 20,
                            },
                        },
                    },
                });
                console.log(`[TenantsService] Tenant created: ${tenant.id}`);
                if (existingUser) {
                    await tx.user.update({
                        where: { email: data.adminEmail },
                        data: {
                            managedStores: {
                                connect: { id: tenant.id },
                            },
                        },
                    });
                    console.log(`[TenantsService] Admin user linked to new store`);
                }
                else {
                    await tx.user.create({
                        data: {
                            email: data.adminEmail,
                            password: hashedPassword,
                            name: 'Store Admin',
                            role: 'ADMIN',
                            managedStores: {
                                connect: { id: tenant.id },
                            },
                        },
                    });
                    console.log(`[TenantsService] Admin user created`);
                }
                const eliteProducts = [
                    {
                        name: 'Jersey Kansas City Home - Mahomes #15',
                        price: 499.9,
                        category: 'Jerseys',
                        image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&q=80&w=1000',
                        description: 'Jersey oficial modelo Home do quarterback Patrick Mahomes. Material premium com tecnologia de ventilação.',
                    },
                    {
                        name: 'Jersey Philadelphia Home - Hurts #1',
                        price: 479.9,
                        category: 'Jerseys',
                        image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&q=80&w=1000',
                        description: 'A armadura dos Eagles. Versão oficial de jogador com detalhes bordados e tecido ultra-resistente.',
                    },
                    {
                        name: 'Jersey Cincinnati Home - Burrow #9',
                        price: 489.9,
                        category: 'Jerseys',
                        image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1000',
                        description: 'Modelo clássico dos Bengals. Conforto excepcional para o dia a dia e para o estádio.',
                    },
                ];
                for (const item of eliteProducts) {
                    await tx.product.create({
                        data: {
                            name: item.name,
                            description: item.description,
                            price: item.price,
                            costPrice: item.price * 0.4,
                            tenantId: tenant.id,
                            category: item.category,
                            images: {
                                create: [{ url: item.image, position: 0 }],
                            },
                        },
                    });
                }
                console.log(`[TenantsService] Seeded ${eliteProducts.length} elite products`);
                return { tenant };
            }, {
                timeout: 20000,
            });
        }
        catch (error) {
            console.error('[TenantsService] Registration failed:', error);
            throw error;
        }
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
    async findByAdminEmail(email) {
        let user = await this.prisma.user.findUnique({
            where: { email },
            include: { managedStores: true, tenant: true },
        });
        if (!user) {
            throw new common_1.NotFoundException(`No tenant found for user email: ${email}`);
        }
        if (user.managedStores.length === 0 && user.tenantId && user.tenant) {
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    managedStores: {
                        connect: { id: user.tenantId },
                    },
                },
            });
            console.log(`[TenantsService] Backfilled managedStores for legacy user ${email}`);
            return [user.tenant];
        }
        if (user.managedStores.length === 0) {
            throw new common_1.NotFoundException(`No tenant found for user email: ${email}`);
        }
        return user.managedStores;
    }
    async getSettings(slug) {
        const tenant = await this.findBySlug(slug);
        return tenant.settings;
    }
    async updateSettings(slug, data) {
        const tenant = await this.findBySlug(slug);
        if (!tenant.settings) {
            throw new common_1.NotFoundException('Settings not found for tenant');
        }
        const allowedFields = [
            'brandName',
            'logoUrl',
            'heroImageUrl',
            'primaryColor',
            'accentColor',
            'themeMode',
            'glassOpacity',
            'blurIntensity',
        ];
        const updateData = {};
        for (const key of allowedFields) {
            if (data[key] !== undefined) {
                updateData[key] = data[key];
            }
        }
        return this.prisma.tenantSettings.update({
            where: { id: tenant.settings.id },
            data: updateData,
        });
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