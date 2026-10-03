import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../services/api'

export default function Register() {
  const nav = useNavigate()
  const [f, setF] = useState({ id: '', name: '', email: '', hostel: '', room: '', password: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr('')
    if (Object.values(f).some((v) => !v.trim())) return setErr('Fill in every field.')
    setBusy(true)
    try { await register(f); nav('/student/dashboard') }
    catch (x) { setErr((x as Error).message) } finally { setBusy(false) }
  }
  const fields: [keyof typeof f, string, string][] = [
    ['name', 'Full name', 'text'], ['id', 'Student ID', 'text'], ['email', 'Email', 'email'],
    ['hostel', 'Hostel block', 'text'], ['room', 'Room number', 'text'], ['password', 'Password', 'password']
  ]
  return (
    <div className="grid min-h-screen place-items-center p-4">
      <form onSubmit={submit} className="card w-full max-w-md space-y-4">
        <h1 className="text-2xl font-extrabold">Create your account</h1>
        {fields.map(([k, label, type]) => (
          <div key={k}><label className="label" htmlFor={k}>{label}</label>
            <input id={k} type={type} className="input" value={f[k]} onChange={set(k)} /></div>
        ))}
        {err && <p role="alert" className="text-sm font-semibold text-red-700">{err}</p>}
        <button className="btn w-full" disabled={busy}>{busy ? 'Creating...' : 'Create account'}</button>
        <p className="text-sm">Already registered? <Link to="/student/login" className="font-semibold text-brand underline">Log in</Link></p>
      </form>
    </div>
  )
}
