import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed execution...');

  // 1. Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.kitchenTicketItem.deleteMany();
  await prisma.kitchenTicket.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.session.deleteMany();
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

  // 4. Seed 50 Products distributed across categories, varied prices/tax
  const productsData = [
    // Beverages (10)
    { name: 'Cappuccino', price: 250, tax: 5, unit: 'cup', categoryId: catBeverages.id, status: 'ACTIVE' },
    { name: 'Latte Macchiato', price: 280, tax: 5, unit: 'cup', categoryId: catBeverages.id, status: 'ACTIVE' },
    { name: 'Iced Peach Tea', price: 180, tax: 5, unit: 'glass', categoryId: catBeverages.id, status: 'ACTIVE' },
    { name: 'Espresso Single', price: 120, tax: 5, unit: 'shot', categoryId: catBeverages.id, status: 'ACTIVE' },
    { name: 'Fresh Mint Mojito', price: 220, tax: 5, unit: 'glass', categoryId: catBeverages.id, status: 'ACTIVE' },
    { name: 'Hot Chocolate', price: 200, tax: 5, unit: 'cup', categoryId: catBeverages.id, status: 'ACTIVE' },
    { name: 'Cold Brew Coffee', price: 260, tax: 5, unit: 'glass', categoryId: catBeverages.id, status: 'ACTIVE' },
    { name: 'Strawberry Milkshake', price: 240, tax: 5, unit: 'glass', categoryId: catBeverages.id, status: 'ACTIVE' },
    { name: 'Mango Smoothie', price: 250, tax: 5, unit: 'glass', categoryId: catBeverages.id, status: 'ACTIVE' },
    { name: 'Matcha Green Tea Latte', price: 290, tax: 5, unit: 'cup', categoryId: catBeverages.id, status: 'ACTIVE' },
    
    // Quick Bites (10)
    { name: 'Club Sandwich Deluxe', price: 350, tax: 5, unit: 'plate', categoryId: catSnacks.id, status: 'ACTIVE' },
    { name: 'Joy Signature Burger', price: 450, tax: 5, unit: 'piece', categoryId: catSnacks.id, status: 'ACTIVE' },
    { name: 'French Fries Salted', price: 150, tax: 5, unit: 'basket', categoryId: catSnacks.id, status: 'ACTIVE' },
    { name: 'Paneer Tikka Roll', price: 280, tax: 5, unit: 'piece', categoryId: catSnacks.id, status: 'ACTIVE' },
    { name: 'Cheese Garlic Bread', price: 190, tax: 5, unit: 'plate', categoryId: catSnacks.id, status: 'ACTIVE' },
    { name: 'Crispy Onion Rings', price: 180, tax: 5, unit: 'basket', categoryId: catSnacks.id, status: 'ACTIVE' },
    { name: 'Chicken Nuggets', price: 250, tax: 5, unit: 'plate', categoryId: catSnacks.id, status: 'ACTIVE' },
    { name: 'Nachos with Cheese', price: 320, tax: 5, unit: 'plate', categoryId: catSnacks.id, status: 'ACTIVE' },
    { name: 'Veg Spring Rolls', price: 210, tax: 5, unit: 'plate', categoryId: catSnacks.id, status: 'ACTIVE' },
    { name: 'Spicy Potato Wedges', price: 170, tax: 5, unit: 'basket', categoryId: catSnacks.id, status: 'ACTIVE' },

    // Desserts (10)
    { name: 'Chocolate Lava Cake', price: 200, tax: 5, unit: 'piece', categoryId: catDesserts.id, status: 'ACTIVE' },
    { name: 'Red Velvet Pastry', price: 220, tax: 5, unit: 'slice', categoryId: catDesserts.id, status: 'ACTIVE' },
    { name: 'Blueberry Cheesecake', price: 260, tax: 5, unit: 'slice', categoryId: catDesserts.id, status: 'ACTIVE' },
    { name: 'Vanilla Ice Cream Scoop', price: 90, tax: 5, unit: 'scoop', categoryId: catDesserts.id, status: 'ACTIVE' },
    { name: 'Tiramisu', price: 280, tax: 5, unit: 'slice', categoryId: catDesserts.id, status: 'ACTIVE' },
    { name: 'Apple Pie', price: 240, tax: 5, unit: 'slice', categoryId: catDesserts.id, status: 'ACTIVE' },
    { name: 'Caramel Custard', price: 180, tax: 5, unit: 'bowl', categoryId: catDesserts.id, status: 'ACTIVE' },
    { name: 'Brownie with Ice Cream', price: 250, tax: 5, unit: 'plate', categoryId: catDesserts.id, status: 'ACTIVE' },
    { name: 'Lemon Tart', price: 190, tax: 5, unit: 'piece', categoryId: catDesserts.id, status: 'ACTIVE' },
    { name: 'Strawberry Macarons', price: 300, tax: 5, unit: 'box', categoryId: catDesserts.id, status: 'ACTIVE' },

    // Main Course (10)
    { name: 'Penne Arrabbiata Pasta', price: 420, tax: 5, unit: 'plate', categoryId: catMainCourse.id, status: 'ACTIVE' },
    { name: 'Wild Mushroom Risotto', price: 480, tax: 5, unit: 'plate', categoryId: catMainCourse.id, status: 'ACTIVE' },
    { name: 'Margherita Pizza 9inch', price: 390, tax: 5, unit: 'piece', categoryId: catMainCourse.id, status: 'ACTIVE' },
    { name: 'Farmhouse Pizza 9inch', price: 490, tax: 5, unit: 'piece', categoryId: catMainCourse.id, status: 'ACTIVE' },
    { name: 'Grilled Chicken Steak', price: 550, tax: 5, unit: 'plate', categoryId: catMainCourse.id, status: 'ACTIVE' },
    { name: 'Spaghetti Carbonara', price: 460, tax: 5, unit: 'plate', categoryId: catMainCourse.id, status: 'ACTIVE' },
    { name: 'Chicken Tikka Masala', price: 520, tax: 5, unit: 'bowl', categoryId: catMainCourse.id, status: 'ACTIVE' },
    { name: 'Veg Hakka Noodles', price: 340, tax: 5, unit: 'plate', categoryId: catMainCourse.id, status: 'ACTIVE' },
    { name: 'Thai Green Curry', price: 480, tax: 5, unit: 'bowl', categoryId: catMainCourse.id, status: 'ACTIVE' },
    { name: 'Mutton Biryani', price: 580, tax: 5, unit: 'plate', categoryId: catMainCourse.id, status: 'ACTIVE' },

    // Combos (10)
    { name: 'Burger & Mojito Combo', price: 600, tax: 5, unit: 'combo', categoryId: catCombos.id, status: 'ACTIVE' },
    { name: 'Coffee & Cheesecake Combo', price: 450, tax: 5, unit: 'combo', categoryId: catCombos.id, status: 'ACTIVE' },
    { name: 'Pizza & Cola Combo', price: 500, tax: 5, unit: 'combo', categoryId: catCombos.id, status: 'ACTIVE' },
    { name: 'Pasta & Garlic Bread Combo', price: 550, tax: 5, unit: 'combo', categoryId: catCombos.id, status: 'ACTIVE' },
    { name: 'Sandwich & Fries Combo', price: 480, tax: 5, unit: 'combo', categoryId: catCombos.id, status: 'ACTIVE' },
    { name: 'Burger & Shake Combo', price: 650, tax: 5, unit: 'combo', categoryId: catCombos.id, status: 'ACTIVE' },
    { name: 'Steak & Wine Combo', price: 1200, tax: 5, unit: 'combo', categoryId: catCombos.id, status: 'ACTIVE' },
    { name: 'Biryani & Kebab Combo', price: 850, tax: 5, unit: 'combo', categoryId: catCombos.id, status: 'ACTIVE' },
    { name: 'Wrap & Lemonade Combo', price: 420, tax: 5, unit: 'combo', categoryId: catCombos.id, status: 'ACTIVE' },
    { name: 'Nuggets & Fries Combo', price: 380, tax: 5, unit: 'combo', categoryId: catCombos.id, status: 'ACTIVE' },
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
