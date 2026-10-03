import { Check } from 'lucide-react'
import { STATUS_FLOW } from '../types'
import type { Complaint } from '../types'

export default function Timeline({ c }: { c: Complaint }) {
  return (
    <ol className="space-y-4">
      {STATUS_FLOW.map((s) => {
        const hit = c.timeline.find((t) => t.status === s)
        return (
          <li key={s} className="flex items-center gap-3">
            <span className={`grid h-7 w-7 place-items-center rounded-full ${hit ? 'bg-brand text-white' : 'border-2 border-slate-300'}`}>
              {hit && <Check size={14} />}
            </span>
            <div>
              <p className={`text-sm font-semibold ${hit ? '' : 'text-slate-400'}`}>{s}</p>
              {hit && <p className="text-xs text-slate-500">{new Date(hit.at).toLocaleString()}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
