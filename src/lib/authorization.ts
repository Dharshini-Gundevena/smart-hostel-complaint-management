import { AppError } from '@/lib/errors';
import { getAuthenticatedProfile } from '@/lib/auth';
import { userRoles, type UserRole } from '@/types/entities';

export function isUserRole(role: unknown): role is UserRole {
  return typeof role === 'string' && userRoles.includes(role as UserRole);
}

export async function getAuthenticatedRole(): Promise<UserRole> {
  const profile = await getAuthenticatedProfile();
  if (!isUserRole(profile.role)) {
    throw new AppError('Your account has an invalid role.', 403, 'INVALID_ROLE');
  }
  return profile.role;
}

export async function requireRole(...allowedRoles: UserRole[]): Promise<void> {
  const profile = await getAuthenticatedProfile();
  if (!isUserRole(profile.role) || !allowedRoles.includes(profile.role)) {
    throw new AppError('You do not have permission to perform this action.', 403, 'FORBIDDEN');
  }
}

export async function requireStudent(): Promise<void> {
  return requireRole('STUDENT');
}

export async function requireAdmin(): Promise<void> {
  return requireRole('ADMIN');
}

export async function requireMaintenance(): Promise<void> {
  return requireRole('MAINTENANCE');
}