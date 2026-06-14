require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DIRECT_URL } } });
async function check() {
  const bookings = await prisma.booking.count();
  const orders = await prisma.order.count();
  console.log(`Bookings: ${bookings}, Orders: ${orders}`);
}
check().finally(() => prisma.$disconnect());
