import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed execution...');

  // 1. Clear existing data
  await prisma.kitchenTicketItem.deleteMany();
  await prisma.kitchenTicket.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.table.deleteMany();
  await prisma.floor.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.paymentMethod.deleteMany();

  // 2. Seed Users
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('password123', salt);
  const employeePasswordHash = await bcrypt.hash('password123', salt);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@cafe.com',
      password_hash: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  const employee1 = await prisma.user.create({
    data: {
      name: 'Eric',
      email: 'eric@cafe.com',
      password_hash: employeePasswordHash,
      role: 'EMPLOYEE',
    },
  });

  const employee2 = await prisma.user.create({
    data: {
      name: 'Sara',
      email: 'sara@cafe.com',
      password_hash: employeePasswordHash,
      role: 'EMPLOYEE',
    },
  });

  // 3. Seed 5 Categories with distinct colors (hex)
  const catBeverages = await prisma.category.create({
    data: { name: 'Beverages', color: '#F59E0B' }, // Amber
  });

  const catSnacks = await prisma.category.create({
    data: { name: 'Quick Bites', color: '#EF4444' }, // Red
  });

  const catDesserts = await prisma.category.create({
    data: { name: 'Desserts', color: '#EC4899' }, // Pink
  });

  const catMainCourse = await prisma.category.create({
    data: { name: 'Main Course', color: '#10B981' }, // Emerald
  });

  const catCombos = await prisma.category.create({
    data: { name: 'Combos', color: '#6366F1' }, // Indigo
  });

  // 4. Seed 20 Products distributed across categories, varied prices/tax
  const productsData = [
    // Beverages
    { name: 'Cappuccino', price: 250, tax: 5, unit: 'cup', categoryId: catBeverages.id, status: 'ACTIVE' },
    { name: 'Latte Macchiato', price: 280, tax: 5, unit: 'cup', categoryId: catBeverages.id, status: 'ACTIVE' },
    { name: 'Iced Peach Tea', price: 180, tax: 5, unit: 'glass', categoryId: catBeverages.id, status: 'ACTIVE' },
    { name: 'Espresso Single', price: 120, tax: 5, unit: 'shot', categoryId: catBeverages.id, status: 'ACTIVE' },
    { name: 'Fresh Mint Mojito', price: 220, tax: 5, unit: 'glass', categoryId: catBeverages.id, status: 'ACTIVE' },
    
    // Quick Bites
    { name: 'Club Sandwich Deluxe', price: 350, tax: 5, unit: 'plate', categoryId: catSnacks.id, status: 'ACTIVE' },
    { name: 'Joy Signature Burger', price: 450, tax: 5, unit: 'piece', categoryId: catSnacks.id, status: 'ACTIVE' },
    { name: 'French Fries Salted', price: 150, tax: 5, unit: 'basket', categoryId: catSnacks.id, status: 'ACTIVE' },
    { name: 'Paneer Tikka Roll', price: 280, tax: 5, unit: 'piece', categoryId: catSnacks.id, status: 'ACTIVE' },
    { name: 'Cheese Garlic Bread', price: 190, tax: 5, unit: 'plate', categoryId: catSnacks.id, status: 'ACTIVE' },

    // Desserts
    { name: 'Chocolate Lava Cake', price: 200, tax: 5, unit: 'piece', categoryId: catDesserts.id, status: 'ACTIVE' },
    { name: 'Red Velvet Pastry', price: 220, tax: 5, unit: 'slice', categoryId: catDesserts.id, status: 'ACTIVE' },
    { name: 'Blueberry Cheesecake', price: 260, tax: 5, unit: 'slice', categoryId: catDesserts.id, status: 'ACTIVE' },
    { name: 'Vanilla Ice Cream Scoop', price: 90, tax: 5, unit: 'scoop', categoryId: catDesserts.id, status: 'ACTIVE' },

    // Main Course
    { name: 'Penne Arrabbiata Pasta', price: 420, tax: 5, unit: 'plate', categoryId: catMainCourse.id, status: 'ACTIVE' },
    { name: 'Wild Mushroom Risotto', price: 480, tax: 5, unit: 'plate', categoryId: catMainCourse.id, status: 'ACTIVE' },
    { name: 'Margherita Pizza 9inch', price: 390, tax: 5, unit: 'piece', categoryId: catMainCourse.id, status: 'ACTIVE' },
    { name: 'Farmhouse Pizza 9inch', price: 490, tax: 5, unit: 'piece', categoryId: catMainCourse.id, status: 'ACTIVE' },

    // Combos
    { name: 'Burger & Mojito Combo', price: 600, tax: 5, unit: 'combo', categoryId: catCombos.id, status: 'ACTIVE' },
    { name: 'Coffee & Cheesecake Combo', price: 450, tax: 5, unit: 'combo', categoryId: catCombos.id, status: 'ACTIVE' },
  ];

  const products: any[] = [];
  for (const prod of productsData) {
    const created = await prisma.product.create({ data: prod });
    products.push(created);
  }

  // 5. Seed 2 Floors, 10 Tables total across them
  const floor1 = await prisma.floor.create({
    data: { name: 'Ground Floor' },
  });

  const floor2 = await prisma.floor.create({
    data: { name: 'First Floor' },
  });

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

  // 6. Seed 10 Customers with name/email/phone
  const customersData = [
    { name: 'Pranav Amrutkar', email: 'pranav@pranav.com', phone: '9876543210' },
    { name: 'Alice Smith', email: 'alice@example.com', phone: '9123456780' },
    { name: 'Bob Johnson', email: 'bob@example.com', phone: '9234567810' },
    { name: 'Charlie Brown', email: 'charlie@example.com', phone: '9345678210' },
    { name: 'Diana Prince', email: 'diana@example.com', phone: '9456789310' },
    { name: 'Ethan Hunt', email: 'ethan@example.com', phone: '9567890410' },
    { name: 'Fiona Gallagher', email: 'fiona@example.com', phone: '9678901510' },
    { name: 'Gavin Belson', email: 'gavin@example.com', phone: '9789012610' },
    { name: 'Hannah Baker', email: 'hannah@example.com', phone: '9890123710' },
    { name: 'Ian Malcolm', email: 'ian@example.com', phone: '9901234810' },
  ];

  for (const cust of customersData) {
    await prisma.customer.create({ data: cust });
  }

  // 7. Seed 3 Coupons (active=true)
  await prisma.coupon.create({
    data: { code: 'WELCOME20', type: 'PERCENT', value: 20, active: true },
  });
  await prisma.coupon.create({
    data: { code: 'FLAT50', type: 'FIXED', value: 50, active: true },
  });
  await prisma.coupon.create({
    data: { code: 'SUMMER30', type: 'PERCENT', value: 30, active: true },
  });

  // Helper to find product by name
  const findProduct = (name: string) => products.find(p => p.name === name);

  // 8. Seed 2 Product-level promotions (scope="PRODUCT", active=true)
  const cappuccino = findProduct('Cappuccino');
  const burger = findProduct('Joy Signature Burger');

  if (cappuccino) {
    await prisma.promotion.create({
      data: {
        scope: 'PRODUCT',
        type: 'PERCENT',
        value: 15, // 15% discount
        minQty: 3, // Buy 3 or more Cappuccinos
        productId: cappuccino.id,
        active: true
      }
    });
  }

  if (burger) {
    await prisma.promotion.create({
      data: {
        scope: 'PRODUCT',
        type: 'FIXED',
        value: 40, // ₹40 off
        minQty: 2, // Buy 2 or more Burgers
        productId: burger.id,
        active: true
      }
    });
  }

  // 9. Seed 2 Order-level promotions (scope="ORDER", active=true)
  await prisma.promotion.create({
    data: {
      scope: 'ORDER',
      type: 'PERCENT',
      value: 10, // 10% off total
      minAmount: 1000, // For orders over ₹1000
      active: true
    }
  });

  await prisma.promotion.create({
    data: {
      scope: 'ORDER',
      type: 'FIXED',
      value: 100, // ₹100 off total
      minAmount: 1500, // For orders over ₹1500
      active: true
    }
  });

  // 10. Seed 3 PaymentMethods: CASH (enabled), CARD (enabled), UPI (enabled, upiId="cafe@ybl")
  await prisma.paymentMethod.createMany({
    data: [
      { type: 'CASH', enabled: true },
      { type: 'CARD', enabled: true },
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
