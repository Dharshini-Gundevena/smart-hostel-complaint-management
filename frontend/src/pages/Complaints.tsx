import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  ClipboardList,
  Filter,
  Search,
  Sparkles,
  Wrench,
  X,
  Zap,
  Droplets,
  Wifi,
  RotateCcw,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { getComplaints } from '../services/api'
import type { Complaint } from '../types'
import { StatusBadge } from '../components/Badges'

type FilterType =
  | 'All'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'

type PriorityType =
  | 'All'
  | 'Low'
  | 'Medium'
  | 'High'
  | 'Critical'

const categoryIcons: Record<
  string,
  typeof Wrench
> = {
  Electrical: Zap,
  Electricity: Zap,
  Plumbing: Droplets,
  Internet: Wifi,
  'Room Maintenance': Wrench,
}

const categoryColors: Record<string, string> = {
  Electrical:
    'bg-amber-50 text-amber-600 border-amber-100',
  Electricity:
    'bg-amber-50 text-amber-600 border-amber-100',
  Plumbing:
    'bg-cyan-50 text-cyan-600 border-cyan-100',
  Internet:
    'bg-blue-50 text-blue-600 border-blue-100',
  'Room Maintenance':
    'bg-violet-50 text-violet-600 border-violet-100',
}

export default function Complaints() {
  const [complaints, setComplaints] =
    useState<Complaint[]>([])

  const [search, setSearch] = useState('')

  const [statusFilter, setStatusFilter] =
    useState<FilterType>('All')

  const [priorityFilter, setPriorityFilter] =
    useState<PriorityType>('All')

  const [categoryFilter, setCategoryFilter] =
    useState('All')

  const [showFilters, setShowFilters] =
    useState(false)

  useEffect(() => {
    getComplaints().then(setComplaints)
  }, [])

  /*
   * Some fields may differ slightly depending on
   * your current backend/type definition.
   * These fallbacks keep the UI safe.
   */
  const getComplaintData = (c: Complaint) => {
    const item = c as any

    return {
      priority:
        item.priority ||
        item.analysis?.priority ||
        'Medium',

      category:
        item.analysis?.category ||
        'General',

      subcategory:
        item.analysis?.subcategory ||
        'Hostel Maintenance',

      description:
        item.description ||
        item.text ||
        item.title ||
        item.analysis?.subcategory ||
        'Reported hostel issue',

      room:
        item.room ||
        '—',

      date:
        item.createdAt ||
        item.created_at ||
        item.date ||
        'Recently',

      assignedTo:
        item.assignedTo ||
        item.assigned_team ||
        'Maintenance Team',

      aiSummary:
        item.analysis?.summary ||
        item.analysis?.reason ||
        'AI analysis completed',

      severity:
        item.analysis?.severity ||
        item.severity ||
        item.priority ||
        'Medium',
    }
  }

  const categories = useMemo(() => {
    const values = complaints.map(
      (complaint) =>
        getComplaintData(complaint).category
    )

    return [
      'All',
      ...Array.from(new Set(values)),
    ]
  }, [complaints])

  const stats = useMemo(() => {
    const total = complaints.length

    const resolved = complaints.filter(
      (c) => c.status === 'Resolved'
    ).length

    const inProgress = complaints.filter(
      (c) => c.status === 'In Progress'
    ).length

    const assigned = complaints.filter(
      (c) => c.status === 'Assigned'
    ).length

    const highPriority = complaints.filter((c) => {
      const priority =
        getComplaintData(c).priority

      return (
        priority === 'High' ||
        priority === 'Critical'
      )
    }).length

    return {
      total,
      resolved,
      inProgress,
      assigned,
      highPriority,
    }
  }, [complaints])

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const data = getComplaintData(complaint)

      const searchValue = search
        .toLowerCase()
        .trim()

      const matchesSearch =
        !searchValue ||
        String(complaint.id)
          .toLowerCase()
          .includes(searchValue) ||
        data.category
          .toLowerCase()
          .includes(searchValue) ||
        data.subcategory
          .toLowerCase()
          .includes(searchValue) ||
        data.description
          .toLowerCase()
          .includes(searchValue)

      const matchesStatus =
        statusFilter === 'All' ||
        complaint.status === statusFilter

      const matchesPriority =
        priorityFilter === 'All' ||
        data.priority === priorityFilter

      const matchesCategory =
        categoryFilter === 'All' ||
        data.category === categoryFilter

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesCategory
      )
    })
  }, [
    complaints,
    search,
    statusFilter,
    priorityFilter,
    categoryFilter,
  ])

  function resetFilters() {
    setSearch('')
    setStatusFilter('All')
    setPriorityFilter('All')
    setCategoryFilter('All')
  }

  const hasFilters =
    search !== '' ||
    statusFilter !== 'All' ||
    priorityFilter !== 'All' ||
    categoryFilter !== 'All'

  return (
    <div className="space-y-6 pb-12">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-blue-950 to-teal-800 p-6 text-white shadow-xl sm:p-8">

        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />

        <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative z-10">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur">
                <Sparkles
                  size={13}
                  className="text-cyan-300"
                />
                AI-powered complaint tracking
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                My Complaints
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                Track every issue you've reported,
                see AI analysis, follow maintenance progress,
                and monitor resolution status.
              </p>

            </div>

            <Link
              to="/student/report"
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-blue-950 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl lg:self-auto"
            >
              <ClipboardList size={17} />
              Report New Issue
              <ArrowRight size={16} />
            </Link>

          </div>


          {/* Stats */}

          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-5">

            <ComplaintStat
              label="Total"
              value={stats.total}
              icon={<ClipboardList size={17} />}
            />

            <ComplaintStat
              label="Assigned"
              value={stats.assigned}
              icon={<Clock3 size={17} />}
            />

            <ComplaintStat
              label="In Progress"
              value={stats.inProgress}
              icon={<Wrench size={17} />}
            />

            <ComplaintStat
              label="Resolved"
              value={stats.resolved}
              icon={<CheckCircle2 size={17} />}
            />

            <ComplaintStat
              label="High Priority"
              value={stats.highPriority}
              icon={<AlertTriangle size={17} />}
            />

          </div>

        </div>

      </section>


      {/* =====================================================
          AI STATUS
      ===================================================== */}

      <section className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-cyan-50 p-5 shadow-sm">

        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-blue-300/20 blur-3xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg">
            <Sparkles size={23} />
          </div>

          <div className="flex-1">

            <p className="text-xs font-extrabold uppercase tracking-widest text-blue-600">
              SmartHostel AI
            </p>

            <h2 className="mt-1 text-base font-black text-slate-900">
              Your complaints are intelligently monitored
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              AI analyzes category, severity, duplicate
              issues and routing so your complaint reaches
              the appropriate maintenance team.
            </p>

          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">

            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />

            <span className="text-xs font-extrabold text-emerald-700">
              AI System Active
            </span>

          </div>

        </div>

      </section>


      {/* =====================================================
          SEARCH + FILTER
      ===================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

          {/* Search */}

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by complaint ID, category or issue..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            )}

          </div>


          {/* Filter toggle */}

          <button
            type="button"
            onClick={() =>
              setShowFilters(!showFilters)
            }
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition ${
              showFilters
                ? 'border-blue-200 bg-blue-50 text-blue-700'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Filter size={17} />
            Filters

            {hasFilters && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] text-white">
                !
              </span>
            )}

            <ChevronDown
              size={15}
              className={`transition ${
                showFilters
                  ? 'rotate-180'
                  : ''
              }`}
            />

          </button>

        </div>


        {/* Filters */}

        {showFilters && (
          <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3">

            <FilterSelect
              label="Status"
              value={statusFilter}
              options={[
                'All',
                'Assigned',
                'In Progress',
                'Resolved',
              ]}
              onChange={(value) =>
                setStatusFilter(
                  value as FilterType
                )
              }
            />

            <FilterSelect
              label="Priority"
              value={priorityFilter}
              options={[
                'All',
                'Low',
                'Medium',
                'High',
                'Critical',
              ]}
              onChange={(value) =>
                setPriorityFilter(
                  value as PriorityType
                )
              }
            />

            <FilterSelect
              label="Category"
              value={categoryFilter}
              options={categories}
              onChange={setCategoryFilter}
            />

          </div>
        )}

      </section>


      {/* =====================================================
          RESULTS HEADER
      ===================================================== */}

      <div className="flex items-center justify-between">

        <div>

          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
            Complaint Center
          </p>

          <h2 className="mt-1 text-xl font-black text-slate-950">
            {hasFilters
              ? 'Filtered Complaints'
              : 'All Complaints'}
          </h2>

        </div>

        <div className="flex items-center gap-2">

          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">
            {filteredComplaints.length}{' '}
            {filteredComplaints.length === 1
              ? 'issue'
              : 'issues'}
          </span>

          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50"
            >
              <RotateCcw size={13} />
              Reset
            </button>
          )}

        </div>

      </div>


      {/* =====================================================
          COMPLAINT LIST
      ===================================================== */}

      {filteredComplaints.length === 0 ? (

        <EmptyComplaints
          hasFilters={hasFilters}
          resetFilters={resetFilters}
        />

      ) : (

        <div className="space-y-4">

          {filteredComplaints.map((complaint) => (

            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
            />

          ))}

        </div>

      )}

    </div>
  )
}


/* ============================================================
   COMPLAINT CARD
============================================================ */

function ComplaintCard({
  complaint,
}: {
  complaint: Complaint
}) {
  const data = (() => {
    const item = complaint as any

    return {
      priority:
        item.priority ||
        item.analysis?.priority ||
        'Medium',

      category:
        item.analysis?.category ||
        'General',

      subcategory:
        item.analysis?.subcategory ||
        'Hostel Maintenance',

      description:
        item.description ||
        item.text ||
        item.title ||
        item.analysis?.subcategory ||
        'Reported hostel issue',

      room:
        item.room ||
        '—',

      date:
        item.createdAt ||
        item.created_at ||
        item.date ||
        'Recently',

      assignedTo:
        item.assignedTo ||
        item.assigned_team ||
        'Maintenance Team',

      aiSummary:
        item.analysis?.summary ||
        item.analysis?.reason ||
        'AI analysis completed',

      severity:
        item.analysis?.severity ||
        item.severity ||
        item.priority ||
        'Medium',
    }
  })()

  const Icon =
    categoryIcons[data.category] ||
    Wrench

  const categoryStyle =
    categoryColors[data.category] ||
    'bg-slate-50 text-slate-600 border-slate-100'

  const isResolved =
    complaint.status === 'Resolved'

  const progress =
    complaint.status === 'Resolved'
      ? 100
      : complaint.status === 'In Progress'
        ? 65
        : complaint.status === 'Assigned'
          ? 30
          : 10

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-lg">

      {/* Main */}

      <div className="p-5 sm:p-6">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">

          {/* Category icon */}

          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${categoryStyle}`}
          >
            <Icon size={24} />
          </div>


          {/* Content */}

          <div className="min-w-0 flex-1">

            {/* Top line */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

              <div>

                <div className="flex flex-wrap items-center gap-2">

                  <span className="text-base font-black text-slate-950">
                    #{complaint.id}
                  </span>

                  <span className="text-slate-300">
                    •
                  </span>

                  <span className="text-sm font-extrabold text-slate-700">
                    {data.category}
                  </span>

                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${categoryStyle}`}
                  >
                    {data.subcategory}
                  </span>

                </div>

                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
                  {data.description}
                </p>

              </div>


              {/* Status */}

              <div className="flex shrink-0 items-center gap-2">

                <PriorityBadge
                  priority={data.priority}
                />

                <StatusBadge
                  s={complaint.status}
                />

              </div>

            </div>


            {/* Metadata */}

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-400">

              <span className="flex items-center gap-1.5">
                <Clock3 size={13} />
                {formatDate(data.date)}
              </span>

              <span className="flex items-center gap-1.5">
                <ClipboardList size={13} />
                Room {data.room}
              </span>

              <span className="flex items-center gap-1.5">
                <Wrench size={13} />
                {data.assignedTo}
              </span>

            </div>


            {/* Progress */}

            <div className="mt-5">

              <div className="mb-2 flex items-center justify-between">

                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Resolution Progress
                </span>

                <span className="text-xs font-black text-slate-600">
                  {progress}%
                </span>

              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                <div
                  className={`h-full rounded-full transition-all ${
                    isResolved
                      ? 'bg-emerald-500'
                      : 'bg-gradient-to-r from-blue-600 to-teal-500'
                  }`}
                  style={{
                    width: `${progress}%`,
                  }}
                />

              </div>

              <div className="mt-2 flex justify-between text-[9px] font-bold text-slate-400">

                <span>Reported</span>

                <span>Assigned</span>

                <span>In Progress</span>

                <span>Resolved</span>

              </div>

            </div>


            {/* AI analysis */}

            <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">

              <div className="flex items-start gap-3">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Sparkles size={15} />
                </div>

                <div className="min-w-0 flex-1">

                  <div className="flex items-center gap-2">

                    <p className="text-xs font-black text-blue-800">
                      AI Analysis
                    </p>

                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black text-emerald-700">
                      ANALYZED
                    </span>

                  </div>

                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    {data.aiSummary}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* Bottom actions */}

      <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

        <div className="flex items-center gap-2">

          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              isResolved
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-blue-100 text-blue-600'
            }`}
          >
            {isResolved ? (
              <CheckCircle2 size={15} />
            ) : (
              <Wrench size={15} />
            )}
          </div>

          <div>

            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Current status
            </p>

            <p className="text-xs font-extrabold text-slate-700">
              {complaint.status}
            </p>

          </div>

        </div>


        <Link
          to={`/student/complaints/${complaint.id}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-blue-700"
        >
          View Full Details
          <ArrowRight size={15} />
        </Link>

      </div>

    </article>
  )
}


/* ============================================================
   STAT
============================================================ */

function ComplaintStat({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">

      <div className="flex items-center gap-2 text-blue-200">

        {icon}

        <span className="text-[11px] font-bold">
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
   PRIORITY BADGE
============================================================ */

function PriorityBadge({
  priority,
}: {
  priority: string
}) {
  const styles: Record<string, string> = {
    Low:
      'bg-emerald-50 text-emerald-700 border-emerald-100',

    Medium:
      'bg-amber-50 text-amber-700 border-amber-100',

    High:
      'bg-orange-50 text-orange-700 border-orange-100',

    Critical:
      'bg-red-50 text-red-700 border-red-100',
  }

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
        styles[priority] ||
        styles.Medium
      }`}
    >
      {priority}
    </span>
  )
}


/* ============================================================
   FILTER SELECT
============================================================ */

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <div>

      <label className="mb-1.5 block text-xs font-extrabold text-slate-500">
        {label}
      </label>

      <div className="relative">

        <select
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 pr-9 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
        >
          {options.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

      </div>

    </div>
  )
}


/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyComplaints({
  hasFilters,
  resetFilters,
}: {
  hasFilters: boolean
  resetFilters: () => void
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <ClipboardList size={29} />
      </div>

      <h3 className="mt-5 text-xl font-black text-slate-950">
        {hasFilters
          ? 'No matching complaints'
          : 'No complaints yet'}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasFilters
          ? 'Try changing your filters or search term to find another complaint.'
          : 'Everything looks good! If you notice an issue in your hostel, you can report it here.'}
      </p>

      {hasFilters ? (

        <button
          type="button"
          onClick={resetFilters}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
        >
          <RotateCcw size={15} />
          Reset Filters
        </button>

      ) : (

        <Link
          to="/student/report"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800"
        >
          Report a Complaint
          <ArrowRight size={15} />
        </Link>

      )}

    </div>
  )
}


/* ============================================================
   DATE FORMATTER
============================================================ */

function formatDate(value: unknown) {
  if (!value) return 'Recently'

  const date = new Date(
    String(value)
  )

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return date.toLocaleDateString(
    'en-IN',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }
  )
}