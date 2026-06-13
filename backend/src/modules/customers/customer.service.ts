import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CustomerService {
  async getAll(search?: string): Promise<any[]> {
    if (search) {
      return prisma.customer.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        },
        orderBy: { createdAt: 'desc' }
      });
    }
    return prisma.customer.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(data: { name: string; email?: string | null; phone?: string | null }): Promise<any> {
    return prisma.customer.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null
      }
    });
  }

  async update(id: string, data: { name?: string; email?: string | null; phone?: string | null }): Promise<any> {
    return prisma.customer.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email !== undefined ? (data.email || null) : undefined,
        phone: data.phone !== undefined ? (data.phone || null) : undefined
      }
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.customer.delete({
      where: { id }
    });
  }
}
