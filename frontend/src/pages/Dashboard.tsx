import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Droplets,
  Plus,
  Sparkles,
  Wrench,
  Zap,
} from 'lucide-react'
import { getComplaints, getSession } from '../services/api'
import type { Complaint } from '../types'
import { StatusBadge } from '../components/Badges'

const categoryIcons: Record<string, typeof Droplets> = {
  Plumbing: Droplets,
  Electricity: Zap,
  Electrical: Zap,
  Internet: Bell,
  'Room Maintenance': Wrench,
  Sanitation: Droplets,
}

const categoryStyles: Record<string, string> = {
  Plumbing: 'bg-cyan-50 text-cyan-700',
  Electricity: 'bg-amber-50 text-amber-700',
  Electrical: 'bg-amber-50 text-amber-700',
  Internet: 'bg-blue-50 text-blue-700',
  'Room Maintenance': 'bg-violet-50 text-violet-700',
  Sanitation: 'bg-emerald-50 text-emerald-700',
}

export default function Dashboard() {
  const [list, setList] = useState<Complaint[]>([])

  useEffect(() => {
    getComplaints().then(setList)
  }, [])

  const active = list.filter(
    (c) => c.status !== 'Resolved'
  ).length

  const resolved = list.filter(
    (c) => c.status === 'Resolved'
  ).length

  const inProgress = list.filter(
    (c) => c.status === 'In Progress'
  ).length

  const pending = list.filter(
    (c) => c.status === 'Assigned'
  ).length

  const me = getSession()

  const firstName =
    me?.name?.split(' ')[0] || 'Student'

  return (
    <div className="space-y-6 pb-10">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-blue-900 to-teal-700 px-7 py-8 text-white shadow-xl sm:px-10 sm:py-10">

        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />

        <div className="absolute -bottom-24 right-40 h-56 w-56 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1fr_360px]">


          {/* HERO TEXT */}

          <div>

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur">

              <Sparkles
                size={14}
                className="text-cyan-200"
              />

              Smart hostel management

            </div>


            <h1 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">

              Good afternoon,{' '}

              <span className="text-cyan-300">
                {firstName}
              </span>{' '}

              👋

            </h1>


            <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">

              Everything about your hostel, all in one
              place. Report an issue and let SmartHostel
              understand, prioritize, and route it to the
              right team.

            </p>


            <Link
              to="/student/report"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-blue-950 shadow-lg transition duration-200 hover:-translate-y-1 hover:shadow-2xl"
            >

              <Plus size={19} />

              Report a Complaint

              <ArrowRight size={17} />

            </Link>

          </div>


          {/* WORKFLOW */}

          <div className="hidden lg:block">

            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/20 text-cyan-200">
                  <Sparkles size={24} />
                </div>

                <div>

                  <p className="font-extrabold">
                    SmartHostel
                  </p>

                  <p className="text-xs text-blue-100">
                    Smart issue resolution
                  </p>

                </div>

              </div>


              <div className="space-y-3">

                <WorkflowItem
                  icon={<ClipboardList size={17} />}
                  title="Report an issue"
                  text="Describe the problem"
                />

                <WorkflowItem
                  icon={<Sparkles size={17} />}
                  title="Issue analysis"
                  text="Category + priority"
                />

                <WorkflowItem
                  icon={<Wrench size={17} />}
                  title="Smart routing"
                  text="Right maintenance team"
                />

                <WorkflowItem
                  icon={<CheckCircle2 size={17} />}
                  title="Track & resolve"
                  text="Updates until fixed"
                />

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          label="Active Complaints"
          value={active}
          subtitle="Currently open"
          icon={<ClipboardList size={21} />}
          iconClass="bg-blue-50 text-blue-600"
        />

        <StatCard
          label="Pending"
          value={pending}
          subtitle="Waiting for action"
          icon={<Clock3 size={21} />}
          iconClass="bg-amber-50 text-amber-600"
        />

        <StatCard
          label="In Progress"
          value={inProgress}
          subtitle="Being worked on"
          icon={<Wrench size={21} />}
          iconClass="bg-violet-50 text-violet-600"
        />

        <StatCard
          label="Resolved"
          value={resolved}
          subtitle="Successfully fixed"
          icon={<CheckCircle2 size={21} />}
          iconClass="bg-emerald-50 text-emerald-600"
        />

      </section>


      {/* =====================================================
          SMART INSIGHT
      ===================================================== */}

      <section className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-cyan-50 p-6 shadow-sm">

        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-300/20 blur-3xl" />

        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div className="flex gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg">
              <Sparkles size={23} />
            </div>

            <div>

              <p className="text-xs font-extrabold uppercase tracking-widest text-blue-600">
                SmartHostel Insight
              </p>

              <h2 className="mt-1 text-lg font-extrabold text-slate-900">
                Your hostel issues are being monitored intelligently.
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                Complaints can be automatically classified,
                prioritized, checked for duplicate issues,
                and routed to the appropriate maintenance team.
              </p>

            </div>

          </div>


          <Link
            to="/student/complaints"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-blue-700"
          >

            View complaints

            <ArrowRight size={16} />

          </Link>

        </div>

      </section>


      {/* =====================================================
          COMPLAINTS + QUICK ACTIONS
      ===================================================== */}

      <div className="grid gap-6 lg:grid-cols-[1fr_330px]">


        {/* RECENT COMPLAINTS */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-5 flex items-center justify-between">

            <div>

              <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                Activity
              </p>

              <h2 className="mt-1 text-xl font-extrabold text-slate-950">
                Recent Complaints
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


          {list.length === 0 ? (

            <div className="rounded-2xl bg-slate-50 px-5 py-12 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <ClipboardList size={27} />
              </div>

              <p className="mt-4 font-extrabold text-slate-900">
                No complaints yet
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Looks like everything is running smoothly!
              </p>

              <Link
                to="/student/report"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-teal-800"
              >

                <Plus size={16} />

                Report your first complaint

              </Link>

            </div>

          ) : (

            <div className="space-y-3">

              {list.slice(0, 4).map((c) => {

                const category =
                  c.analysis.category

                const Icon =
                  categoryIcons[category] || Wrench

                const iconStyle =
                  categoryStyles[category] ||
                  'bg-slate-100 text-slate-600'

                return (

                  <Link
                    key={c.id}
                    to={`/student/complaints/${c.id}`}
                    className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:border-blue-100 hover:bg-blue-50/30 hover:shadow-md"
                  >

                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}
                    >
                      <Icon size={21} />
                    </div>


                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-2">

                        <span className="text-sm font-extrabold text-slate-950">
                          #{c.id}
                        </span>

                        <span className="text-sm font-bold text-slate-700">
                          {category}
                        </span>

                      </div>


                      <p className="mt-1 truncate text-sm text-slate-500">

                        {c.analysis.subcategory}

                        {c.room
                          ? ` • Room ${c.room}`
                          : ''}

                      </p>

                    </div>


                    <div className="flex shrink-0 items-center gap-3">

                      <StatusBadge s={c.status} />

                      <ArrowRight
                        size={17}
                        className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"
                      />

                    </div>

                  </Link>

                )
              })}

            </div>

          )}

        </section>


        {/* QUICK ACTIONS */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-5">

            <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
              Shortcuts
            </p>

            <h2 className="mt-1 text-xl font-extrabold text-slate-950">
              Quick Actions
            </h2>

          </div>


          <div className="space-y-3">

            <QuickAction
              to="/student/report"
              icon={<Plus size={19} />}
              title="Report a Complaint"
              description="Submit a new hostel issue"
              color="teal"
            />

            <QuickAction
              to="/student/complaints"
              icon={<ClipboardList size={19} />}
              title="My Complaints"
              description="Track your reported issues"
              color="blue"
            />

            <QuickAction
              to="/student/notifications"
              icon={<Bell size={19} />}
              title="Notifications"
              description="See your latest updates"
              color="violet"
            />

          </div>

        </section>

      </div>

    </div>
  )
}


/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  label,
  value,
  subtitle,
  icon,
  iconClass,
}: {
  label: string
  value: number
  subtitle: string
  icon: ReactNode
  iconClass: string
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">

      <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-slate-50 transition group-hover:scale-150" />

      <div className="relative flex items-start justify-between">

        <div>

          <p className="text-sm font-bold text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-2 text-xs font-medium text-slate-400">
            {subtitle}
          </p>

        </div>


        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass} transition duration-200 group-hover:scale-110`}
        >
          {icon}
        </div>

      </div>

    </div>
  )
}


/* ============================================================
   WORKFLOW ITEM
============================================================ */

function WorkflowItem({
  icon,
  title,
  text,
}: {
  icon: ReactNode
  title: string
  text: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 p-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 text-cyan-100">
        {icon}
      </div>

      <div>

        <p className="text-sm font-bold">
          {title}
        </p>

        <p className="text-xs text-blue-100">
          {text}
        </p>

      </div>

    </div>
  )
}


/* ============================================================
   QUICK ACTION
============================================================ */

function QuickAction({
  to,
  icon,
  title,
  description,
  color,
}: {
  to: string
  icon: ReactNode
  title: string
  description: string
  color: 'teal' | 'blue' | 'violet'
}) {
  const colors = {
    teal:
      'bg-teal-50 text-teal-700 group-hover:bg-teal-600',

    blue:
      'bg-blue-50 text-blue-700 group-hover:bg-blue-600',

    violet:
      'bg-violet-50 text-violet-700 group-hover:bg-violet-600',
  }

  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border border-slate-100 p-3.5 transition duration-200 hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-sm"
    >

      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition group-hover:text-white ${colors[color]}`}
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
        className="shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-700"
      />

    </Link>
  )
}