
import { prisma } from '../../db/prisma';

export class CategoryService {
  async getAllCategories() {
    return prisma.category.findMany({
      include: {
        products: true,
      },
    });
  }

  async getCategoryById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });
  }

  async createCategory(data: any) {
    return prisma.category.create({
      data: {
        name: data.name,
        color: data.color,
      },
    });
  }

  async updateCategory(id: string, data: any) {
    return prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        color: data.color,
      },
    });
  }

  async deleteCategory(id: string) {
    await prisma.category.delete({
      where: { id },
    });
  }
}
