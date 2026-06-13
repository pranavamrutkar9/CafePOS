import { Request, Response } from 'express';
import { PaymentMethodService } from './payment-method.service';

// TODO: Handle HTTP requests for payment methods. Controller contains no DB queries.

export class PaymentMethodController {
  private paymentMethodService = new PaymentMethodService();

  getAll = async (req: Request, res: Response) => {
    try {
      const methods = await this.paymentMethodService.getAllMethods();
      return res.status(200).json(methods);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const method = await this.paymentMethodService.createMethod(req.body);
      return res.status(201).json(method);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };
}
