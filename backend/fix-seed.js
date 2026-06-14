require('dotenv').config({ path: '../.env' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL
    }
  }
});

async function run() {
  console.log('Cleaning up duplicate demo entities...');

  // 1. Delete all bookings, orders, and kitchen tickets
  await prisma.kitchenTicketItem.deleteMany();
  await prisma.kitchenTicket.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.session.deleteMany();
  await prisma.auditLog.deleteMany();

  console.log('Old entities cleared. Injecting exactly 5 demo entities per module for TODAY...');

  const products = await prisma.product.findMany();
  const tables = await prisma.table.findMany();
  let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  let employee = await prisma.user.findFirst({ where: { role: 'EMPLOYEE' } });
  
  if (!employee) {
    employee = admin;
  }

  const customers = await prisma.customer.findMany({ take: 5 });
  
  const now = new Date();

  // Helper functions
  const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  // 1. Bookings (Exactly 5)
  const bookingsData = [
    { customerId: customers[0].id, tableId: tables[0].id, datetime: new Date(now.getTime() - 1000 * 60 * 60 * 2), status: 'COMPLETED' },
    { customerId: customers[1].id, tableId: tables[1].id, datetime: new Date(now.getTime() + 1000 * 60 * 60 * 2), status: 'CONFIRMED' },
    { customerId: customers[2].id, tableId: tables[2].id, datetime: new Date(now.getTime() + 1000 * 60 * 60 * 4), status: 'PENDING' },
    { customerId: customers[3].id, tableId: tables[3].id, datetime: new Date(now.getTime() + 1000 * 60 * 60 * 24), status: 'CONFIRMED' },
    { customerId: customers[4].id, tableId: tables[4].id, datetime: new Date(now.getTime() + 1000 * 60 * 60 * 48), status: 'PENDING' },
  ];
  for (const b of bookingsData) {
    await prisma.booking.create({ data: b });
  }

  // 2. Sessions (1 Closed Yesterday, 1 Open Today)
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const openedAtYesterday = new Date(yesterday.setHours(9, 0, 0, 0));
  const closedAtYesterday = new Date(yesterday.setHours(18, 0, 0, 0));
  
  await prisma.session.create({
    data: {
      employeeId: employee.id,
      openedAt: openedAtYesterday,
      closedAt: closedAtYesterday,
      openingCash: 5000,
      closingCash: 8500,
      closingAmount: 8500,
      status: 'CLOSED'
    }
  });

  const openSession = await prisma.session.create({
    data: {
      employeeId: employee.id,
      openedAt: new Date(now.setHours(9, 0, 0, 0)),
      openingCash: 5000,
      status: 'OPEN'
    }
  });

  // 3. Orders (5 COMPLETED today for Reports, 1 DRAFT for Active)
  for (let i = 0; i < 5; i++) {
    const orderDate = new Date();
    orderDate.setHours(now.getHours() - randomInt(1, 4)); // Random time today
    
    const orderProducts = [randomItem(products), randomItem(products)];
    
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
        sentToKitchenAt: orderDate
      };
    });
    
    const tax = subtotal * 0.05;
    const total = subtotal + tax;
    
    const order = await prisma.order.create({
      data: {
        tableId: randomItem(tables).id,
        customerId: randomItem(customers).id,
        employeeId: employee.id,
        status: 'PAID', // Must be PAID for reports to pick it up!
        subtotal,
        tax,
        discount: 0,
        total,
        paymentMethod: 'UPI',
        sessionId: openSession.id,
        createdAt: orderDate,
        updatedAt: orderDate,
        items: {
          create: itemsData
        }
      },
      include: { items: true }
    });

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
  }

  // 1 DRAFT Order
  const draftOrderProducts = [randomItem(products), randomItem(products)];
  let draftSubtotal = 0;
  const draftItemsData = draftOrderProducts.map(p => {
    const qty = randomInt(1, 2);
    const lineTotal = p.price * qty;
    draftSubtotal += lineTotal;
    return {
      productId: p.id,
      qty,
      unitPrice: p.price,
      lineTotal,
      sentToKitchenAt: now
    };
  });
  
  const draftOrder = await prisma.order.create({
    data: {
      tableId: tables[0].id,
      customerId: customers[0].id,
      employeeId: employee.id,
      status: 'DRAFT',
      subtotal: draftSubtotal,
      tax: draftSubtotal * 0.05,
      discount: 0,
      total: draftSubtotal * 1.05,
      sessionId: openSession.id,
      createdAt: now,
      updatedAt: now,
      items: {
        create: draftItemsData
      }
    },
    include: { items: true }
  });

  await prisma.kitchenTicket.create({
    data: {
      orderId: draftOrder.id,
      status: 'COOKING',
      createdAt: now,
      updatedAt: now,
      items: {
        create: draftOrder.items.map((it, idx) => ({ orderItemId: it.id, completed: idx === 0 }))
      }
    }
  });

  // 4. Audit Logs (Exactly 5)
  const auditLogs = [
    { userId: employee.id, action: 'SESSION_OPEN', entity: 'Session', entityId: openSession.id, details: 'Opened morning shift' },
    { userId: employee.id, action: 'ORDER_CREATE', entity: 'Order', entityId: draftOrder.id, details: 'Created draft order' },
    { userId: employee.id, action: 'PAYMENT_RECEIVE', entity: 'Order', entityId: draftOrder.id, details: 'Received UPI payment' },
    { userId: employee.id, action: 'BOOKING_CONFIRM', entity: 'Booking', entityId: 'sys', details: 'Confirmed table booking' },
    { userId: employee.id, action: 'KITCHEN_TICKET', entity: 'KitchenTicket', entityId: 'sys', details: 'Ticket marked cooking' },
  ];
  for (const log of auditLogs) {
    await prisma.auditLog.create({ data: { ...log } });
  }

  console.log('Cleanup and Injection Complete! Check your reports now.');
}

run().catch(console.error).finally(() => prisma.$disconnect());
