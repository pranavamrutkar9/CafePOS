// TODO: Manage database CRUD operations for payment configurations via PrismaClient. Service has no req/res.

export class PaymentMethodService {
  async getAllMethods(): Promise<any[]> {
    return [];
  }

  async createMethod(data: any): Promise<any> {
    return {
      id: 'mock-payment-method-id',
      name: data.name || 'New Payment Method',
      isActive: true,
    };
  }
}
