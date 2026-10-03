import {
  ArrowRight,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  Edit3,
  Home,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  Wrench,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getComplaints, getSession } from '../services/api'
import { useEffect, useState } from 'react'
import type { Complaint } from '../types'

export default function Profile() {
  const me = getSession()
  const [complaints, setComplaints] = useState<Complaint[]>([])

  useEffect(() => {
    getComplaints().then(setComplaints)
  }, [])

  const student = me as any

  const name = student?.name || 'Student 89'
  const studentId = student?.studentId || student?.id || '89'
  const email =
    student?.email || 'aarav.sharma@college.edu'
  const phone =
    student?.phone || '+91 98765 43210'
  const hostel =
    student?.hostel || 'Block B'
  const room =
    student?.room || '307'

  const firstLetter =
    name.charAt(0).toUpperCase()

  const resolved = complaints.filter(
    (c) => c.status === 'Resolved'
  ).length

  const active = complaints.filter(
    (c) => c.status !== 'Resolved'
  ).length

  return (
    <div className="space-y-6 pb-12">

      {/* =====================================================
          PROFILE HERO
      ===================================================== */}

      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-blue-950 to-teal-800 text-white shadow-xl">

        {/* Decorative shapes */}
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />

        <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="absolute right-20 top-16 hidden h-32 w-32 rounded-full border border-white/10 lg:block" />

        <div className="relative z-10 p-6 sm:p-8 lg:p-10">

          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

            {/* Identity */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

              <div className="relative">

                <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-cyan-300 to-blue-500 text-4xl font-black text-white shadow-2xl ring-4 ring-white/10">
                  {firstLetter}
                </div>

                <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-blue-950 bg-emerald-400 text-white">
                  <CheckCircle2 size={15} />
                </div>

              </div>

              <div>

                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur">
                  <Sparkles size={13} className="text-cyan-300" />
                  SmartHostel AI Member
                </div>

                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  {name}
                </h1>

                <p className="mt-1 text-sm text-blue-100">
                  Student ID • {studentId}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-blue-50">
                    <Building2 size={13} />
                    {hostel}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-blue-50">
                    <Home size={13} />
                    Room {room}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1.5 text-xs font-bold text-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    Active
                  </span>

                </div>

              </div>

            </div>

            {/* Edit button */}
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-extrabold backdrop-blur transition hover:bg-white/20 lg:self-auto"
            >
              <Edit3 size={16} />
              Edit Profile
            </button>

          </div>

        </div>

        {/* Bottom stats */}
        <div className="relative z-10 grid grid-cols-2 border-t border-white/10 bg-black/10 sm:grid-cols-4">

          <HeroStat
            icon={<ClipboardList size={17} />}
            value={complaints.length}
            label="Total complaints"
          />

          <HeroStat
            icon={<Clock3 size={17} />}
            value={active}
            label="Active issues"
          />

          <HeroStat
            icon={<CheckCircle2 size={17} />}
            value={resolved}
            label="Resolved"
          />

          <HeroStat
            icon={<ShieldCheck size={17} />}
            value="100%"
            label="Account secure"
          />

        </div>

      </section>


      {/* =====================================================
          MAIN GRID
      ===================================================== */}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">

        {/* LEFT COLUMN */}
        <div className="space-y-6">

          {/* PERSONAL INFORMATION */}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-blue-600">
                  Identity
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Personal Information
                </h2>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <User size={19} />
              </div>

            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <InfoCard
                icon={<User size={18} />}
                label="Full Name"
                value={name}
              />

              <InfoCard
                icon={<ShieldCheck size={18} />}
                label="Student ID"
                value={studentId}
              />

              <InfoCard
                icon={<Mail size={18} />}
                label="Email Address"
                value={email}
              />

              <InfoCard
                icon={<Phone size={18} />}
                label="Phone Number"
                value={phone}
              />

            </div>

          </section>


          {/* HOSTEL INFORMATION */}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="p-6">

              <div className="mb-6 flex items-center justify-between">

                <div>

                  <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-teal-600">
                    Residence
                  </p>

                  <h2 className="mt-1 text-xl font-black text-slate-950">
                    Hostel Information
                  </h2>

                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <Building2 size={19} />
                </div>

              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                <ResidenceCard
                  icon={<Building2 size={20} />}
                  label="Hostel Block"
                  value={hostel}
                  description="Assigned residence"
                />

                <ResidenceCard
                  icon={<Home size={20} />}
                  label="Room Number"
                  value={room}
                  description="Current room"
                />

              </div>

            </div>

            {/* Location strip */}
            <div className="border-t border-slate-100 bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-5">

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-teal-600 shadow-sm">
                  <MapPin size={19} />
                </div>

                <div className="min-w-0 flex-1">

                  <p className="text-xs font-bold uppercase tracking-wider text-teal-600">
                    Current Location
                  </p>

                  <p className="mt-1 font-extrabold text-slate-900">
                    {hostel} • Room {room}
                  </p>

                </div>

                <div className="hidden text-right sm:block">

                  <p className="text-xs font-medium text-slate-400">
                    Residence status
                  </p>

                  <p className="mt-1 text-sm font-extrabold text-emerald-600">
                    Active
                  </p>

                </div>

              </div>

            </div>

          </section>


          {/* RECENT ACTIVITY */}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-violet-600">
                  Activity
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Recent Activity
                </h2>

              </div>

              <Link
                to="/student/complaints"
                className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800"
              >
                View all
                <ArrowRight size={15} />
              </Link>

            </div>

            <div className="space-y-1">

              <ActivityItem
                icon={<User size={16} />}
                title="Profile accessed"
                text="Your student profile is up to date"
                time="Recently"
                color="blue"
              />

              <ActivityItem
                icon={<ClipboardList size={16} />}
                title={`${complaints.length} complaint${complaints.length === 1 ? '' : 's'} submitted`}
                text="Your reported hostel issues are tracked here"
                time="Activity"
                color="violet"
              />

              <ActivityItem
                icon={<ShieldCheck size={16} />}
                title="Account verified"
                text="Your student account is active"
                time="Secure"
                color="emerald"
                last
              />

            </div>

          </section>

        </div>


        {/* RIGHT COLUMN */}
        <div className="space-y-6">

          {/* AI CARD */}

          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-blue-900 to-teal-700 p-6 text-white shadow-xl">

            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />

            <div className="relative">

              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-cyan-200 backdrop-blur">
                  <Sparkles size={23} />
                </div>

                <div>

                  <p className="text-xs font-extrabold uppercase tracking-widest text-cyan-200">
                    AI Assistant
                  </p>

                  <h2 className="text-lg font-black">
                    SmartHostel AI
                  </h2>

                </div>

              </div>

              <p className="mt-5 text-sm leading-6 text-blue-100">
                Your complaints are intelligently analyzed to
                identify the category, priority, possible
                duplicates, and the right maintenance team.
              </p>

              <div className="mt-5 space-y-2">

                <AIItem text="Automatic complaint classification" />

                <AIItem text="Priority and severity detection" />

                <AIItem text="Duplicate issue identification" />

                <AIItem text="Smart maintenance routing" />

              </div>

              <Link
                to="/student/report"
                className="mt-6 flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm font-bold transition hover:bg-white/20"
              >
                <span>Report an issue</span>
                <ArrowRight size={17} />
              </Link>

            </div>

          </section>


          {/* SECURITY */}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <LockKeyhole size={19} />
              </div>

              <div>

                <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-600">
                  Security
                </p>

                <h2 className="font-black text-slate-950">
                  Account Protection
                </h2>

              </div>

            </div>

            <div className="rounded-2xl bg-emerald-50 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 size={19} />
                </div>

                <div>

                  <p className="text-sm font-extrabold text-emerald-900">
                    Account is secure
                  </p>

                  <p className="mt-0.5 text-xs text-emerald-700">
                    Your student account is currently active.
                  </p>

                </div>

              </div>

            </div>

            <div className="mt-4 space-y-2">

              <SecurityRow
                icon={<Mail size={16} />}
                title="Email verified"
              />

              <SecurityRow
                icon={<ShieldCheck size={16} />}
                title="Student account verified"
              />

              <SecurityRow
                icon={<LockKeyhole size={16} />}
                title="Protected account access"
              />

            </div>

          </section>


          {/* QUICK ACTIONS */}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-5">

              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                Shortcuts
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-950">
                Quick Actions
              </h2>

            </div>

            <div className="space-y-2">

              <ProfileAction
                to="/student/report"
                icon={<ClipboardList size={18} />}
                title="Report Complaint"
                description="Submit a new hostel issue"
                color="teal"
              />

              <ProfileAction
                to="/student/complaints"
                icon={<Wrench size={18} />}
                title="Track Complaints"
                description="View your complaint status"
                color="blue"
              />

              <ProfileAction
                to="/student/notifications"
                icon={<Bell size={18} />}
                title="Notifications"
                description="View latest updates"
                color="violet"
              />

            </div>

          </section>


          {/* ACCOUNT INFO */}

          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                <CalendarDays size={18} />
              </div>

              <div className="flex-1">

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Account
                </p>

                <p className="mt-1 text-sm font-extrabold text-slate-800">
                  SmartHostel Student Account
                </p>

              </div>

              <ChevronRight
                size={17}
                className="text-slate-300"
              />

            </div>

          </section>

        </div>

      </div>

    </div>
  )
}


/* ============================================================
   HERO STAT
============================================================ */

function HeroStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: number | string
  label: string
}) {
  return (
    <div className="border-r border-white/10 px-5 py-5 last:border-r-0 sm:px-6">

      <div className="flex items-center gap-2 text-blue-200">
        {icon}
        <span className="text-xs font-bold">
          {label}
        </span>
      </div>

      <p className="mt-2 text-2xl font-black">
        {value}
      </p>

    </div>
  )
}


/* ============================================================
   INFO CARD
============================================================ */

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="group rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-blue-100 hover:bg-blue-50/40">

      <div className="flex items-start gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm transition group-hover:bg-blue-600 group-hover:text-white">
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="mt-1 truncate text-sm font-extrabold text-slate-900">
            {value}
          </p>

        </div>

      </div>

    </div>
  )
}


/* ============================================================
   RESIDENCE CARD
============================================================ */

function ResidenceCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode
  label: string
  value: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">

      <div className="flex items-center justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-teal-600 shadow-sm">
          {icon}
        </div>

        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">
          Assigned
        </span>

      </div>

      <p className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-black text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>

    </div>
  )
}


/* ============================================================
   ACTIVITY ITEM
============================================================ */

function ActivityItem({
  icon,
  title,
  text,
  time,
  color,
  last = false,
}: {
  icon: React.ReactNode
  title: string
  text: string
  time: string
  color: 'blue' | 'violet' | 'emerald'
  last?: boolean
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    violet: 'bg-violet-50 text-violet-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  }

  return (
    <div className="flex gap-4">

      <div className="flex flex-col items-center">

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colors[color]}`}
        >
          {icon}
        </div>

        {!last && (
          <div className="mt-1 h-8 w-px bg-slate-200" />
        )}

      </div>

      <div className="flex-1 pb-3">

        <div className="flex flex-wrap items-center justify-between gap-2">

          <p className="text-sm font-extrabold text-slate-900">
            {title}
          </p>

          <span className="text-[11px] font-bold text-slate-400">
            {time}
          </span>

        </div>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {text}
        </p>

      </div>

    </div>
  )
}


/* ============================================================
   AI ITEM
============================================================ */

function AIItem({
  text,
}: {
  text: string
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-blue-50">

      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-200">
        <CheckCircle2 size={12} />
      </div>

      {text}

    </div>
  )
}


/* ============================================================
   SECURITY ROW
============================================================ */

function SecurityRow({
  icon,
  title,
}: {
  icon: React.ReactNode
  title: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-2 py-2">

      <div className="text-slate-400">
        {icon}
      </div>

      <span className="flex-1 text-sm font-bold text-slate-700">
        {title}
      </span>

      <CheckCircle2
        size={15}
        className="text-emerald-500"
      />

    </div>
  )
}


/* ============================================================
   PROFILE ACTION
============================================================ */

function ProfileAction({
  to,
  icon,
  title,
  description,
  color,
}: {
  to: string
  icon: React.ReactNode
  title: string
  description: string
  color: 'teal' | 'blue' | 'violet'
}) {
  const styles = {
    teal: 'bg-teal-50 text-teal-700 group-hover:bg-teal-600',
    blue: 'bg-blue-50 text-blue-700 group-hover:bg-blue-600',
    violet: 'bg-violet-50 text-violet-700 group-hover:bg-violet-600',
  }

  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-2xl border border-slate-100 p-3 transition hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-md"
    >

      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition group-hover:text-white ${styles[color]}`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-sm font-extrabold text-slate-900">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-slate-500">
          {description}
        </p>

      </div>

      <ArrowRight
        size={16}
        className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-700"
      />

    </Link>
  )
}