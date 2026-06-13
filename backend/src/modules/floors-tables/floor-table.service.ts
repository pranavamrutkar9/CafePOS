import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class FloorTableService {
  async getAllFloors() {
    return prisma.floor.findMany({
      include: {
        tables: true,
      },
    });
  }

  async getAllTables() {
    return prisma.table.findMany({
      include: {
        floor: true,
        orders: {
          where: {
            status: 'DRAFT', // Only get active orders
          },
        },
      },
    });
  }

  async createFloor(data: any) {
    return prisma.floor.create({
      data: {
        name: data.name,
      },
    });
  }

  async createTable(data: any) {
    return prisma.table.create({
      data: {
        number: data.number || data.name, // The shared types might use 'name' instead of 'number'
        floorId: data.floorId,
        seats: Number(data.capacity || data.seats || 4),
        status: data.status || 'AVAILABLE',
      },
    });
  }

  async updateTable(id: string, data: any) {
    return prisma.table.update({
      where: { id },
      data: {
        number: data.number || data.name,
        floorId: data.floorId,
        seats: data.capacity || data.seats ? Number(data.capacity || data.seats) : undefined,
        status: data.status,
      },
    });
  }
}
