import { ICategory } from '@cafepos/shared-types';

// TODO: Handle category database interactions. Service has no req/res.

export class CategoryService {
  async getAllCategories(): Promise<ICategory[]> {
    return [];
  }

  async createCategory(data: any): Promise<ICategory> {
    return {
      id: 'mock-category-id',
      name: data.name || 'New Category',
      description: data.description || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async updateCategory(id: string, data: any): Promise<ICategory> {
    return {
      id,
      name: data.name || 'Updated Category',
      description: data.description || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async deleteCategory(id: string): Promise<void> {
    return;
  }
}
