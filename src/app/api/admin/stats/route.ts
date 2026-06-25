import { NextResponse } from 'next/server';

import { userRepository } from '@/features/auth/repository/user.repository';
import { orderRepository } from '@/features/orders/repository/order.repository';
import { productRepository } from '@/features/products/repository/product.repository';
import { sellerRepository } from '@/features/sellers/repository/seller.repository';
import { auth } from '@/shared/lib/auth';

type SessionUser = { role?: 'admin' | 'user' };

export async function GET() {
  try {
    const session = await auth();
    const user = session?.user as SessionUser | undefined;
    if (!session || user?.role !== 'admin') {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
    const [orderStats, usersResult, productsResult, sellers] = await Promise.all([
      orderRepository.getStats(),
      userRepository.findAll({ limit: 1 }),
      productRepository.findAll({ limit: 1 }),
      sellerRepository.findAll({}),
    ]);
    const totalOrders = Object.values(orderStats.countByStatus).reduce((a, b) => a + b, 0);
    return NextResponse.json({
      totalRevenue: orderStats.totalRevenue,
      totalOrders,
      totalUsers: usersResult.total,
      totalProducts: productsResult.total,
      totalSellers: sellers.total,
      pendingOrders: orderStats.countByStatus['pending'] ?? 0,
      countByStatus: orderStats.countByStatus,
    });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
