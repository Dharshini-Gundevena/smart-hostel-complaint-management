import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { advanceStatus, getComplaint, hasFeedback } from '../services/api'
import type { Complaint } from '../types'
import AnalysisCard from '../components/AnalysisCard'
import Timeline from '../components/Timeline'
import { StatusBadge } from '../components/Badges'

export default function ComplaintDetail() {
  const { id } = useParams()
  const [c, setC] = useState<Complaint | null | undefined>(null)
  useEffect(() => { getComplaint(Number(id)).then(setC) }, [id])
  if (c === null) return <p>Loading complaint...</p>
  if (!c) return <p>Complaint not found. <Link to="/student/complaints" className="underline">Back to complaints</Link></p>

  const advance = async () => { const n = await advanceStatus(c.id); if (n) setC({ ...n, timeline: [...n.timeline] }) }
  const demo = !import.meta.env.VITE_API_BASE_URL && c.status !== 'Resolved'
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-extrabold">Complaint #{c.id}</h1><StatusBadge s={c.status} />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-5">
          <div className="card"><p className="text-sm">{c.description}</p>
            <p className="mt-2 text-xs text-slate-500">Room {c.room} · {new Date(c.createdAt).toLocaleString()}</p>
            {c.imageUrl && <img src={c.imageUrl} alt="Complaint attachment" className="mt-3 max-h-56 rounded-lg" />}</div>
          <AnalysisCard a={c.analysis} />
        </div>
        <div className="card"><h2 className="mb-4 font-extrabold">Tracking</h2><Timeline c={c} />
          {demo && <button onClick={advance} className="btn-ghost mt-5 w-full">Demo: advance to next status</button>}
          {c.status === 'Resolved' && (hasFeedback(c.id)
            ? <p className="mt-5 text-sm font-semibold text-emerald-700">Thanks, your feedback is recorded.</p>
            : <Link to={`/student/feedback/${c.id}`} className="btn mt-5 w-full">Rate this resolution</Link>)}
        </div>
      </div>
    </div>
  )
}
