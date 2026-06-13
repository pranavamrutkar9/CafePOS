import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CustomerService {
  async getAllCustomers(search?: string): Promise<any[]> {
    if (search) {
      return prisma.customer.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } }
          ]
        },
        orderBy: { name: 'asc' }
      });
    }
    return prisma.customer.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async createCustomer(data: any): Promise<any> {
    return prisma.customer.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null
      }
    });
  }

  async updateCustomer(id: string, data: any): Promise<any> {
    return prisma.customer.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email !== undefined ? data.email : undefined,
        phone: data.phone !== undefined ? data.phone : undefined
      }
    });
  }

  async deleteCustomer(id: string): Promise<void> {
    await prisma.customer.delete({
      where: { id }
    });
  }
}
