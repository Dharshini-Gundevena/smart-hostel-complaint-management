import { AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import type { AIAnalysis } from '../types'
import { PriorityBadge } from './Badges'

export default function AnalysisCard({ a }: { a: AIAnalysis }) {
  const rows: [string, ReactNode][] = [
    ['Category', a.category], ['Subcategory', a.subcategory],
    ['Priority', <PriorityBadge p={a.priority} />], ['Assigned team', a.team],
    ['Confidence', `${Math.round(a.confidence * 100)}%`]
  ]
  return (
    <div className="card border-brand/40 bg-brand-soft/40">
      <h3 className="mb-3 flex items-center gap-2 font-extrabold"><Sparkles size={18} className="text-brand" /> AI analysis</h3>
      <dl className="grid grid-cols-2 gap-y-2 text-sm">
        {rows.map(([k, v]) => (<div key={k} className="contents"><dt className="text-slate-600">{k}</dt><dd className="font-semibold">{v}</dd></div>))}
      </dl>
      <p className="mt-3 text-sm">{a.summary}</p>
      <p className={`mt-3 flex items-center gap-2 text-sm font-semibold ${a.duplicate.found ? 'text-amber-700' : 'text-emerald-700'}`}>
        {a.duplicate.found ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
        {a.duplicate.found ? `Possible duplicate of #${a.duplicate.ofId}` : 'No duplicate found'}
      </p>
    </div>
  )
}
