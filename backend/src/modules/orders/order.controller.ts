import { Request, Response } from 'express';
import { OrderService } from './order.service';

// TODO: Handle HTTP requests for orders. Controller contains no DB queries.

export class OrderController {
  private orderService = new OrderService();

  getAll = async (req: Request, res: Response) => {
    try {
      const orders = await this.orderService.getAllOrders(req.query);
      return res.status(200).json(orders);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const order = await this.orderService.getOrderById(req.params.id);
      if (!order) return res.status(404).json({ message: 'Order not found' });
      return res.status(200).json(order);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  parseVoiceOrder = async (req: Request, res: Response) => {
    try {
      const items = await this.orderService.parseVoiceOrder(req.body.text || '');
      return res.status(200).json(items);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const order = await this.orderService.createOrder(req.body);
      return res.status(201).json(order);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const order = await this.orderService.updateOrder(req.params.id, req.body);
      return res.status(200).json(order);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  sendToKitchen = async (req: Request, res: Response) => {
    try {
      const ticket = await this.orderService.sendOrderToKitchen(req.params.id);
      return res.status(200).json(ticket);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  patchItems = async (req: Request, res: Response) => {
    try {
      const { productId, qty } = req.body;
      const order = await this.orderService.patchOrderItems(req.params.id, productId, Number(qty));
      return res.status(200).json(order);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  sendReceipt = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      const result = await this.orderService.sendReceipt(req.params.id, email);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };
}
