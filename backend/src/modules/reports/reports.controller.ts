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
      const dateFrom = req.query.dateFrom as string;
      const dateTo = req.query.dateTo as string;

      const data = await this.reportsService.getDashboardReport(period, employeeId, productId, dateFrom, dateTo);
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
      const dateFrom = req.query.dateFrom as string;
      const dateTo = req.query.dateTo as string;
      const format = req.query.format as string;

      const data = await this.reportsService.getDashboardReport(period, employeeId, productId, dateFrom, dateTo);

      if (format === 'xls') {
        const workbook = new ExcelJS.Workbook();
        
        // Sheet 1: Summary Dashboard
        const summarySheet = workbook.addWorksheet('Dashboard Summary');
        summarySheet.addRow(['Metric', 'Value']);
        summarySheet.addRow(['Total Orders', data.summary.totalOrders]);
        summarySheet.addRow(['Revenue', data.summary.revenue]);
        summarySheet.addRow(['Average Order Value', data.summary.avgOrderValue]);

        // Sheet 2: Top Selling Products
        const productSheet = workbook.addWorksheet('Top Products');
        productSheet.addRow(['Product Name', 'Quantity Sold', 'Revenue (₹)']);
        data.topProducts.forEach((p: any) => {
          productSheet.addRow([p.productName, p.qty, p.revenue]);
        });

        // Sheet 3: Top Selling Categories
        const catSheet = workbook.addWorksheet('Top Categories');
        catSheet.addRow(['Category', 'Revenue (₹)', 'Revenue Share (%)']);
        data.topCategories.forEach((c: any) => {
          catSheet.addRow([c.name, c.revenue, c.revenuePct]);
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="report_${period}.xlsx"`);
        
        await workbook.xlsx.write(res);
        res.end();
        return;
      }

      if (format === 'pdf') {
        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="report_${period}.pdf"`);

        doc.pipe(res);

        // Header Title
        doc.fontSize(22).fillColor('#2C2623').text('CafePOS Sales Report', { align: 'center' });
        doc.fontSize(10).fillColor('#8E827B').text(`Generated on: ${new Date().toLocaleString()} | Period: ${period.toUpperCase()}`, { align: 'center' });
        doc.moveDown(2);

        // Summary Statistics Box
        doc.rect(50, doc.y, 500, 100).fill('#FAF8F5');
        doc.fillColor('#2C2623').fontSize(12);
        doc.text(`Dashboard Summary Statistics:`, 65, doc.y + 15, { underline: true });
        doc.fontSize(10);
        doc.text(`Total Orders Count:   ${data.summary.totalOrders}`, 65, doc.y + 20);
        doc.text(`Total Gross Revenue:  ₹${data.summary.revenue.toFixed(2)}`, 65, doc.y + 12);
        doc.text(`Average Order Value:  ₹${data.summary.avgOrderValue.toFixed(2)}`, 65, doc.y + 12);
        doc.moveDown(3);

        // Top Products Section
        doc.fillColor('#2C2623').fontSize(14).text('Top 10 Selling Products', 50, doc.y);
        doc.strokeColor('#EFECE7').lineWidth(1).moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
        doc.moveDown();

        doc.fontSize(10);
        data.topProducts.forEach((p: any, index: number) => {
          doc.fillColor('#2C2623').text(`${index + 1}. ${p.productName}`);
          doc.fillColor('#8E827B').text(`    Qty Sold: ${p.qty} | Total Revenue: ₹${p.revenue.toFixed(2)}`, { oblique: true });
          doc.moveDown(0.5);
        });

        doc.end();
        return;
      }

      return res.status(400).json({ error: 'Invalid format. Use "pdf" or "xls"' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };
}
