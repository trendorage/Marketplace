import { sellerRepository } from '@/features/sellers/repository/seller.repository';
import type { SellerDocument } from '@/features/sellers/schema/seller.schema';
import type { ServiceResult } from '@/shared/types/common';

type Seller = {
  id: string;
  name: string;
  email: string;
  storeName: string;
  commissionRate: number;
  rating: number;
  revenue: number;
  products: number;
  status: string;
  joinDate: string;
};

function docToSeller(doc: SellerDocument): Seller {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    storeName: doc.storeName,
    commissionRate: doc.commissionRate ?? 10,
    rating: doc.rating ?? 0,
    revenue: doc.revenue ?? 0,
    products: doc.products ?? 0,
    status: doc.status,
    joinDate: doc.createdAt?.toISOString() ?? '',
  };
}

export async function getSellersService(
  params: { search?: string; status?: string } = {}
): Promise<ServiceResult<{ sellers: Seller[] }>> {
  const items = await sellerRepository.findAll(params);
  return { data: { sellers: items.map(docToSeller) }, status: 200 };
}
