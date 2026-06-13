import { Request, Response } from 'express';
import { CategoryService } from './category.service';

// TODO: Handle category HTTP requests. Controller contains no DB queries.

export class CategoryController {
  private categoryService = new CategoryService();

  getAll = async (req: Request, res: Response) => {
    try {
      const categories = await this.categoryService.getAllCategories();
      return res.status(200).json(categories);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const category = await this.categoryService.createCategory(req.body);
      return res.status(201).json(category);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const category = await this.categoryService.updateCategory(req.params.id, req.body);
      return res.status(200).json(category);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      await this.categoryService.deleteCategory(req.params.id);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };
}
