import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ProductService {
  async getAllProducts() {
    return prisma.product.findMany({
      include: {
        category: true,
      },
    });
  }

  async getProductById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  async createProduct(data: any) {
    return prisma.product.create({
      data: {
        name: data.name,
        categoryId: data.categoryId,
        price: Number(data.price),
        tax: Number(data.tax),
        unit: data.unit,
        description: data.description,
        status: data.status || 'ACTIVE',
      },
      include: {
        category: true,
      },
    });
  }

  async updateProduct(id: string, data: any) {
    return prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        categoryId: data.categoryId,
        price: data.price !== undefined ? Number(data.price) : undefined,
        tax: data.tax !== undefined ? Number(data.tax) : undefined,
        unit: data.unit,
        description: data.description,
        status: data.status,
      },
      include: {
        category: true,
      },
    });
  }

  async deleteProduct(id: string) {
    await prisma.product.delete({
      where: { id },
    });
  }

  async getUpsellSuggestions(productId: string) {
    // 1. Find all orders containing this product
    const orderItems = await prisma.orderItem.findMany({
      where: { productId },
      select: { orderId: true }
    });
    const orderIds = orderItems.map(oi => oi.orderId);

    // 2. Find other products in these same orders
    const coOccurringItems = await prisma.orderItem.findMany({
      where: {
        orderId: { in: orderIds },
        productId: { not: productId }
      },
      include: { product: true }
    });

    // 3. Count frequencies
    const frequencies: Record<string, { product: any, count: number }> = {};
    for (const item of coOccurringItems) {
      if (!frequencies[item.productId]) {
        frequencies[item.productId] = { product: item.product, count: 0 };
      }
      frequencies[item.productId].count++;
    }

    // 4. Sort by highest frequency and return top 3
    const sorted = Object.values(frequencies).sort((a, b) => b.count - a.count).slice(0, 3);
    
    // If no data, return random 3 products as fallback
    if (sorted.length === 0) {
      const fallback = await prisma.product.findMany({
        where: { id: { not: productId } },
        take: 3
      });
      return fallback;
    }

    return sorted.map(s => s.product);
  }
}
