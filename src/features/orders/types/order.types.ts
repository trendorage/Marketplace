export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';

export type Order = {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  product: string;
  category: string;
  amount: number;
  status: OrderStatus;
  date: string;
};

export type OrderListResponse = {
  orders: Order[];
  total: number;
};

export type OrderStats = {
  totalRevenue: number;
  totalRefunds: number;
  countByStatus: Record<string, number>;
};
