import { Request, Response } from 'express';
import { CustomerService } from './customer.service';

export class CustomerController {
  private customerService = new CustomerService();

  private validateEmail(email?: string | null): boolean {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getAll = async (req: Request, res: Response) => {
    try {
      const search = req.query.search as string | undefined;
      const customers = await this.customerService.getAll(search);
      return res.status(200).json(customers);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const { name, email, phone } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Name is required' });
      }

      if (email && !this.validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      const customer = await this.customerService.create({ name: name.trim(), email, phone });
      return res.status(201).json(customer);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Email already in use' });
      }
      return res.status(500).json({ error: error.message });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, email, phone } = req.body;

      if (name !== undefined && (!name || !name.trim())) {
        return res.status(400).json({ error: 'Name cannot be empty' });
      }

      if (email && !this.validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      const customer = await this.customerService.update(id, { name: name?.trim(), email, phone });
      return res.status(200).json(customer);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Email already in use' });
      }
      return res.status(500).json({ error: error.message });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.customerService.delete(id);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };
}
