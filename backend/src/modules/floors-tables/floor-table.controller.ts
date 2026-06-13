import { Request, Response } from 'express';
import { FloorTableService } from './floor-table.service';

// TODO: Handle HTTP requests for Floor and Table data. Controller contains no DB queries.

export class FloorTableController {
  private floorTableService = new FloorTableService();

  getFloors = async (req: Request, res: Response) => {
    try {
      const floors = await this.floorTableService.getAllFloors();
      return res.status(200).json(floors);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  getTables = async (req: Request, res: Response) => {
    try {
      const tables = await this.floorTableService.getAllTables();
      return res.status(200).json(tables);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  createFloor = async (req: Request, res: Response) => {
    try {
      const floor = await this.floorTableService.createFloor(req.body);
      return res.status(201).json(floor);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  createTable = async (req: Request, res: Response) => {
    try {
      const table = await this.floorTableService.createTable(req.body);
      return res.status(201).json(table);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  updateTable = async (req: Request, res: Response) => {
    try {
      const table = await this.floorTableService.updateTable(req.params.id, req.body);
      return res.status(200).json(table);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };
}
