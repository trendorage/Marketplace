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

  async getAnalytics(period: '7d' | '30d' | '1y'): Promise<{
    points: { label: string; revenue: number; orders: number; commission: number }[];
    categories: { name: string; revenue: number; count: number }[];
  }> {
    await mongo.connect();
    const now = new Date();
    let start: Date;
    let groupFormat: string;
    if (period === '7d') {
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      groupFormat = '%m/%d';
    } else if (period === '30d') {
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      groupFormat = '%m/%d';
    } else {
      start = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      groupFormat = '%Y-%m';
    }
    type RawPoint = { _id: string; revenue: number; orders: number };
    type RawCat = { _id: string; revenue: number; count: number };
    const [rawPoints, rawCategories] = await Promise.all([
      OrderModel.aggregate<RawPoint>([
        { $match: { createdAt: { $gte: start }, status: { $nin: ['cancelled'] } } },
        { $group: {
          _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
          revenue: { $sum: '$amount' },
          orders: { $sum: 1 },
        } },
        { $sort: { _id: 1 } },
      ]),
      OrderModel.aggregate<RawCat>([
        { $match: { status: { $nin: ['cancelled', 'refunded'] } } },
        { $group: { _id: '$category', revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { revenue: -1 } },
        { $limit: 8 },
      ]),
    ]);
    return {
      points: rawPoints.map((p) => ({
        label: p._id,
        revenue: p.revenue,
        orders: p.orders,
        commission: Math.round(p.revenue * 0.1),
      })),
      categories: rawCategories.map((c) => ({
        name: c._id || 'სხვა',
        revenue: c.revenue,
        count: c.count,
      })),
    };
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
