import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.join(__dirname, "../../../.env") });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src";
import * as bcrypt from "bcrypt";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
