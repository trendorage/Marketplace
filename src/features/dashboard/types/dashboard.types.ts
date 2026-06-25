export type KpiMetric = {
  id: string;
  title: string;
  value: string;
  change: string;
  changeType: 'up' | 'down' | 'neutral';
  icon: string;
  color: string;
};

export type ChartPeriod = '7d' | '30d' | '1y';

export type RevenuePoint = {
  label: string;
  revenue: number;
  orders: number;
  commission: number;
};

export type { OrderStatus } from '@/features/orders/types/order.types';
import type { OrderStatus } from '@/features/orders/types/order.types';

export type OrderItem = {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  product: string;
  amount: number;
  status: OrderStatus;
  date: string;
  category: string;
};

export type UserStatus = 'active' | 'inactive' | 'banned';
export type UserRole = 'user' | 'seller' | 'admin';

export type UserItem = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joinDate: string;
  orders: number;
  totalSpent: number;
};

export type SellerStatus = 'active' | 'pending' | 'suspended';

export type SellerItem = {
  id: string;
  name: string;
  email: string;
  storeName: string;
  revenue: number;
  products: number;
  rating: number;
  totalSales: number;
  status: SellerStatus;
  joinDate: string;
  commissionRate: number;
};

export type ProductStatus = 'active' | 'draft' | 'out_of_stock' | 'pending';

export type ProductItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sales: number;
  revenue: number;
  status: ProductStatus;
  seller: string;
  rating: number;
  createdAt: string;
};

export type NotificationType = 'order' | 'user' | 'seller' | 'product' | 'system' | 'payment';

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
};

export type TransactionType = 'order' | 'payout' | 'refund' | 'commission';
export type TransactionStatus = 'completed' | 'pending' | 'failed';

export type TransactionItem = {
  id: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  from: string;
  to: string;
  date: string;
  description: string;
};

export type CategoryStat = {
  name: string;
  products: number;
  revenue: number;
  growth: string;
};

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: string;
  badge?: number;
};

export type DashboardSidebarSection = {
  title: string;
  items: DashboardNavItem[];
};
