import { Request, Response } from 'express';
import { ReportsService } from './reports.service';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

export class ReportsController {
  private reportsService = new ReportsService();

  getDashboardData = async (req: Request, res: Response) => {
    try {
      const period = (req.query.period as string) || 'today';
      const employeeId = req.query.employeeId as string;
      const productId = req.query.productId as string;

      const data = await this.reportsService.getDashboardReport(period, employeeId, productId);
      return res.status(200).json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  exportReport = async (req: Request, res: Response) => {
    try {
      const period = (req.query.period as string) || 'today';
      const employeeId = req.query.employeeId as string;
      const productId = req.query.productId as string;
      const format = req.query.format as string;

      const data = await this.reportsService.getDashboardReport(period, employeeId, productId);

      if (format === 'xls') {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Top Products');
        sheet.addRow(['Product', 'Quantity Sold', 'Revenue']);
        data.topProducts.forEach((p: any) => sheet.addRow([p.name, p.qty, p.revenue]));

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="report.xlsx"');
        
        await workbook.xlsx.write(res);
        res.end();
        return;
      }

      if (format === 'pdf') {
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');

        doc.pipe(res);

        doc.fontSize(18).text('Sales Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Total Orders: ${data.summary.totalOrders}`);
        doc.text(`Revenue: ₹${data.summary.revenue.toFixed(2)}`);
        doc.text(`Average Order Value: ₹${data.summary.avgOrderValue.toFixed(2)}`);
        doc.moveDown();
        doc.text('Top Products:', { underline: true });
        data.topProducts.forEach((p: any) => doc.text(`${p.name} - Qty: ${p.qty}, Revenue: ₹${p.revenue.toFixed(2)}`));

        doc.end();
        return;
      }

      return res.status(400).json({ error: 'Invalid format. Use "pdf" or "xls"' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };
}
