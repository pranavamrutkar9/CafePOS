import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export class EmployeeService {
  async getAllEmployees(): Promise<any[]> {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        disabled: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createEmployee(data: any): Promise<any> {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(data.password || 'password123', salt);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password_hash,
        role: data.role || 'EMPLOYEE',
        disabled: data.disabled !== undefined ? data.disabled : false
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        disabled: true,
        createdAt: true,
        updatedAt: true
      }
    });
    return user;
  }

  async updateEmployee(id: string, data: any): Promise<any> {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.disabled !== undefined) updateData.disabled = data.disabled;
    
    if (data.newPassword !== undefined && data.newPassword !== '') {
      const salt = await bcrypt.genSalt(10);
      updateData.password_hash = await bcrypt.hash(data.newPassword, salt);
    } else if (data.password !== undefined && data.password !== '') {
      const salt = await bcrypt.genSalt(10);
      updateData.password_hash = await bcrypt.hash(data.password, salt);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        disabled: true,
        createdAt: true,
        updatedAt: true
      }
    });
    return user;
  }

  async deleteEmployee(id: string): Promise<void> {
    try {
      await prisma.user.delete({
        where: { id }
      });
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new Error('CONFLICT: Cannot delete employee because they have associated orders or sessions. Disable the account instead.');
      }
      throw error;
    }
  }
}
