import { PrismaClient } from '@prisma/client';
import { getSocketIO } from '../../socket/index';
import { CouponPromotionService } from '../coupons-promotions/coupon-promotion.service';
import { calculateOrderTotals } from './order.totals';

const prisma = new PrismaClient();

export class OrderService {
  async getAllOrders() {
    return prisma.order.findMany({
      include: {
        table: true,
        employee: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        table: true,
        items: {
          include: {
            product: true,
          },
        },
        kitchenTickets: {
          include: {
            items: true,
          },
        },
      },
    });
  }

  async createOrder(data: any) {
    if (data.paymentMethod && !['CASH', 'CARD', 'UPI'].includes(data.paymentMethod)) {
      throw new Error('Invalid payment method. Must be one of CASH, CARD, or UPI.');
    }

    // Use our database-backed calculator for accurate totals and promo stacking
    const totals = await calculateOrderTotals(data.items, data.couponId);

    const order = await prisma.order.create({
      data: {
        tableId: data.tableId,
        customerId: data.customerId,
        employeeId: data.employeeId,
        sessionId: data.sessionId,
        status: data.status || 'DRAFT',
        subtotal: totals.subtotal,
        tax: totals.tax,
        discount: totals.productDiscounts + totals.orderDiscount,
        discountLabel: totals.discountLabel,
        total: totals.total,
        couponId: data.couponId,
        paymentMethod: data.paymentMethod,
        items: {
          create: totals.items.map((item: any) => ({
            productId: item.productId,
            qty: item.qty,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal,
            lineDiscount: item.lineDiscount,
            discountLabel: item.discountLabel,
            sentToKitchenAt: null, // Stamped by sendOrderToKitchen below
          })),
        },
      },
      include: {
        items: true,
        table: true,
      },
    });

    // Auto send to kitchen
    await this.sendOrderToKitchen(order.id);

    // Update table status if table is OCCUPIED
    const io = getSocketIO();
    if (io) {
      io.emit('table-updated', { tableId: data.tableId, status: 'OCCUPIED' });
    }

    await prisma.table.update({
      where: { id: data.tableId },
      data: { status: 'OCCUPIED' },
    });

    return order;
  }

  async updateOrder(id: string, data: any) {
    if (data.paymentMethod && !['CASH', 'CARD', 'UPI'].includes(data.paymentMethod)) {
      throw new Error('Invalid payment method. Must be one of CASH, CARD, or UPI.');
    }

    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!currentOrder) {
      throw new Error('Order not found');
    }

    // 1. If items are provided in update, sync them
    if (data.items) {
      const incomingItems = data.items;
      const incomingIds = incomingItems.map((i: any) => i.id).filter(Boolean);

      // Delete items not in incoming list
      const itemsToDelete = currentOrder.items.filter(ci => !incomingIds.includes(ci.id));
      if (itemsToDelete.length > 0) {
        const deleteIds = itemsToDelete.map(i => i.id);
        await prisma.kitchenTicketItem.deleteMany({
          where: { orderItemId: { in: deleteIds } }
        });
        await prisma.orderItem.deleteMany({
          where: { id: { in: deleteIds } }
        });
      }

      // Create or update items
      for (const item of incomingItems) {
        if (item.id) {
          await prisma.orderItem.update({
            where: { id: item.id },
            data: {
              qty: item.qty,
              unitPrice: item.unitPrice,
              lineTotal: item.qty * item.unitPrice,
            }
          });
        } else {
          await prisma.orderItem.create({
            data: {
              orderId: id,
              productId: item.productId,
              qty: item.qty,
              unitPrice: item.unitPrice,
              lineTotal: item.qty * item.unitPrice,
              sentToKitchenAt: null
            }
          });
        }
      }
    }

    // Refetch updated items for calculation
    const updatedItems = await prisma.orderItem.findMany({
      where: { orderId: id }
    });

    const couponId = data.couponId !== undefined ? data.couponId : currentOrder.couponId;
    const totals = await calculateOrderTotals(
      updatedItems.map(i => ({ productId: i.productId, qty: i.qty, unitPrice: i.unitPrice })),
      couponId
    );

    // Save line-level discounts back to DB
    for (const item of totals.items) {
      const dbItem = updatedItems.find(ui => ui.productId === item.productId);
      if (dbItem) {
        await prisma.orderItem.update({
          where: { id: dbItem.id },
          data: {
            lineTotal: item.lineTotal,
            lineDiscount: item.lineDiscount,
            discountLabel: item.discountLabel
          }
        });
      }
    }

    // 2. Update order document with new totals and other attributes
    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: data.status !== undefined ? data.status : currentOrder.status,
        subtotal: totals.subtotal,
        tax: totals.tax,
        discount: totals.productDiscounts + totals.orderDiscount,
        discountLabel: totals.discountLabel,
        total: totals.total,
        couponId: couponId,
        sessionId: data.sessionId !== undefined ? data.sessionId : currentOrder.sessionId,
        paymentMethod: data.paymentMethod !== undefined ? data.paymentMethod : currentOrder.paymentMethod
      },
      include: {
        items: true,
        table: true
      }
    });

    // Handle status changes for table occupancy
    const targetStatus = data.status || updated.status;
    if (targetStatus === 'PAID' || targetStatus === 'CANCELLED') {
      await prisma.table.update({
        where: { id: updated.tableId },
        data: { status: 'AVAILABLE' },
      });
      const io = getSocketIO();
      if (io) {
        io.emit('table-updated', { tableId: updated.tableId, status: 'AVAILABLE' });
      }
    }

    return updated;
  }

  async parseVoiceOrder(text: string) {
    const products = await prisma.product.findMany();
    const words = text.toLowerCase().split(/\s+/);
    
    const quantityMap: Record<string, number> = {
      'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
      'a': 1, 'an': 1
    };

    const parsedItems: any[] = [];

    // Simple deterministic parsing
    for (let i = 0; i < words.length; i++) {
      let qty = 1;
      
      // Check if previous word was a number
      if (i > 0) {
        const prevWord = words[i - 1];
        if (quantityMap[prevWord]) qty = quantityMap[prevWord];
        else if (!isNaN(parseInt(prevWord))) qty = parseInt(prevWord);
      }

      // Check if current word (or next words) match a product
      for (const product of products) {
        const pName = product.name.toLowerCase();
        // Exact match or contains
        if (pName.includes(words[i]) && words[i].length > 3) { // avoid matching 'tea' with 'team' randomly, wait 'tea' is 3 chars. 
           // Better: just check if the product name is in the text
        }
      }
    }

    // A more robust approach for hackathon:
    const foundItems = [];
    for (const product of products) {
      const pName = product.name.toLowerCase();
      if (text.toLowerCase().includes(pName)) {
        // Try to find a number right before it
        const regex = new RegExp(`(?:(\\d+|(?:one|two|three|four|five|six|seven|eight|nine|ten|a|an))\\s+)?${pName}`, 'i');
        const match = text.match(regex);
        let qty = 1;
        if (match && match[1]) {
          const numStr = match[1].toLowerCase();
          qty = quantityMap[numStr] || parseInt(numStr) || 1;
        }
        foundItems.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          qty
        });
      }
    }

    return foundItems;
  }

  async sendOrderToKitchen(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, kitchenTickets: { include: { items: true } } }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Filter items where sentToKitchenAt is null
    const unsentItems = order.items.filter(item => item.sentToKitchenAt === null);

    if (unsentItems.length === 0) {
      // Nothing new to send
      return order.kitchenTickets[0] || null;
    }

    const now = new Date();

    // Stamp sentToKitchenAt on unsent items
    await prisma.orderItem.updateMany({
      where: {
        id: { in: unsentItems.map(item => item.id) }
      },
      data: {
        sentToKitchenAt: now
      }
    });

    // Find existing ticket
    let ticket: any = order.kitchenTickets[0];

    if (ticket) {
      // Add new items to the existing kitchen ticket and set status back to TO_COOK
      await prisma.kitchenTicket.update({
        where: { id: ticket.id },
        data: {
          status: 'TO_COOK',
          items: {
            create: unsentItems.map(item => ({
              orderItemId: item.id,
              completed: false
            }))
          }
        }
      });
    } else {
      // Create a new kitchen ticket
      ticket = await prisma.kitchenTicket.create({
        data: {
          orderId: order.id,
          status: 'TO_COOK',
          items: {
            create: unsentItems.map(item => ({
              orderItemId: item.id,
              completed: false
            }))
          }
        }
      });
    }

    // Fetch full ticket details for broadcasting
    const updatedTicket = await prisma.kitchenTicket.findUnique({
      where: { id: ticket.id },
      include: {
        order: {
          include: { table: true }
        },
        items: {
          include: {
            orderItem: { include: { product: true } }
          }
        }
      }
    });

    const io = getSocketIO();
    if (io) {
      io.emit('new-ticket', updatedTicket);
      io.emit('ticket-updated', updatedTicket);
    }

    return updatedTicket;
  }
}
