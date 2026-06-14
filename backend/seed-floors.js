const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  require('dotenv').config({ path: '../.env' });
  const floorCount = await prisma.floor.count();
  if (floorCount === 0) {
    const floor1 = await prisma.floor.create({ data: { name: 'Ground Floor' } });
    const floor2 = await prisma.floor.create({ data: { name: 'First Floor' } });
    const tablesData = [
      { number: '1', seats: 2, floorId: floor1.id, status: 'AVAILABLE' },
      { number: '2', seats: 2, floorId: floor1.id, status: 'AVAILABLE' },
      { number: '3', seats: 4, floorId: floor1.id, status: 'AVAILABLE' },
      { number: '4', seats: 4, floorId: floor1.id, status: 'AVAILABLE' },
      { number: '5', seats: 6, floorId: floor1.id, status: 'AVAILABLE' },
      { number: '6', seats: 6, floorId: floor1.id, status: 'AVAILABLE' },
      { number: '101', seats: 2, floorId: floor2.id, status: 'AVAILABLE' },
      { number: '102', seats: 4, floorId: floor2.id, status: 'AVAILABLE' },
      { number: '103', seats: 4, floorId: floor2.id, status: 'AVAILABLE' },
      { number: '104', seats: 8, floorId: floor2.id, status: 'AVAILABLE' },
    ];
    for (const tbl of tablesData) {
      await prisma.table.create({ data: tbl });
    }
    console.log('Floors and Tables seeded successfully.');
  } else {
    console.log('Floors already exist.');
  }
}
run().catch(console.error).finally(() => prisma.$disconnect());
