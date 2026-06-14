
import { prisma } from '../../db/prisma';

export class ReportsService {
  async getDashboardReport(
    period: string,
    employeeId?: string,
    productId?: string,
    dateFrom?: string,
    dateTo?: string
  ) {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now);

    // Parse date ranges for current and previous comparison periods
    let prevStartDate: Date;
    let prevEndDate: Date;

    switch (period) {
      case 'today': {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        
        prevStartDate = new Date(startDate);
        prevStartDate.setDate(startDate.getDate() - 1);
        prevEndDate = new Date(endDate);
        prevEndDate.setDate(endDate.getDate() - 1);
        break;
      }
      case 'week': {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay()); // Sunday
        startDate.setHours(0, 0, 0, 0);
        
        const duration = endDate.getTime() - startDate.getTime();
        prevStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        prevEndDate = new Date(prevStartDate.getTime() + duration);
        break;
      }
      case 'month': {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const duration = endDate.getTime() - startDate.getTime();
        prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        prevEndDate = new Date(prevStartDate.getTime() + duration);
        break;
      }
      case 'custom': {
        startDate = dateFrom ? new Date(dateFrom) : new Date(0);
        endDate = dateTo ? new Date(dateTo) : new Date();
        
        const duration = endDate.getTime() - startDate.getTime();
        prevStartDate = new Date(startDate.getTime() - duration);
        prevEndDate = new Date(startDate.getTime() - 1);
        break;
      }
      default: {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        
        prevStartDate = new Date(startDate);
        prevStartDate.setDate(startDate.getDate() - 1);
        prevEndDate = new Date(endDate);
        prevEndDate.setDate(endDate.getDate() - 1);
      }
    }

    // Query active period orders
    const where: any = {
      status: 'PAID',
      createdAt: { gte: startDate, lte: endDate },
    };
    if (employeeId) where.employeeId = employeeId;
    if (productId) where.items = { some: { productId } };

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              include: { category: true }
            }
          }
        },
        employee: true,
        customer: true,
        table: true
      },
    });

    // Query previous period orders for percentage change calculations
    const prevWhere: any = {
      status: 'PAID',
      createdAt: { gte: prevStartDate, lte: prevEndDate },
    };
    if (employeeId) prevWhere.employeeId = employeeId;
    if (productId) prevWhere.items = { some: { productId } };

    const prevOrders = await prisma.order.findMany({
      where: prevWhere
    });

    // Current metrics
    const totalOrders = orders.length;
    const revenue = orders.reduce((sum, o) => sum + o.total, 0);
    const avgOrderValue = totalOrders > 0 ? revenue / totalOrders : 0;

    // Previous metrics
    const prevTotalOrders = prevOrders.length;
    const prevRevenue = prevOrders.reduce((sum, o) => sum + o.total, 0);
    const prevAvgOrderValue = prevTotalOrders > 0 ? prevRevenue / prevTotalOrders : 0;

    // Percentage changes
    const totalOrdersPctChange = prevTotalOrders > 0 
      ? Math.round(((totalOrders - prevTotalOrders) / prevTotalOrders) * 100 * 10) / 10
      : 0;
    const revenuePctChange = prevRevenue > 0 
      ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100 * 10) / 10
      : 0;
    const avgOrderPctChange = prevAvgOrderValue > 0 
      ? Math.round(((avgOrderValue - prevAvgOrderValue) / prevAvgOrderValue) * 100 * 10) / 10
      : 0;

    // Sales trend grouping: Hour of day for 'today', date string otherwise
    const trendMap: Record<string, { revenue: number; orderCount: number }> = {};
    if (period === 'today') {
      // Pre-populate hourly slots for today
      for (let h = 9; h <= 21; h++) {
        const displayHour = h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`;
        trendMap[displayHour] = { revenue: 0, orderCount: 0 };
      }
      
      orders.forEach(o => {
        const hr = o.createdAt.getHours();
        const displayHour = hr === 12 ? '12 PM' : hr > 12 ? `${hr - 12} PM` : `${hr} AM`;
        if (trendMap[displayHour] !== undefined) {
          trendMap[displayHour].revenue += o.total;
          trendMap[displayHour].orderCount += 1;
        }
      });
    } else {
      orders.forEach(o => {
        const day = o.createdAt.toISOString().split('T')[0];
        if (!trendMap[day]) trendMap[day] = { revenue: 0, orderCount: 0 };
        trendMap[day].revenue += o.total;
        trendMap[day].orderCount += 1;
      });
    }

    const salesTrend = Object.entries(trendMap).map(([label, v]) => ({
      date: label,
      revenue: v.revenue,
      orderCount: v.orderCount
    }));

    if (period !== 'today') {
      salesTrend.sort((a, b) => a.date.localeCompare(b.date));
    }

    // Top products
    const productMap: Record<string, { productName: string; qty: number; revenue: number }> = {};
    orders.forEach(o => {
      o.items.forEach(i => {
        if (!productMap[i.productId]) {
          productMap[i.productId] = { productName: i.product.name, qty: 0, revenue: 0 };
        }
        productMap[i.productId].qty += i.qty;
        productMap[i.productId].revenue += i.lineTotal;
      });
    });
    const topProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

    // Top categories and Top categories table
    const categoryMap: Record<string, { category: string; color: string; revenue: number }> = {};
    orders.forEach(o => {
      o.items.forEach(i => {
        const cat = i.product.category;
        const catId = cat ? cat.id : 'uncategorized';
        if (!categoryMap[catId]) {
          categoryMap[catId] = { 
            category: cat ? cat.name : 'Uncategorized', 
            color: cat ? (cat.color || '#8e827b') : '#8e827b', 
            revenue: 0 
          };
        }
        categoryMap[catId].revenue += i.lineTotal;
      });
    });
    const topCategoriesList = Object.values(categoryMap).sort((a, b) => b.revenue - a.revenue);
    
    // Format for charts/pie and tables
    const topCategories = topCategoriesList.map(c => ({
      name: c.category,
      revenue: c.revenue,
      revenuePct: revenue > 0 ? Math.round((c.revenue / revenue) * 100 * 10) / 10 : 0
    }));

    const topCategoryTable = topCategoriesList.map(c => ({
      category: c.category,
      revenue: c.revenue
    }));

    // Top orders
    const topOrders = [...orders]
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
      .map(o => ({
        id: o.id,
        orderNumber: o.id.split('-')[0],
        total: o.total,
        createdAt: o.createdAt,
        sessionId: o.sessionId ? o.sessionId.split('-')[0] : '—',
        tableName: o.table ? `Table ${o.table.number}` : 'POS Label',
        customerName: o.customer?.name || 'Guest',
        employeeName: o.employee ? o.employee.name : 'System'
      }));

    return {
      summary: { 
        totalOrders, 
        revenue, 
        avgOrderValue,
        totalOrdersPctChange,
        revenuePctChange,
        avgOrderPctChange
      },
      salesTrend,
      topProducts,
      topCategories,
      topCategoryTable,
      topOrders
    };
  }
}
