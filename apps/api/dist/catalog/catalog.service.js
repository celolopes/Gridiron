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
exports.CatalogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CatalogService = class CatalogService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async resolveTenantId(idOrSlug) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(idOrSlug)) {
            return idOrSlug;
        }
        const tenant = await this.prisma.tenant.findUnique({
            where: { slug: idOrSlug },
        });
        if (!tenant) {
            throw new Error(`Tenant with slug or ID ${idOrSlug} not found`);
        }
        return tenant.id;
    }
    async listProducts(idOrSlug) {
        const tenantId = await this.resolveTenantId(idOrSlug);
        return await this.prisma.product.findMany({
            where: {
                tenantId,
            },
            include: {
                images: true,
                variants: {
                    include: {
                        inventory: true,
                    },
                },
                demandScores: true,
            },
        });
    }
    async getProduct(idOrSlug, slugOrId) {
        const tenantId = await this.resolveTenantId(idOrSlug);
        const product = await this.prisma.product.findFirst({
            where: {
                tenantId,
                OR: [{ slug: slugOrId }, { id: slugOrId }],
            },
            include: {
                images: true,
                variants: {
                    include: {
                        inventory: true,
                    },
                },
            },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product not found`);
        }
        return product;
    }
    async createProduct(idOrSlug, data) {
        const tenantId = await this.resolveTenantId(idOrSlug);
        const slug = data.slug ||
            data.name
                .toLowerCase()
                .replace(/ /g, '-')
                .replace(/[^\w-]+/g, '');
        return this.prisma.product.create({
            data: {
                name: data.name,
                slug,
                description: data.description,
                price: parseFloat(data.price),
                costPrice: data.costPrice ? parseFloat(data.costPrice) : undefined,
                category: data.category,
                tenantId,
                images: {
                    create: data.images?.map((url) => ({ url })) || [],
                },
            },
        });
    }
    async updateProduct(idOrSlug, id, data) {
        const tenantId = await this.resolveTenantId(idOrSlug);
        const product = await this.prisma.product.findFirst({
            where: { id, tenantId },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found in this shop');
        return this.prisma.product.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                price: data.price ? parseFloat(data.price) : undefined,
                costPrice: data.costPrice ? parseFloat(data.costPrice) : undefined,
                category: data.category,
                images: data.images
                    ? {
                        deleteMany: {},
                        create: data.images.map((url) => ({ url })),
                    }
                    : undefined,
            },
        });
    }
    async deleteProduct(idOrSlug, id) {
        const tenantId = await this.resolveTenantId(idOrSlug);
        const product = await this.prisma.product.findFirst({
            where: { id, tenantId },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return this.prisma.product.delete({ where: { id } });
    }
};
exports.CatalogService = CatalogService;
exports.CatalogService = CatalogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CatalogService);
//# sourceMappingURL=catalog.service.js.map