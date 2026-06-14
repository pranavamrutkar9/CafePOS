require('dotenv').config({ path: '../.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DIRECT_URL } } });

async function check() {
  const floors = await prisma.floor.findMany({ include: { tables: true } });
  const tables = await prisma.table.findMany();
  console.log(`Total Floors: ${floors.length}`);
  console.log(`Total Tables: ${tables.length}`);
  console.log(JSON.stringify(floors, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
