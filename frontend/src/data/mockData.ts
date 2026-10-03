import type { Complaint, Feedback, Notification, Student } from '../types'

export const students: Student[] = [
  { id: 'CSE123', name: 'Aarav Sharma', email: 'aarav.sharma@college.edu', phone: '+91 98765 43210', hostel: 'Block B', room: '307' }
]

export const complaints: Complaint[] = [
  {
    id: 1021, description: 'Ceiling fan in my room makes a loud noise and wobbles.', room: '307',
    createdAt: '2026-09-28T09:15:00', status: 'In Progress',
    analysis: { category: 'Electrical', subcategory: 'Fan Fault', priority: 'MEDIUM', team: 'Electrical Maintenance',
      duplicate: { found: false }, summary: 'Ceiling fan is unstable and noisy; needs inspection of mounting and bearings.', confidence: 0.91 },
    timeline: [
      { status: 'Submitted', at: '2026-09-28T09:15:00' },
      { status: 'Assigned', at: '2026-09-28T11:00:00' },
      { status: 'In Progress', at: '2026-09-29T10:30:00' }
    ]
  },
  {
    id: 1018, description: 'Wi-Fi in the third floor corridor keeps disconnecting.', room: '307',
    createdAt: '2026-09-20T18:40:00', status: 'Resolved',
    analysis: { category: 'Internet', subcategory: 'Connectivity Issue', priority: 'MEDIUM', team: 'Network Team',
      duplicate: { found: false }, summary: 'Intermittent Wi-Fi drops on the third floor.', confidence: 0.88 },
    timeline: [
      { status: 'Submitted', at: '2026-09-20T18:40:00' },
      { status: 'Assigned', at: '2026-09-20T19:30:00' },
      { status: 'In Progress', at: '2026-09-21T09:00:00' },
      { status: 'Resolved', at: '2026-09-21T15:20:00' }
    ]
  }
]

export const notifications: Notification[] = [
  { id: 3, message: 'Complaint #1021 is now In Progress.', complaintId: 1021, at: '2026-09-29T10:30:00', read: false },
  { id: 2, message: 'Complaint #1018 was resolved. Share your feedback.', complaintId: 1018, at: '2026-09-21T15:20:00', read: false },
  { id: 1, message: 'Welcome to SmartHostel AI.', at: '2026-09-15T08:00:00', read: true }
]

export const feedbacks: Feedback[] = []
