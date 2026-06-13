import { Request, Response } from 'express';
import { CustomerService } from './customer.service';

// TODO: Handle customer HTTP requests. Controller contains no DB queries.

export class CustomerController {
  private customerService = new CustomerService();

  getAll = async (req: Request, res: Response) => {
    try {
      const search = req.query.search as string | undefined;
      const customers = await this.customerService.getAllCustomers(search);
      return res.status(200).json(customers);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const customer = await this.customerService.createCustomer(req.body);
      return res.status(201).json(customer);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const customer = await this.customerService.updateCustomer(req.params.id, req.body);
      return res.status(200).json(customer);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      await this.customerService.deleteCustomer(req.params.id);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };
}
