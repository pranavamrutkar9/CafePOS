import { PrismaClient } from '@prisma/client';
import { getSocketIO } from '../../socket/index';
import { CouponPromotionService } from '../coupons-promotions/coupon-promotion.service';
import { sendThankYouEmail } from '../notifications/email';

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
    const promoService = new CouponPromotionService();
    const { items: promoItems, orderDiscount } = await promoService.applyPromotionsToCart(data.items, data.subtotal);
    
    const finalDiscount = (data.discount || 0) + orderDiscount;
    const finalTotal = data.subtotal + data.tax - finalDiscount;

    const order = await prisma.order.create({
      data: {
        tableId: data.tableId,
        customerId: data.customerId,
        employeeId: data.employeeId,
        status: 'DRAFT',
        subtotal: data.subtotal,
        tax: data.tax,
        discount: finalDiscount,
        total: finalTotal,
        items: {
          create: promoItems.map((item: any) => ({
            productId: item.productId,
            qty: item.qty,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal,
            lineDiscount: item.lineDiscount,
          })),
        },
      },
      include: {
        items: true,
        table: true,
      },
    });

    // Create a kitchen ticket
    const ticket = await prisma.kitchenTicket.create({
      data: {
        orderId: order.id,
        status: 'TO_COOK',
        items: {
          create: order.items.map((item) => ({
            orderItemId: item.id,
            completed: false,
          })),
        },
      },
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

    // Broadcast new ticket to KDS
    const io = getSocketIO();
    if (io) {
      io.emit('new-ticket', ticket);
      // Update table status if needed
      io.emit('table-updated', { tableId: data.tableId, status: 'OCCUPIED' });
    }

    // Update table status
    await prisma.table.update({
      where: { id: data.tableId },
      data: { status: 'OCCUPIED' },
    });

    return order;
  }

  async updateOrder(id: string, data: any) {
    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: data.status,
      },
      include: {
        customer: true, // Fetch customer data for the email notification
      }
    });

    if (data.status === 'PAID' || data.status === 'CANCELLED') {
      await prisma.table.update({
        where: { id: updated.tableId },
        data: { status: 'AVAILABLE' },
      });
      const io = getSocketIO();
      if (io) {
        io.emit('table-updated', { tableId: updated.tableId, status: 'AVAILABLE' });
      }

      // Send the motivational "Thank You" email if it's a successful payment
      if (data.status === 'PAID' && updated.customer && updated.customer.email) {
        sendThankYouEmail(updated.customer.email, updated.customer.name);
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
}
