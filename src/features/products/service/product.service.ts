import { productRepository } from '@/features/products/repository/product.repository';
import type { ProductDocument } from '@/features/products/schema/product.schema';
import type { Product, ProductListResponse } from '@/features/products/types/product.types';
import type { CreateProductType } from '@/features/products/validations/product.validation';
import type { ServiceResult } from '@/shared/types/common';

function docToProduct(doc: ProductDocument): Product {
  return {
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description ?? undefined,
    price: doc.price,
    stock: doc.stock,
    category: doc.category,
    status: doc.status as Product['status'],
    image: doc.image ?? undefined,
    rating: doc.rating ?? 0,
    createdAt: doc.createdAt?.toISOString() ?? '',
  };
}

type GetProductsParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
};

export async function getProductsService(
  params: GetProductsParams = {}
): Promise<ServiceResult<ProductListResponse>> {
  const { items, total } = await productRepository.findAll(params);
  return { data: { products: items.map(docToProduct), total }, status: 200 };
}

export async function createProductService(
  input: CreateProductType
): Promise<ServiceResult<Product>> {
  const id = await productRepository.create({
    name: input.name,
    description: input.description,
    price: input.price,
    stock: input.stock,
    category: input.category,
    status: input.status ?? 'draft',
    image: input.image || undefined,
    rating: 0,
  });
  const doc = await productRepository.findById(id);
  if (!doc) return { data: { error: 'NOT_FOUND' }, status: 404 };
  return { data: docToProduct(doc), status: 201 };
}
