export type ProductStatus = 'active' | 'draft' | 'out_of_stock' | 'pending';

export type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  status: ProductStatus;
  image?: string;
  rating: number;
  createdAt: string;
};

export type ProductListResponse = {
  products: Product[];
  total: number;
};
