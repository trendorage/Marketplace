import { userRepository } from '@/features/auth/repository/user.repository';
import type { UserDocument } from '@/features/auth/schema/user.schema';
import type { ServiceResult } from '@/shared/types/common';

type DashboardUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joinDate: string;
  avatar?: string | null;
};

type UserListResponse = {
  users: DashboardUser[];
  total: number;
};

type UserDocWithTimestamps = UserDocument & { createdAt?: Date };

function docToUser(doc: UserDocWithTimestamps): DashboardUser {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    role: doc.role,
    status: doc.status ?? 'active',
    joinDate: doc.createdAt?.toISOString() ?? '',
    avatar: doc.avatar ?? null,
  };
}

export async function getUsersService(
  params: { page?: number; limit?: number; search?: string; status?: string; role?: string } = {}
): Promise<ServiceResult<UserListResponse>> {
  const { items, total } = await userRepository.findAll(params);
  return { data: { users: items.map(docToUser), total }, status: 200 };
}

export async function updateUserService(
  id: string,
  data: { role?: string; status?: string }
): Promise<ServiceResult<{ success: true }>> {
  const existing = await userRepository.findById(id);
  if (!existing) return { data: { error: 'NOT_FOUND' }, status: 404 };
  const update: Partial<UserDocument> = {};
  if (data.role) update.role = data.role as UserDocument['role'];
  if (data.status) update.status = data.status as UserDocument['status'];
  await userRepository.updateById(id, update);
  return { data: { success: true }, status: 200 };
}
