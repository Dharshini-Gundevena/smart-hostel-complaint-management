import type { Priority, Status } from '../types'

const P: Record<Priority, string> = {
  LOW: 'bg-slate-100 text-slate-700', MEDIUM: 'bg-amber-100 text-amber-800',
  HIGH: 'bg-orange-100 text-orange-800', CRITICAL: 'bg-red-100 text-red-800'
}
const S: Record<Status, string> = {
  Submitted: 'bg-slate-100 text-slate-700', Assigned: 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-amber-100 text-amber-800', Resolved: 'bg-emerald-100 text-emerald-800'
}
const base = 'inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold'
export const PriorityBadge = ({ p }: { p: Priority }) => <span className={`${base} ${P[p]}`}>{p}</span>
export const StatusBadge = ({ s }: { s: Status }) => <span className={`${base} ${S[s]}`}>{s}</span>
