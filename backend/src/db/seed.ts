import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed execution...');

  // 1. Clear existing data (optional but good for dev)
  await prisma.kitchenTicketItem.deleteMany();
  await prisma.kitchenTicket.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.table.deleteMany();
  await prisma.floor.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.paymentMethod.deleteMany();

  // 2. Seed Users
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@cafe.com',
      password_hash: '$2b$10$xyz', // Mock hash for now
      role: 'ADMIN',
    },
  });

  const employee = await prisma.user.create({
    data: {
      name: 'John Cashier',
      email: 'john@cafe.com',
      password_hash: '$2b$10$xyz', // Mock hash for now
      role: 'EMPLOYEE',
    },
  });

  // 3. Seed Categories & Products
  const beverages = await prisma.category.create({
    data: {
      name: 'Beverages',
      color: 'bg-amber-500',
      products: {
        create: [
          { name: 'Cappuccino', price: 250, tax: 5, unit: 'piece', status: 'ACTIVE' },
          { name: 'Latte', price: 280, tax: 5, unit: 'piece', status: 'ACTIVE' },
          { name: 'Iced Tea', price: 180, tax: 5, unit: 'piece', status: 'ACTIVE' },
        ],
      },
    },
  });

  const food = await prisma.category.create({
    data: {
      name: 'Food',
      color: 'bg-red-500',
      products: {
        create: [
          { name: 'Club Sandwich', price: 350, tax: 5, unit: 'piece', status: 'ACTIVE' },
          { name: 'Burger', price: 450, tax: 5, unit: 'piece', status: 'ACTIVE' },
        ],
      },
    },
  });

  const desserts = await prisma.category.create({
    data: {
      name: 'Desserts',
      color: 'bg-pink-500',
      products: {
        create: [
          { name: 'Chocolate Cake', price: 200, tax: 5, unit: 'piece', status: 'ACTIVE' },
        ],
      },
    },
  });

  // 4. Seed Floors & Tables
  const groundFloor = await prisma.floor.create({
    data: {
      name: 'Ground Floor',
      tables: {
        create: [
          { number: '1', seats: 2, status: 'AVAILABLE' },
          { number: '2', seats: 2, status: 'AVAILABLE' },
          { number: '3', seats: 4, status: 'AVAILABLE' },
          { number: '4', seats: 4, status: 'OCCUPIED' },
          { number: '5', seats: 4, status: 'AVAILABLE' },
        ],
      },
    },
  });

  const firstFloor = await prisma.floor.create({
    data: {
      name: 'First Floor',
      tables: {
        create: [
          { number: '101', seats: 2, status: 'AVAILABLE' },
          { number: '102', seats: 4, status: 'AVAILABLE' },
        ],
      },
    },
  });

  // 5. Seed Payment Methods
  await prisma.paymentMethod.createMany({
    data: [
      { type: 'CASH', enabled: true },
      { type: 'CARD', enabled: false },
      { type: 'UPI', enabled: true, upiId: 'cafe@ybl' },
    ],
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
