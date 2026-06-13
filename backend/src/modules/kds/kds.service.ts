import { PrismaClient } from '@prisma/client';
import { getSocketIO } from '../../socket/index';

const prisma = new PrismaClient();

export class KdsService {
  async getTickets() {
    return prisma.kitchenTicket.findMany({
      include: {
        order: {
          include: {
            table: true,
            employee: true,
          },
        },
        items: {
          include: {
            orderItem: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateTicket(id: string, status: string) {
    const ticket = await prisma.kitchenTicket.update({
      where: { id },
      data: { status },
      include: {
        order: {
          include: {
            table: true,
            employee: true,
          },
        },
        items: {
          include: {
            orderItem: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    // Notify POS or KDS clients
    const io = getSocketIO();
    if (io) {
      io.emit('ticket-updated', ticket);
    }

    return ticket;
  }

  async advanceTicket(id: string) {
    const ticket = await prisma.kitchenTicket.findUnique({ where: { id } });
    if (!ticket) throw new Error('Ticket not found');
    let nextStatus = ticket.status;
    if (ticket.status === 'TO_COOK') nextStatus = 'PREPARING';
    else if (ticket.status === 'PREPARING') nextStatus = 'COMPLETED';
    
    return this.updateTicket(id, nextStatus);
  }

  async updateTicketItem(ticketId: string, itemId: string, completed: boolean) {
    const item = await prisma.kitchenTicketItem.update({
      where: { id: itemId },
      data: { completed },
      include: {
        ticket: {
          include: {
            order: {
              include: {
                table: true,
                employee: true,
              },
            },
            items: {
              include: {
                orderItem: {
                  include: {
                    product: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const io = getSocketIO();
    if (io) {
      io.emit('ticket-updated', item.ticket);
    }
    return item.ticket;
  }

  async getLoad() {
    const AVG_PREP_MINUTES_PER_ITEM = 3;

    // Use KitchenTicket to find load instead of Order, since KDS operates on tickets
    const activeTickets = await prisma.kitchenTicket.findMany({
      where: { status: { in: ['TO_COOK', 'PREPARING'] } },
      include: { items: { include: { orderItem: true } }, order: true },
    });

    const totalItems = activeTickets.reduce((sum, t) => sum + t.items.reduce((s, i) => s + i.orderItem.qty, 0), 0);
    const estimatedQueueMinutes = totalItems * AVG_PREP_MINUTES_PER_ITEM;

    let level: 'green' | 'yellow' | 'red' = 'green';
    if (estimatedQueueMinutes > 30) level = 'red';
    else if (estimatedQueueMinutes > 12) level = 'yellow';

    const ordersWithEta = activeTickets.map((ticket, idx) => {
      const itemsAhead = activeTickets.slice(0, idx).reduce((sum, t) => sum + t.items.reduce((s, i) => s + i.orderItem.qty, 0), 0);
      const ticketItems = ticket.items.reduce((s, i) => s + i.orderItem.qty, 0);
      return {
        ticketId: ticket.id,
        orderId: ticket.orderId,
        etaMinutes: (itemsAhead + ticketItems) * AVG_PREP_MINUTES_PER_ITEM,
      };
    });

    return { level, estimatedQueueMinutes, ordersWithEta };
  }
}
