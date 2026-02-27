const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    where: { email: "marcelo.cae@gmail.com" },
    include: { managedStores: true, tenant: true },
  });
  console.log(JSON.stringify(users, null, 2));

  const tenants = await prisma.tenant.findMany({
    include: { managers: true, users: true },
  });
  console.log("All tenants:");
  console.log(JSON.stringify(tenants, null, 2));
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
