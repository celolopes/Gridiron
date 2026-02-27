const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({ log: ["query"] });

async function migrate() {
  const users = await prisma.user.findMany({
    where: { tenantId: { not: null } },
  });

  console.log(`Found ${users.length} users with a tenantId...`);

  for (const user of users) {
    if (!user.tenantId) continue;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        managedStores: {
          connect: { id: user.tenantId },
        },
      },
    });
    console.log(`Connected user ${user.email} to store ${user.tenantId}`);
  }
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
