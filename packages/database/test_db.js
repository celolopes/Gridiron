const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:urNEE3eYnQoNZ45e@104.18.38.10:5432/postgres?sslmode=require'
    }
  }
});

async function main() {
  try {
    const tenants = await prisma.tenant.findMany();
    console.log('SUCCESS:', tenants.length);
  } catch (error) {
    console.error('ERROR:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
