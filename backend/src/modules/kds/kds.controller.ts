import { Request, Response } from 'express';
import { KdsService } from './kds.service';

// TODO: Handle HTTP requests for KDS screen updates. Controller contains no DB queries.

export class KdsController {
  private kdsService = new KdsService();

  getActiveTickets = async (req: Request, res: Response) => {
    try {
      const tickets = await this.kdsService.getTickets();
      return res.status(200).json(tickets);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  updateTicketStatus = async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      const ticket = await this.kdsService.updateTicket(req.params.id, status);
      return res.status(200).json(ticket);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  advance = async (req: Request, res: Response) => {
    try {
      const ticket = await this.kdsService.advanceTicket(req.params.id);
      return res.status(200).json(ticket);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  updateItemStatus = async (req: Request, res: Response) => {
    try {
      const { completed } = req.body;
      const { id, itemId } = req.params;
      const ticket = await this.kdsService.updateTicketItem(id, itemId, completed === true);
      return res.status(200).json(ticket);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  getLoad = async (req: Request, res: Response) => {
    try {
      const load = await this.kdsService.getLoad();
      return res.status(200).json(load);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };
}
