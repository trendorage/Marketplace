import { orderRepository } from '@/features/orders/repository/order.repository';
import type { OrderDocument } from '@/features/orders/schema/order.schema';
import type { Order, OrderListResponse, OrderStats } from '@/features/orders/types/order.types';
import type { CreateOrderType } from '@/features/orders/validations/order.validation';
import type { ServiceResult } from '@/shared/types/common';

function docToOrder(doc: OrderDocument): Order {
  return {
    id: doc._id.toString(),
    orderNumber: doc.orderNumber,
    customer: doc.customer,
    email: doc.email,
    product: doc.product,
    category: doc.category,
    amount: doc.amount,
    status: doc.status as Order['status'],
    date: doc.createdAt?.toISOString() ?? '',
  };
}

export async function getOrdersService(
  params: { page?: number; limit?: number; search?: string; status?: string } = {}
): Promise<ServiceResult<OrderListResponse>> {
  const { items, total } = await orderRepository.findAll(params);
  return { data: { orders: items.map(docToOrder), total }, status: 200 };
}

export async function createOrderService(
  input: CreateOrderType
): Promise<ServiceResult<Order>> {
  const id = await orderRepository.create({
    orderNumber: input.orderNumber,
    customer: input.customer,
    email: input.email,
    product: input.product,
    category: input.category,
    amount: input.amount,
    status: input.status ?? 'pending',
  });
  const doc = await orderRepository.findById(id);
  if (!doc) return { data: { error: 'NOT_FOUND' }, status: 404 };
  return { data: docToOrder(doc), status: 201 };
}

export async function getOrderStatsService(): Promise<ServiceResult<OrderStats>> {
  const stats = await orderRepository.getStats();
  return { data: stats, status: 200 };
}
