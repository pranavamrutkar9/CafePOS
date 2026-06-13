import { Request, Response } from 'express';
import { ProductService } from './product.service';

// TODO: Handle product routes HTTP requests. Controller contains no DB queries.

export class ProductController {
  private productService = new ProductService();

  getAll = async (req: Request, res: Response) => {
    try {
      const products = await this.productService.getAllProducts();
      return res.status(200).json(products);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const product = await this.productService.getProductById(req.params.id);
      if (!product) return res.status(404).json({ message: 'Product not found' });
      return res.status(200).json(product);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  getUpsellSuggestions = async (req: Request, res: Response) => {
    try {
      const suggestions = await this.productService.getUpsellSuggestions(req.params.id);
      return res.status(200).json(suggestions);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const newProduct = await this.productService.createProduct(req.body);
      return res.status(201).json(newProduct);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const updatedProduct = await this.productService.updateProduct(req.params.id, req.body);
      return res.status(200).json(updatedProduct);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      await this.productService.deleteProduct(req.params.id);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };
}
