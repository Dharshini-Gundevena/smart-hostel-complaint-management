// All data access lives here. With VITE_API_BASE_URL unset, a mock in-memory
// implementation is used. With it set, the planned backend endpoints are called.
import { complaints, feedbacks, notifications, students } from '../data/mockData'
import { STATUS_FLOW } from '../types'
import type { AIAnalysis, Complaint, Feedback, Notification, Priority, Student } from '../types'

const BASE = import.meta.env.VITE_API_BASE_URL as string | undefined
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms))

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, { headers: { 'Content-Type': 'application/json' }, ...init })
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json() as Promise<T>
}

// ---- Session (mock auth: stored in localStorage) ----
const KEY = 'smarthostel_student'
export const getSession = (): Student | null => {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null') } catch { return null }
}
export const logout = () => localStorage.removeItem(KEY)

// ---- Auth ----
export async function login(studentId: string, password: string): Promise<Student> {
  if (BASE) {
    const s = await http<Student>('/api/auth/login', { method: 'POST', body: JSON.stringify({ studentId, password }) })
    localStorage.setItem(KEY, JSON.stringify(s)); return s
  }
  await delay()
  if (!studentId.trim()) throw new Error('Enter your student ID.')
  const id = studentId.trim().toUpperCase()
  const s = students.find((x) => x.id === id) ?? { ...students[0], id, name: `Student ${id}` }
  localStorage.setItem(KEY, JSON.stringify(s)); return s
}

export async function register(data: Omit<Student, 'phone'> & { password: string }): Promise<Student> {
  if (BASE) {
    const s = await http<Student>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) })
    localStorage.setItem(KEY, JSON.stringify(s)); return s
  }
  await delay()
  const s: Student = { id: data.id.toUpperCase(), name: data.name, email: data.email, phone: '', hostel: data.hostel, room: data.room }
  students.push(s)
  localStorage.setItem(KEY, JSON.stringify(s)); return s
}

// ---- AI analysis preview (mock rules; real analysis will come from the backend/AI service) ----
const RULES: { re: RegExp; category: string; sub: string; team: string; base: Priority }[] = [
  { re: /leak|tap|water|pipe|flush|drain|bathroom/, category: 'Plumbing', sub: 'Water Leakage', team: 'Plumbing Maintenance', base: 'MEDIUM' },
  { re: /fan|light|bulb|socket|switch|power|wire|spark/, category: 'Electrical', sub: 'Fan / Lighting Fault', team: 'Electrical Maintenance', base: 'MEDIUM' },
  { re: /wifi|wi-fi|internet|network/, category: 'Internet', sub: 'Connectivity Issue', team: 'Network Team', base: 'MEDIUM' },
  { re: /clean|dust|garbage|dirty|toilet/, category: 'Housekeeping', sub: 'Cleanliness', team: 'Housekeeping Team', base: 'LOW' },
  { re: /bed|chair|table|cupboard|door|window|lock/, category: 'Furniture', sub: 'Repair', team: 'Carpentry Team', base: 'LOW' }
]

export async function analyzeComplaint(description: string, room: string): Promise<AIAnalysis> {
  await delay(900)
  const text = description.toLowerCase()
  const rule = RULES.find((r) => r.re.test(text))
  let priority: Priority = rule?.base ?? 'LOW'
  if (/leak|continuous|flood/.test(text)) priority = 'HIGH'
  if (/spark|fire|shock/.test(text)) priority = 'CRITICAL'
  const category = rule?.category ?? 'General'
  const dup = complaints.find((c) => c.room === room && c.analysis.category === category && c.status !== 'Resolved')
  return {
    category, subcategory: rule?.sub ?? 'Other', priority, team: rule?.team ?? 'Hostel Warden Office',
    duplicate: dup ? { found: true, ofId: dup.id } : { found: false },
    summary: description.length > 110 ? description.slice(0, 107) + '...' : description,
    confidence: rule ? 0.9 : 0.55
  }
}

// ---- Complaints ----
let nextId = 1024
export async function getComplaints(): Promise<Complaint[]> {
  if (BASE) return http('/api/complaints')
  await delay(250); return [...complaints]
}
export async function getComplaint(id: number): Promise<Complaint | undefined> {
  if (BASE) return http(`/api/complaints/${id}`)
  await delay(250); return complaints.find((c) => c.id === id)
}
export async function createComplaint(description: string, room: string, imageUrl?: string): Promise<Complaint> {
  if (BASE) return http('/api/complaints', { method: 'POST', body: JSON.stringify({ description, room }) })
  const analysis = await analyzeComplaint(description, room)
  const now = new Date().toISOString()
  const c: Complaint = { id: nextId++, description, room, imageUrl, createdAt: now, status: 'Submitted', analysis,
    timeline: [{ status: 'Submitted', at: now }] }
  complaints.unshift(c)
  notifications.unshift({ id: Date.now(), message: `Complaint #${c.id} submitted and assigned to ${analysis.team}.`, complaintId: c.id, at: now, read: false })
  return c
}
// Demo only (mock mode): move a complaint to its next status.
export async function advanceStatus(id: number): Promise<Complaint | undefined> {
  const c = complaints.find((x) => x.id === id)
  if (!c) return
  const next = STATUS_FLOW[STATUS_FLOW.indexOf(c.status) + 1]
  if (!next) return c
  const now = new Date().toISOString()
  c.status = next; c.timeline.push({ status: next, at: now })
  notifications.unshift({ id: Date.now(), message: `Complaint #${id} is now ${next}.`, complaintId: id, at: now, read: false })
  return c
}

// ---- Notifications & feedback ----
export async function getNotifications(): Promise<Notification[]> {
  if (BASE) return http('/api/notifications')
  await delay(200); return [...notifications]
}
export async function submitFeedback(f: Feedback): Promise<void> {
  if (BASE) { await http('/api/feedback', { method: 'POST', body: JSON.stringify(f) }); return }
  await delay(); feedbacks.push(f)
}
export const hasFeedback = (id: number) => feedbacks.some((f) => f.complaintId === id)
