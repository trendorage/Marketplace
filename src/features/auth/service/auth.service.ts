import { createHash } from 'crypto';

import { ServiceResult } from '@/shared/types/common';

import { userRepository } from '../repository/user.repository';
import { User } from '../types/auth.types';
import { LoginType, SignUpType } from '../validations/auth.validation';

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export async function registerService(
  input: SignUpType
): Promise<ServiceResult<{ message: string }>> {
  const existing = await userRepository.findByEmail(input.email);
  if (existing) return { data: { error: 'EMAIL_TAKEN' }, status: 409 };

  await userRepository.create({
    name: input.fullName,
    email: input.email,
    passwordHash: hashPassword(input.password),
  });

  return { data: { message: 'Account created' }, status: 201 };
}

export async function loginService(input: LoginType): Promise<ServiceResult<User>> {
  const user = await userRepository.findByEmail(input.email);
  if (!user) return { data: { error: 'NOT_FOUND' }, status: 404 };

  return {
    data: {
      id: (user as { _id: { toString: () => string } } & typeof user)._id.toString(),
      email: user.email,
      name: user.name,
    },
    status: 200,
  };
}

export async function getUserByIdService(id: string): Promise<ServiceResult<User>> {
  const user = await userRepository.findById(id);
  if (!user) return { data: { error: 'NOT_FOUND' }, status: 404 };

  return {
    data: {
      id: (user as { _id: { toString: () => string } } & typeof user)._id.toString(),
      email: user.email,
      name: user.name,
    },
    status: 200,
  };
}
