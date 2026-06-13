import { Request, Response } from 'express';
import { OrderService } from './order.service';

// TODO: Handle HTTP requests for orders. Controller contains no DB queries.

export class OrderController {
  private orderService = new OrderService();

  getAll = async (req: Request, res: Response) => {
    try {
      const orders = await this.orderService.getAllOrders();
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
}
