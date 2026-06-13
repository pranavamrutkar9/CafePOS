import { IProduct } from '@cafepos/shared-types';

// TODO: Implement database operations for product records using PrismaClient. Service has no req/res.

export class ProductService {
  async getAllProducts(): Promise<IProduct[]> {
    // Mock get all
    return [];
  }

  async getProductById(id: string): Promise<IProduct | null> {
    // Mock get by id
    return null;
  }

  async createProduct(data: any): Promise<IProduct> {
    // Mock create
    return {
      id: 'mock-new-product-id',
      name: data.name || 'New Product',
      price: data.price || 0,
      categoryId: data.categoryId || 'mock-category-id',
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async updateProduct(id: string, data: any): Promise<IProduct> {
    // Mock update
    return {
      id,
      name: data.name || 'Updated Product',
      price: data.price || 0,
      categoryId: data.categoryId || 'mock-category-id',
      isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async deleteProduct(id: string): Promise<void> {
    // Mock delete
    return;
  }
}
