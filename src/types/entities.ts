export const userRoles = ['STUDENT', 'ADMIN', 'MAINTENANCE'] as const;
export type UserRole = (typeof userRoles)[number];

export const complaintStatuses = [
  'PENDING',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'REJECTED',
  'ESCALATED',
] as const;
export type ComplaintStatus = (typeof complaintStatuses)[number];

import type { ComplaintCategory, MaintenanceDepartment } from '@/lib/ai-contract';

export { complaintCategories, maintenanceDepartments } from '@/lib/ai-contract';
export type {
  ComplaintCategory,
  ComplaintAnalysis,
  MaintenanceDepartment,
} from '@/lib/ai-contract';
export const complaintPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
export type ComplaintPriority = (typeof complaintPriorities)[number];
export type AiAnalysisStatus = 'PENDING' | 'ANALYZED' | 'UNAVAILABLE';

export interface Hostel {
  id: string;
  name: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface Block {
  id: string;
  hostelId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  blockId: string;
  roomNumber: string;
  floor: number;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  hostelId: string | null;
  blockId: string | null;
  roomId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Complaint {
  id: string;
  studentId: string;
  roomId: string;
  title: string;
  description: string;
  category: string;
  subcategory: string | null;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  severity: number;
  imageUrl: string | null;
  aiSummary: string | null;
  aiConfidence: number | null;
  aiCategory: ComplaintCategory | null;
  aiPriority: ComplaintPriority | null;
  aiDepartment: MaintenanceDepartment | null;
  aiSuggestedAction: string | null;
  aiReason: string | null;
  aiStatus: AiAnalysisStatus;
  dueAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintAssignment {
  id: string;
  complaintId: string;
  assignedTo: string;
  assignedBy: string;
  assignedAt: string;
  unassignedAt: string | null;
}

export interface ComplaintUpdate {
  id: string;
  complaintId: string;
  updatedBy: string;
  oldStatus: ComplaintStatus | null;
  newStatus: ComplaintStatus | null;
  comment: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  complaintId: string | null;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  id: string;
  complaintId: string;
  studentId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  actorId: string | null;
  entityType: string;
  entityId: string;
  action: string;
  changes: Record<string, unknown>;
  createdAt: string;
}