import { PrismaClient } from "../src/generated/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

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
