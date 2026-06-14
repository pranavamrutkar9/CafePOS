
import { prisma } from '../../db/prisma';

export class PaymentMethodService {
  async getAllMethods(): Promise<any[]> {
    return prisma.paymentMethod.findMany({
      orderBy: { type: 'asc' }
    });
  }

  async createMethod(data: any): Promise<any> {
    return prisma.paymentMethod.create({
      data: {
        type: data.type,
        enabled: data.enabled !== undefined ? data.enabled : true,
        upiId: data.upiId || null
      }
    });
  }

  async updateMethod(id: string, data: any): Promise<any> {
    return prisma.paymentMethod.update({
      where: { id },
      data: {
        type: data.type,
        enabled: data.enabled !== undefined ? data.enabled : undefined,
        upiId: data.upiId !== undefined ? data.upiId : undefined
      }
    });
  }

  async deleteMethod(id: string): Promise<void> {
    await prisma.paymentMethod.delete({
      where: { id }
    });
  }
}
