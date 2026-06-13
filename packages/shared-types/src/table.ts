// TODO: Implement full floor/table interfaces and schemas

export interface ITable {
  id: string;
  name: string;
  floorId: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
  currentOrderId?: string;
}

export interface IFloor {
  id: string;
  name: string;
  tables?: ITable[];
}
