export const complaintCategories = [
  'ELECTRICAL', 'PLUMBING', 'CLEANING', 'INTERNET', 'FURNITURE',
  'SECURITY', 'WATER', 'FOOD', 'ROOM_MAINTENANCE', 'OTHER',
] as const;
export type ComplaintCategory = (typeof complaintCategories)[number];

export const maintenanceDepartments = [
  'ELECTRICAL', 'PLUMBING', 'CLEANING', 'INTERNET', 'SECURITY', 'HOUSEKEEPING', 'GENERAL_MAINTENANCE',
] as const;
export type MaintenanceDepartment = (typeof maintenanceDepartments)[number];

export const complaintPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
export type ComplaintAiPriority = (typeof complaintPriorities)[number];

export interface ComplaintAnalysis {
  category: ComplaintCategory;
  priority: ComplaintAiPriority;
  summary: string;
  department: MaintenanceDepartment;
  suggested_action: string;
  reason: string;
}

const analysisKeys = ['category', 'priority', 'summary', 'department', 'suggested_action', 'reason'];
const maxTextLength = 500;

function isAllowed<T extends readonly string[]>(values: T, value: unknown): value is T[number] {
  return typeof value === 'string' && values.includes(value);
}

export function validateComplaintAnalysis(value: unknown): ComplaintAnalysis | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (Object.keys(record).length !== analysisKeys.length || analysisKeys.some((key) => !(key in record))) return null;
  if (!isAllowed(complaintCategories, record.category)) return null;
  if (!isAllowed(complaintPriorities, record.priority)) return null;
  if (!isAllowed(maintenanceDepartments, record.department)) return null;

  const summary = typeof record.summary === 'string' ? record.summary.trim() : '';
  const suggested_action = typeof record.suggested_action === 'string' ? record.suggested_action.trim() : '';
  const reason = typeof record.reason === 'string' ? record.reason.trim() : '';
  if ([summary, suggested_action, reason].some((text) => !text || text.length > maxTextLength)) return null;

  return {
    category: record.category,
    priority: record.priority,
    summary,
    department: record.department,
    suggested_action,
    reason,
  };
}