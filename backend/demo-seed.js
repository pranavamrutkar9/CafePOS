require('dotenv').config({ path: '../.env' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL
    }
  }
});

async function run() {
  console.log('Starting Demo Seed injection...');

  const products = await prisma.product.findMany();
  const tables = await prisma.table.findMany();
  let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

  if (!products.length || !tables.length) {
    throw new Error('Database is empty. Please run standard seed first.');
  }

  // 1. Indian Employees
  const passwordHash = await bcrypt.hash('password123', 10);
  const employeeNames = [
    { name: 'Ravi Verma', email: 'ravi@cafe.com', role: 'EMPLOYEE' },
    { name: 'Anjali Desai', email: 'anjali@cafe.com', role: 'EMPLOYEE' },
  ];
  const employees = [];
  for (const emp of employeeNames) {
    let user = await prisma.user.findUnique({ where: { email: emp.email } });
    if (!user) {
      user = await prisma.user.create({ data: { ...emp, password_hash: passwordHash } });
    }
    employees.push(user);
  }

  // 2. Indian Customers
  const customerNames = [
    { name: 'Rahul Sharma', email: 'rahul@example.com', phone: '9876543210' },
    { name: 'Priya Patel', email: 'priya@example.com', phone: '9123456780' },
    { name: 'Amit Kumar', email: 'amit@example.com', phone: '9234567810' },
    { name: 'Neha Singh', email: 'neha@example.com', phone: '9345678210' },
    { name: 'Rajesh Gupta', email: 'rajesh@example.com', phone: '9456789310' },
    { name: 'Sneha Reddy', email: 'sneha@example.com', phone: '9567890410' },
  ];
  const customers = [];
  for (const cust of customerNames) {
    let customer = await prisma.customer.findUnique({ where: { email: cust.email } });
    if (!customer) {
      customer = await prisma.customer.create({ data: cust });
    }
    customers.push(customer);
  }

  // Helper functions
  const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const subtractDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
  };

  const now = new Date();

  // 3. Bookings
  const bookingsData = [
    { customerId: customers[0].id, tableId: tables[0].id, datetime: subtractDays(now, 2), status: 'COMPLETED' },
    { customerId: customers[1].id, tableId: tables[1].id, datetime: subtractDays(now, 1), status: 'COMPLETED' },
    { customerId: customers[2].id, tableId: tables[2].id, datetime: new Date(now.getTime() + 1000 * 60 * 60 * 24), status: 'CONFIRMED' },
    { customerId: customers[3].id, tableId: tables[3].id, datetime: new Date(now.getTime() + 1000 * 60 * 60 * 48), status: 'PENDING' },
    { customerId: customers[4].id, tableId: tables[4].id, datetime: new Date(now.getTime() + 1000 * 60 * 60 * 72), status: 'CONFIRMED' },
  ];
  for (const b of bookingsData) {
    await prisma.booking.create({ data: b });
  }

  // 4. Sessions
  const sessions = [];
  for (let i = 3; i >= 1; i--) {
    const openedAt = subtractDays(now, i);
    openedAt.setHours(9, 0, 0, 0);
    const closedAt = subtractDays(now, i);
    closedAt.setHours(18, 0, 0, 0);
    
    sessions.push(await prisma.session.create({
      data: {
        employeeId: randomItem(employees).id,
        openedAt,
        closedAt,
        openingCash: 5000,
        closingCash: 5000 + randomInt(2000, 5000),
        closingAmount: 5000 + randomInt(2000, 5000),
        status: 'CLOSED'
      }
    }));
  }
  
  // 1 OPEN session
  const openSession = await prisma.session.create({
    data: {
      employeeId: employees[0].id,
      openedAt: new Date(now.setHours(9, 0, 0, 0)),
      openingCash: 5000,
      status: 'OPEN'
    }
  });

  // 5. Orders & OrderItems & KitchenTickets
  // Let's create 15 COMPLETED orders spread over the last 3 days
  let totalOrderCount = 0;
  for (let i = 0; i < 15; i++) {
    const pastDays = randomInt(1, 3);
    const orderDate = subtractDays(new Date(), pastDays);
    orderDate.setHours(randomInt(10, 20), randomInt(0, 59), 0, 0);
    
    // Pick 2-4 random products
    const orderProducts = [];
    const numItems = randomInt(2, 4);
    for (let j=0; j<numItems; j++) {
      orderProducts.push(randomItem(products));
    }
    
    let subtotal = 0;
    const itemsData = orderProducts.map(p => {
      const qty = randomInt(1, 2);
      const lineTotal = p.price * qty;
      subtotal += lineTotal;
      return {
        productId: p.id,
        qty,
        unitPrice: p.price,
        lineTotal,
        lineDiscount: 0,
        sentToKitchenAt: orderDate
      };
    });
    
    const tax = subtotal * 0.05;
    const total = subtotal + tax;
    
    const order = await prisma.order.create({
      data: {
        tableId: randomItem(tables).id,
        customerId: Math.random() > 0.5 ? randomItem(customers).id : null,
        employeeId: randomItem(employees).id,
        status: 'COMPLETED',
        subtotal,
        tax,
        discount: 0,
        total,
        paymentMethod: 'UPI',
        sessionId: randomItem(sessions).id,
        createdAt: orderDate,
        updatedAt: orderDate,
        items: {
          create: itemsData
        }
      },
      include: { items: true }
    });

    // Kitchen Ticket for COMPLETED order
    await prisma.kitchenTicket.create({
      data: {
        orderId: order.id,
        status: 'COMPLETED',
        createdAt: orderDate,
        updatedAt: orderDate,
        items: {
          create: order.items.map(i => ({ orderItemId: i.id, completed: true }))
        }
      }
    });
    totalOrderCount++;
  }

  // Create 3 DRAFT orders for currently active session
  for (let i = 0; i < 3; i++) {
    const orderDate = new Date();
    
    // Pick 2-4 random products
    const orderProducts = [];
    const numItems = randomInt(2, 4);
    for (let j=0; j<numItems; j++) {
      orderProducts.push(randomItem(products));
    }
    
    let subtotal = 0;
    const itemsData = orderProducts.map(p => {
      const qty = randomInt(1, 2);
      const lineTotal = p.price * qty;
      subtotal += lineTotal;
      return {
        productId: p.id,
        qty,
        unitPrice: p.price,
        lineTotal,
        lineDiscount: 0,
        sentToKitchenAt: orderDate
      };
    });
    
    const tax = subtotal * 0.05;
    const total = subtotal + tax;
    
    const order = await prisma.order.create({
      data: {
        tableId: tables[i].id, // Put them on table 1, 2, 3
        customerId: randomItem(customers).id,
        employeeId: employees[0].id,
        status: 'DRAFT',
        subtotal,
        tax,
        discount: 0,
        total,
        sessionId: openSession.id,
        createdAt: orderDate,
        updatedAt: orderDate,
        items: {
          create: itemsData
        }
      },
      include: { items: true }
    });

    // Kitchen Ticket for DRAFT order (TO_COOK or COOKING)
    await prisma.kitchenTicket.create({
      data: {
        orderId: order.id,
        status: i === 0 ? 'COOKING' : 'TO_COOK',
        createdAt: orderDate,
        updatedAt: orderDate,
        items: {
          create: order.items.map((it, idx) => ({ orderItemId: it.id, completed: idx === 0 && i === 0 }))
        }
      }
    });
  }

  // 6. Audit Logs
  const auditLogs = [
    { userId: admin ? admin.id : employees[0].id, action: 'LOGIN', entity: 'User', entityId: 'system', details: 'Admin logged in' },
    { userId: employees[0].id, action: 'SESSION_OPEN', entity: 'Session', entityId: openSession.id, details: 'Opened morning shift' },
    { userId: employees[1].id, action: 'ORDER_CREATE', entity: 'Order', entityId: 'mock-order-id', details: 'Created draft order' },
    { userId: employees[0].id, action: 'PAYMENT_RECEIVE', entity: 'Order', entityId: 'mock-order-id', details: 'Received UPI payment' },
  ];
  for (const log of auditLogs) {
    await prisma.auditLog.create({ data: { ...log, createdAt: subtractDays(new Date(), randomInt(0, 1)) } });
  }

  console.log('Demo entities injected successfully!');
}

run().catch(console.error).finally(() => prisma.$disconnect());
