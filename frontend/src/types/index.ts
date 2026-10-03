export type Status = 'Submitted' | 'Assigned' | 'In Progress' | 'Resolved'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export const STATUS_FLOW: Status[] = ['Submitted', 'Assigned', 'In Progress', 'Resolved']

export interface Student { id: string; name: string; email: string; phone: string; hostel: string; room: string }

export interface AIAnalysis {
  category: string
  subcategory: string
  priority: Priority
  team: string
  duplicate: { found: boolean; ofId?: number }
  summary: string
  confidence: number
}

export interface Complaint {
  id: number
  description: string
  room: string
  imageUrl?: string
  createdAt: string
  status: Status
  analysis: AIAnalysis
  timeline: { status: Status; at: string }[]
}

export interface Notification { id: number; message: string; complaintId?: number; at: string; read: boolean }
export interface Feedback { complaintId: number; rating: number; comment: string }
