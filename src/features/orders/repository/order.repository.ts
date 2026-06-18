import { OrderDocument, OrderModel } from '@/features/orders/schema/order.schema';
import { mongo } from '@/shared/lib/mongo';

type FindAllParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

type CreateInput = {
  orderNumber: string;
  customer: string;
  email: string;
  product: string;
  category: string;
  amount: number;
  status?: string;
};

export const orderRepository = {
  async findById(id: string): Promise<OrderDocument | null> {
    await mongo.connect();
    return OrderModel.findById(id).lean<OrderDocument>().exec();
  },

  async findAll(params: FindAllParams = {}): Promise<{ items: OrderDocument[]; total: number }> {
    await mongo.connect();
    const { page = 1, limit = 50, search = '', status = '' } = params;
    const filter: Record<string, unknown> = {};
    if (search) filter['$or'] = [
      { customer: { $regex: search, $options: 'i' } },
      { orderNumber: { $regex: search, $options: 'i' } },
      { product: { $regex: search, $options: 'i' } },
    ];
    if (status) filter['status'] = status;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      OrderModel.find(filter, null, { skip, limit, sort: { createdAt: -1 } }).lean<OrderDocument[]>().exec(),
      OrderModel.countDocuments(filter),
    ]);
    return { items, total };
  },

  async create(data: CreateInput): Promise<string> {
    await mongo.connect();
    const doc = await OrderModel.create(data);
    return doc._id.toString();
  },

  async updateStatus(id: string, status: string): Promise<boolean> {
    await mongo.connect();
    const result = await OrderModel.findByIdAndUpdate(id, { $set: { status } });
    return result !== null;
  },

  async getStats(): Promise<{ totalRevenue: number; totalRefunds: number; countByStatus: Record<string, number> }> {
    await mongo.connect();
    const [revenueResult, refundResult, statusCounts] = await Promise.all([
      OrderModel.aggregate([
        { $match: { status: { $in: ['completed', 'processing'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      OrderModel.aggregate([
        { $match: { status: 'refunded' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      OrderModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);
    const countByStatus: Record<string, number> = {};
    for (const s of statusCounts) countByStatus[s._id] = s.count;
    return {
      totalRevenue: revenueResult[0]?.total ?? 0,
      totalRefunds: refundResult[0]?.total ?? 0,
      countByStatus,
    };
  },
};
