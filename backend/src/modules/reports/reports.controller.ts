import { Request, Response } from 'express';
import { ReportsService } from './reports.service';

// TODO: Handle HTTP requests for reporting data. Controller contains no DB queries.

export class ReportsController {
  private reportsService = new ReportsService();

  getRevenueReport = async (req: Request, res: Response) => {
    try {
      const data = await this.reportsService.generateRevenueReport();
      return res.status(200).json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  getPopularProductsReport = async (req: Request, res: Response) => {
    try {
      const data = await this.reportsService.generatePopularProductsReport();
      return res.status(200).json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };
}
