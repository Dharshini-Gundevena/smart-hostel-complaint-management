import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Star } from 'lucide-react'
import { submitFeedback } from '../services/api'

export default function FeedbackPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [err, setErr] = useState('')
  const send = async () => {
    if (!rating) return setErr('Choose a star rating.')
    try { await submitFeedback({ complaintId: Number(id), rating, comment }); nav(`/student/complaints/${id}`) }
    catch (x) { setErr((x as Error).message) }
  }
  return (
    <div className="card max-w-lg space-y-4">
      <h1 className="text-2xl font-extrabold">How was the fix for #{id}?</h1>
      <div className="flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => setRating(n)}>
            <Star size={32} className={n <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
          </button>
        ))}
      </div>
      <textarea rows={4} className="input" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Anything we should know? (optional)" />
      {err && <p role="alert" className="text-sm font-semibold text-red-700">{err}</p>}
      <button className="btn w-full" onClick={send}>Send feedback</button>
    </div>
  )
}
