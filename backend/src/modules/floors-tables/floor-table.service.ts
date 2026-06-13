import { IFloor, ITable } from '@cafepos/shared-types';

// TODO: Handle floors and tables database schema CRUD. Service has no req/res.

export class FloorTableService {
  async getAllFloors(): Promise<IFloor[]> {
    return [];
  }

  async getAllTables(): Promise<ITable[]> {
    return [];
  }

  async createFloor(data: any): Promise<IFloor> {
    return {
      id: 'mock-floor-id',
      name: data.name || 'New Floor',
    };
  }

  async createTable(data: any): Promise<ITable> {
    return {
      id: 'mock-table-id',
      name: data.name || 'New Table',
      floorId: data.floorId || 'mock-floor-id',
      capacity: data.capacity || 4,
      status: 'AVAILABLE'
    };
  }

  async updateTable(id: string, data: any): Promise<ITable> {
    return {
      id,
      name: data.name || 'Updated Table',
      floorId: data.floorId || 'mock-floor-id',
      capacity: data.capacity || 4,
      status: data.status || 'AVAILABLE',
      currentOrderId: data.currentOrderId
    };
  }
}
