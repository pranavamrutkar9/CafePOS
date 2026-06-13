import { Request, Response } from 'express';
import { EmployeeService } from './employee.service';

// TODO: Handle employee endpoints HTTP requests. Controller contains no DB queries.

export class EmployeeController {
  private employeeService = new EmployeeService();

  getAll = async (req: Request, res: Response) => {
    try {
      const employees = await this.employeeService.getAllEmployees();
      return res.status(200).json(employees);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const employee = await this.employeeService.createEmployee(req.body);
      return res.status(201).json(employee);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const employee = await this.employeeService.updateEmployee(req.params.id, req.body);
      return res.status(200).json(employee);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      await this.employeeService.deleteEmployee(req.params.id);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };
}
