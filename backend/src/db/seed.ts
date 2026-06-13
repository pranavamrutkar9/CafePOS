import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// TODO: Define and seed master/lookups/roles data inside the postgres tables

async function main() {
  console.log('Starting seed execution...');
  // Seed records implementation here
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
