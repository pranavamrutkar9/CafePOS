import { Request, Response } from 'express';

import { prisma } from '../../db/prisma';

export class SessionController {
  getCurrent = async (req: Request, res: Response) => {
    try {
      const session = await prisma.session.findFirst({
        where: {
          status: 'OPEN'
        }
      });
      return res.status(200).json(session);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  open = async (req: Request, res: Response) => {
    try {
      const employeeId = req.body.employeeId || (req as any).user?.id;
      const { openingCash } = req.body;

      // Check if there is already an open session
      const existing = await prisma.session.findFirst({
        where: { status: 'OPEN' }
      });

      if (existing) {
        return res.status(400).json({ error: 'A session is already open' });
      }

      const session = await prisma.session.create({
        data: {
          employeeId,
          openingCash: Number(openingCash) || 0,
          status: 'OPEN',
          openedAt: new Date()
        }
      });
      return res.status(201).json(session);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  close = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { closingCash } = req.body;

      // Validate session exists and is open
      const existing = await prisma.session.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ error: 'Session not found' });
      }
      if (existing.status !== 'OPEN') {
        return res.status(400).json({ error: 'Session is already closed' });
      }

      const session = await prisma.session.update({
        where: { id },
        data: {
          status: 'CLOSED',
          closingCash: Number(closingCash) || 0,
          closedAt: new Date()
        }
      });
      return res.status(200).json(session);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  getLast = async (req: Request, res: Response) => {
    try {
      const session = await prisma.session.findFirst({
        where: { status: 'CLOSED' },
        orderBy: { closedAt: 'desc' }
      });
      return res.status(200).json(session);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };
}
