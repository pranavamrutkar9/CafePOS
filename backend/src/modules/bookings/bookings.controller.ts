import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class BookingsController {
  getAll = async (req: Request, res: Response) => {
    try {
      const bookings = await prisma.booking.findMany({
        include: {
          customer: true,
          table: true
        },
        orderBy: {
          datetime: 'asc'
        }
      });
      return res.status(200).json(bookings);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const { customerId, tableId, datetime, status } = req.body;
      if (!datetime) {
        return res.status(400).json({ error: 'Datetime is required' });
      }

      const booking = await prisma.booking.create({
        data: {
          customerId: customerId || null,
          tableId: tableId || null,
          datetime: new Date(datetime),
          status: status || 'PENDING'
        },
        include: {
          customer: true,
          table: true
        }
      });
      return res.status(201).json(booking);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };
}
