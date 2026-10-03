import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UserRound,
  Zap,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../services/api'

export default function Login() {
  const navigate = useNavigate()

  const [studentId, setStudentId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    setError('')

    if (!studentId.trim()) {
      setError('Please enter your Student ID.')
      return
    }

    if (!password.trim()) {
      setError('Please enter your password.')
      return
    }

    try {
      setLoading(true)

      await login(studentId, password)

      navigate('/student/dashboard')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to log in. Please check your credentials.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#f5f8fc]">

      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0">

        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-200/30 blur-3xl" />

        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-teal-200/30 blur-3xl" />

        <div className="absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-100/20 blur-3xl" />

      </div>


      {/* MAIN */}

      <main className="relative mx-auto flex min-h-screen max-w-7xl items-center px-5 py-10 sm:px-8 lg:px-10">

        <div className="grid w-full overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.10)] lg:grid-cols-[1.1fr_0.9fr]">


          {/* =====================================================
              LEFT PANEL
          ===================================================== */}

          <section className="relative hidden overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-teal-800 p-10 text-white lg:flex xl:p-14">

            <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />

            <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />

            <div className="absolute right-20 top-1/2 h-52 w-52 rounded-full border border-white/10" />

            <div className="absolute right-32 top-[53%] h-28 w-28 rounded-full border border-white/10" />


            <div className="relative z-10 flex w-full flex-col">


              {/* BRAND */}

              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-cyan-200 shadow-lg backdrop-blur">
                  <Sparkles size={24} />
                </div>

                <p className="text-xl font-black tracking-tight">
                  SmartHostel
                </p>

              </div>


              {/* HERO */}

              <div className="mt-20 max-w-xl">

                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur">

                  <span className="flex h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.8)]" />

                  Intelligent hostel management

                </div>


                <h1 className="text-4xl font-black leading-[1.1] tracking-tight xl:text-5xl">

                  Your hostel.
                  <br />

                  <span className="text-cyan-300">
                    Smarter.
                  </span>

                  <br />

                  Simpler.

                </h1>


                <p className="mt-6 max-w-lg text-sm leading-7 text-blue-100 xl:text-base">

                  SmartHostel helps students report hostel
                  problems, prioritize complaints, and connect
                  with the right maintenance team.

                </p>

              </div>


              {/* WORKFLOW */}

              <div className="mt-auto pt-14">

                <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">

                  <div className="mb-4 flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <Sparkles
                        size={16}
                        className="text-cyan-300"
                      />

                      <span className="text-xs font-black uppercase tracking-wider">
                        Complaint workflow
                      </span>

                    </div>

                    <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-bold text-emerald-200">
                      ACTIVE
                    </span>

                  </div>


                  <div className="grid grid-cols-4 gap-2">

                    <LoginFlow
                      icon={<UserRound size={16} />}
                      label="Report"
                    />

                    <FlowArrow />

                    <LoginFlow
                      icon={<Sparkles size={16} />}
                      label="Analyze"
                    />

                    <FlowArrow />

                    <LoginFlow
                      icon={<Zap size={16} />}
                      label="Prioritize"
                    />

                    <FlowArrow />

                    <LoginFlow
                      icon={<CheckCircle2 size={16} />}
                      label="Resolve"
                    />

                  </div>

                </div>

              </div>

            </div>

          </section>


          {/* =====================================================
              RIGHT LOGIN PANEL
          ===================================================== */}

          <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16">

            <div className="w-full max-w-md">


              {/* MOBILE BRAND */}

              <div className="mb-10 flex items-center gap-3 lg:hidden">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 text-white shadow-lg">
                  <Sparkles size={21} />
                </div>

                <p className="text-lg font-black text-slate-950">
                  SmartHostel
                </p>

              </div>


              {/* LOGIN HEADER */}

              <div>

                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-extrabold text-blue-700">

                  <ShieldCheck size={14} />

                  Secure student access

                </div>


                <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Welcome back
                </h2>


                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sign in to manage your hostel complaints
                  and track their progress.
                </p>

              </div>


              {/* ERROR */}

              {error && (

                <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4">

                  <div className="flex gap-3">

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                      !
                    </div>

                    <p className="text-sm font-semibold leading-5 text-red-700">
                      {error}
                    </p>

                  </div>

                </div>

              )}


              {/* FORM */}

              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
              >


                {/* STUDENT ID */}

                <div>

                  <label
                    htmlFor="studentId"
                    className="mb-2 block text-sm font-extrabold text-slate-800"
                  >
                    Student ID
                  </label>

                  <div className="relative">

                    <UserRound
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="studentId"
                      type="text"
                      value={studentId}
                      onChange={(e) =>
                        setStudentId(e.target.value)
                      }
                      placeholder="Enter your Student ID"
                      autoComplete="username"
                      className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />

                  </div>

                </div>


                {/* PASSWORD */}

                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label
                      htmlFor="password"
                      className="block text-sm font-extrabold text-slate-800"
                    >
                      Password
                    </label>

                    <button
                      type="button"
                      className="text-sm font-bold text-blue-600 hover:text-blue-800"
                    >
                      Forgot password?
                    </button>

                  </div>


                  <div className="relative">

                    <LockKeyhole
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="password"
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 px-11 pr-12 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />


                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label={
                        showPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                    >

                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}

                    </button>

                  </div>

                </div>


                {/* REMEMBER ME */}

                <label className="flex cursor-pointer items-center gap-2.5">

                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />

                  <span className="text-sm font-semibold text-slate-500">
                    Keep me signed in
                  </span>

                </label>


                {/* =================================================
                    LARGE SIGN IN BUTTON
                ================================================= */}

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-teal-700 to-blue-700 text-xl font-black text-white shadow-lg shadow-blue-900/15 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading ? (

                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-[3px] border-white/30 border-t-white" />

                      <span className="text-lg">
                        Signing in...
                      </span>
                    </>

                  ) : (

                    <>
                      <span>
                        Sign in
                      </span>

                      <ArrowRight
                        size={23}
                        strokeWidth={2.5}
                        className="transition group-hover:translate-x-1"
                      />
                    </>

                  )}

                </button>

              </form>


              {/* DIVIDER */}

              <div className="my-7 flex items-center gap-3">

                <div className="h-px flex-1 bg-slate-200" />

                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  New to SmartHostel?
                </span>

                <div className="h-px flex-1 bg-slate-200" />

              </div>


              {/* REGISTER */}

              <Link
                to="/student/register"
                className="group flex h-14 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-base font-extrabold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
              >

                Create a student account

                <ArrowRight
                  size={19}
                  className="transition group-hover:translate-x-1"
                />

              </Link>


              {/* FOOTER */}

              <div className="mt-8 flex items-center justify-center gap-2 text-center text-xs font-medium text-slate-400">

                <ShieldCheck size={15} />

                Secure authentication • SmartHostel

              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  )
}


/* ============================================================
   WORKFLOW ITEM
============================================================ */

function LoginFlow({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2 py-3">

      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-cyan-200">
        {icon}
      </div>

      <span className="truncate text-[10px] font-bold text-blue-100">
        {label}
      </span>

    </div>
  )
}


/* ============================================================
   WORKFLOW ARROW
============================================================ */

function FlowArrow() {
  return (
    <div className="hidden items-center justify-center text-white/30 sm:flex">
      <ArrowRight size={13} />
    </div>
  )
}