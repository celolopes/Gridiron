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
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
dotenv.config({ path: path.join(__dirname, "../../../.env") });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const src_1 = require("../src");
const bcrypt = __importStar(require("bcrypt"));
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new src_1.PrismaClient({ adapter });
async function main() {
    console.log("Starting seed...");
    console.log("DATABASE_URL found:", !!process.env.DATABASE_URL);
    // Create Demo Tenant
    const tenant = await prisma.tenant.upsert({
        where: { slug: "demo" },
        update: {},
        create: {
            slug: "demo",
            name: "Demo Store",
            settings: {
                create: {
                    brandName: "Gridiron Demo",
                    themeMode: "dark",
                    paymentSettingsJson: { paymentModePix: "MANUAL_LINK" },
                },
            },
        },
    });
    // Create Admin User
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await prisma.user.upsert({
        where: { email: "admin@gridiron.local" },
        update: {},
        create: {
            email: "admin@gridiron.local",
            name: "Admin User",
            password: hashedPassword,
            role: "ADMIN",
        },
    });
    // Create Supplier
    const supplier = await prisma.supplier.create({
        data: {
            name: "Official Jersey Dist",
            contactEmail: "contact@officialdist.com",
        },
    });
    // Create Products & Variants
    for (let i = 1; i <= 10; i++) {
        const product = await prisma.product.create({
            data: {
                tenantId: tenant.id,
                name: `Team ${i} Authentic Jersey`,
                slug: `team-${i}-authentic-jersey`,
                description: "High quality official jersey.",
                price: 349.99,
                images: {
                    create: [{ url: `https://via.placeholder.com/500?text=Jersey+${i}` }],
                },
            },
        });
        // Variant 1: Stocked
        await prisma.variant.create({
            data: {
                productId: product.id,
                sku: `JRSY-${i}-M-H`,
                name: "Medium - Home",
                inventory: {
                    create: { available: 50 },
                },
            },
        });
        // Variant 2: Dropship
        await prisma.variant.create({
            data: {
                productId: product.id,
                sku: `JRSY-${i}-L-A`,
                name: "Large - Away",
                dropshipEnabled: true,
                supplierProduct: {
                    create: {
                        supplierId: supplier.id,
                        costPrice: 200.0,
                        leadTime: 15,
                    },
                },
            },
        });
    }
    console.log("Seed completed successfully!");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
