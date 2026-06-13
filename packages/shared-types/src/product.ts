// TODO: Implement full product interfaces and schemas as part of POS development

export interface IProduct {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
