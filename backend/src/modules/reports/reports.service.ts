import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ReportsService {
  async getDashboardReport(period: string, employeeId?: string, productId?: string) {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'custom':
        // Handle custom if needed; we'll fallback to 0 for simplicity here as from/to isn't strictly requested to be wired up heavily
        startDate = new Date(0);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

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
        }
      },
    });

    // Summary metrics
    const totalOrders = orders.length;
    const revenue = orders.reduce((sum, o) => sum + o.total, 0);
    const avgOrderValue = totalOrders > 0 ? revenue / totalOrders : 0;

    // Sales trend (group by day)
    const trendMap: Record<string, { revenue: number; count: number }> = {};
    orders.forEach(o => {
      const day = o.createdAt.toISOString().split('T')[0];
      if (!trendMap[day]) trendMap[day] = { revenue: 0, count: 0 };
      trendMap[day].revenue += o.total;
      trendMap[day].count += 1;
    });
    const salesTrend = Object.entries(trendMap)
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top products
    const productMap: Record<string, { name: string; qty: number; revenue: number }> = {};
    orders.forEach(o => {
      o.items.forEach(i => {
        if (!productMap[i.productId]) {
          productMap[i.productId] = { name: i.product.name, qty: 0, revenue: 0 };
        }
        productMap[i.productId].qty += i.qty;
        productMap[i.productId].revenue += i.lineTotal;
      });
    });
    const topProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

    // Top categories
    const categoryMap: Record<string, { name: string; color: string; revenue: number }> = {};
    orders.forEach(o => {
      o.items.forEach(i => {
        const cat = i.product.category;
        const catId = cat ? cat.id : 'uncategorized';
        if (!categoryMap[catId]) {
          categoryMap[catId] = { 
            name: cat ? cat.name : 'Uncategorized', 
            color: cat ? (cat.color || '#000') : '#000', 
            revenue: 0 
          };
        }
        categoryMap[catId].revenue += i.lineTotal;
      });
    });
    const topCategories = Object.values(categoryMap).sort((a, b) => b.revenue - a.revenue);

    // Top orders
    const topOrders = [...orders]
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
      .map(o => ({ orderNumber: o.id.split('-')[0], total: o.total, createdAt: o.createdAt }));

    return {
      summary: { totalOrders, revenue, avgOrderValue },
      salesTrend,
      topProducts,
      topCategories,
      topOrders,
    };
  }
}
