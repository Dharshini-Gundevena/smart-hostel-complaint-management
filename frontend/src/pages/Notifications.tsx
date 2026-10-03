import {
  Bell,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  Filter,
  MessageSquareText,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Wrench,
  X,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'

type NotificationType =
  | 'progress'
  | 'resolved'
  | 'ai'
  | 'system'
  | 'feedback'

type NotificationItem = {
  id: number
  type: NotificationType
  title: string
  message: string
  time: string
  date: string
  complaintId?: string
  unread: boolean
  priority?: 'high' | 'normal'
}

const notifications: NotificationItem[] = [
  {
    id: 1,
    type: 'progress',
    title: 'Complaint #1021 is now In Progress',
    message:
      'A maintenance team member has started working on your reported issue.',
    time: '10:30 AM',
    date: 'Today',
    complaintId: '1021',
    unread: true,
    priority: 'high',
  },
  {
    id: 2,
    type: 'ai',
    title: 'AI analysis completed',
    message:
      'SmartHostel AI classified your complaint and routed it to the appropriate maintenance team.',
    time: '10:25 AM',
    date: 'Today',
    complaintId: '1021',
    unread: true,
  },
  {
    id: 3,
    type: 'resolved',
    title: 'Complaint #1018 was resolved',
    message:
      'Your reported issue has been marked as resolved. Please share your feedback about the service.',
    time: '3:20 PM',
    date: 'Sep 21, 2026',
    complaintId: '1018',
    unread: false,
    priority: 'normal',
  },
  {
    id: 4,
    type: 'feedback',
    title: 'Feedback requested',
    message:
      'Your feedback helps SmartHostel improve maintenance services for students.',
    time: '3:20 PM',
    date: 'Sep 21, 2026',
    complaintId: '1018',
    unread: false,
  },
  {
    id: 5,
    type: 'system',
    title: 'Welcome to SmartHostel AI',
    message:
      'Your student account is ready. You can report, track and manage hostel complaints from one place.',
    time: '8:00 AM',
    date: 'Sep 15, 2026',
    unread: false,
  },
]

export default function Notifications() {
  const [activeFilter, setActiveFilter] =
    useState<'all' | 'unread' | 'complaints' | 'system'>('all')

  const [search, setSearch] = useState('')

  const [items, setItems] =
    useState<NotificationItem[]>(notifications)

  const unreadCount = items.filter(
    (item) => item.unread
  ).length

  const complaintCount = items.filter(
    (item) =>
      item.type === 'progress' ||
      item.type === 'resolved' ||
      item.type === 'ai' ||
      item.type === 'feedback'
  ).length

  const filteredNotifications = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.message
          .toLowerCase()
          .includes(search.toLowerCase())

      if (!matchesSearch) return false

      if (activeFilter === 'unread') {
        return item.unread
      }

      if (activeFilter === 'complaints') {
        return (
          item.type === 'progress' ||
          item.type === 'resolved' ||
          item.type === 'ai' ||
          item.type === 'feedback'
        )
      }

      if (activeFilter === 'system') {
        return item.type === 'system'
      }

      return true
    })
  }, [items, activeFilter, search])

  function markAllRead() {
    setItems((current) =>
      current.map((item) => ({
        ...item,
        unread: false,
      }))
    )
  }

  function markRead(id: number) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              unread: false,
            }
          : item
      )
    )
  }

  function removeNotification(id: number) {
    setItems((current) =>
      current.filter((item) => item.id !== id)
    )
  }

  return (
    <div className="space-y-6 pb-12">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-blue-950 to-teal-800 p-6 text-white shadow-xl sm:p-8">

        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />

        <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative z-10">

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

            <div className="flex items-start gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-cyan-200 shadow-lg backdrop-blur">
                <Bell size={27} />
              </div>

              <div>

                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur">
                  <Sparkles
                    size={13}
                    className="text-cyan-300"
                  />
                  SmartHostel AI
                </div>

                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  Notifications
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                  Stay updated with complaint progress, AI analysis,
                  maintenance actions and important hostel alerts.
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={markAllRead}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-blue-950 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <CheckCircle2 size={17} />
              Mark all as read
            </button>

          </div>

        </div>

        {/* Bottom statistics */}

        <div className="relative z-10 mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4">

          <NotificationStat
            label="Total"
            value={items.length}
            icon={<Bell size={16} />}
          />

          <NotificationStat
            label="Unread"
            value={unreadCount}
            icon={<Zap size={16} />}
          />

          <NotificationStat
            label="Complaint Updates"
            value={complaintCount}
            icon={<ClipboardList size={16} />}
          />

          <NotificationStat
            label="System"
            value={
              items.filter(
                (item) => item.type === 'system'
              ).length
            }
            icon={<ShieldCheck size={16} />}
          />

        </div>

      </section>


      {/* =====================================================
          SMART AI INSIGHT
      ===================================================== */}

      {unreadCount > 0 && (
        <section className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-cyan-50 p-5 shadow-sm">

          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-300/20 blur-3xl" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md">
              <Sparkles size={21} />
            </div>

            <div className="flex-1">

              <p className="text-xs font-extrabold uppercase tracking-widest text-blue-600">
                SmartHostel AI Insight
              </p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                You have {unreadCount} unread notification
                {unreadCount !== 1 ? 's' : ''}.
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Some updates may require your attention,
                including complaint progress and feedback requests.
              </p>

            </div>

            <button
              type="button"
              onClick={markAllRead}
              className="shrink-0 text-sm font-extrabold text-blue-600 hover:text-blue-800"
            >
              Clear unread
            </button>

          </div>

        </section>
      )}


      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          {/* Search */}

          <div className="relative w-full lg:max-w-sm">

            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search notifications..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
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


          {/* Filters */}

          <div className="flex flex-wrap items-center gap-2">

            <div className="mr-1 hidden items-center gap-2 text-xs font-bold text-slate-400 sm:flex">
              <Filter size={14} />
              Filter
            </div>

            <FilterButton
              active={activeFilter === 'all'}
              onClick={() => setActiveFilter('all')}
              label="All"
              count={items.length}
            />

            <FilterButton
              active={activeFilter === 'unread'}
              onClick={() => setActiveFilter('unread')}
              label="Unread"
              count={unreadCount}
            />

            <FilterButton
              active={activeFilter === 'complaints'}
              onClick={() => setActiveFilter('complaints')}
              label="Complaints"
            />

            <FilterButton
              active={activeFilter === 'system'}
              onClick={() => setActiveFilter('system')}
              label="System"
            />

            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              title="Notification settings"
            >
              <Settings2 size={17} />
            </button>

          </div>

        </div>

      </section>


      {/* =====================================================
          NOTIFICATIONS
      ===================================================== */}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

        <div className="mb-6 flex items-center justify-between">

          <div>

            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
              Activity Center
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-950">
              Recent Updates
            </h2>

          </div>

          <span className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 sm:block">
            {filteredNotifications.length} notifications
          </span>

        </div>


        {filteredNotifications.length === 0 ? (

          <EmptyState
            search={search}
            filter={activeFilter}
          />

        ) : (

          <div className="space-y-3">

            {filteredNotifications.map(
              (notification) => (

                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onRead={markRead}
                  onRemove={removeNotification}
                />

              )
            )}

          </div>

        )}

      </section>


      {/* =====================================================
          FOOTER CTA
      ===================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
              <MessageSquareText size={18} />
            </div>

            <div>

              <p className="text-sm font-extrabold text-slate-900">
                Need to report another issue?
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                SmartHostel AI can analyze and route it automatically.
              </p>

            </div>

          </div>

          <Link
            to="/student/report"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-teal-800"
          >
            Report Complaint
            <ChevronRight size={16} />
          </Link>

        </div>

      </section>

    </div>
  )
}


/* ============================================================
   NOTIFICATION CARD
============================================================ */

function NotificationCard({
  notification,
  onRead,
  onRemove,
}: {
  notification: NotificationItem
  onRead: (id: number) => void
  onRemove: (id: number) => void
}) {
  const config = getNotificationConfig(
    notification.type
  )

  const Icon = config.icon

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-4 transition duration-200 sm:p-5 ${
        notification.unread
          ? 'border-blue-100 bg-blue-50/30 shadow-sm'
          : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
      }`}
    >

      {/* Unread indicator */}

      {notification.unread && (
        <div className="absolute left-0 top-0 h-full w-1 bg-blue-600" />
      )}

      <div className="flex gap-4">

        {/* Icon */}

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${config.iconStyle}`}
        >
          <Icon size={20} />
        </div>


        {/* Content */}

        <div className="min-w-0 flex-1">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

            <div className="min-w-0">

              <div className="flex flex-wrap items-center gap-2">

                <h3
                  className={`text-sm ${
                    notification.unread
                      ? 'font-black text-slate-950'
                      : 'font-extrabold text-slate-800'
                  }`}
                >
                  {notification.title}
                </h3>

                {notification.unread && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-blue-700">
                    New
                  </span>
                )}

                {notification.priority === 'high' && (
                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-red-600">
                    Important
                  </span>
                )}

              </div>

              <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-500">
                {notification.message}
              </p>

            </div>

            <div className="shrink-0">

              <p className="text-xs font-bold text-slate-400">
                {notification.date}
              </p>

              <p className="mt-1 text-right text-[11px] font-medium text-slate-400">
                {notification.time}
              </p>

            </div>

          </div>


          {/* Bottom actions */}

          <div className="mt-4 flex flex-wrap items-center gap-2">

            {notification.complaintId && (
              <Link
                to={`/student/complaints/${notification.complaintId}`}
                onClick={() =>
                  onRead(notification.id)
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
              >
                View Complaint
                <ChevronRight size={13} />
              </Link>
            )}

            {notification.type === 'feedback' &&
              notification.complaintId && (
                <Link
                  to={`/student/feedback/${notification.complaintId}`}
                  onClick={() =>
                    onRead(notification.id)
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-100"
                >
                  <MessageSquareText size={13} />
                  Give Feedback
                </Link>
              )}

            {notification.unread && (
              <button
                type="button"
                onClick={() =>
                  onRead(notification.id)
                }
                className="rounded-lg px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                Mark as read
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                onRemove(notification.id)
              }
              className="ml-auto rounded-lg px-2 py-2 text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
              title="Remove notification"
            >
              <X size={15} />
            </button>

          </div>

        </div>

      </div>

    </div>
  )
}


/* ============================================================
   NOTIFICATION CONFIG
============================================================ */

function getNotificationConfig(
  type: NotificationType
) {
  const config = {
    progress: {
      icon: Wrench,
      iconStyle: 'bg-violet-50 text-violet-600',
    },

    resolved: {
      icon: CheckCircle2,
      iconStyle: 'bg-emerald-50 text-emerald-600',
    },

    ai: {
      icon: Sparkles,
      iconStyle: 'bg-blue-50 text-blue-600',
    },

    system: {
      icon: ShieldCheck,
      iconStyle: 'bg-slate-100 text-slate-600',
    },

    feedback: {
      icon: MessageSquareText,
      iconStyle: 'bg-amber-50 text-amber-600',
    },
  }

  return config[type]
}


/* ============================================================
   STAT CARD
============================================================ */

function NotificationStat({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <div className="bg-white/5 px-4 py-4 backdrop-blur sm:px-5">

      <div className="flex items-center gap-2 text-blue-200">

        {icon}

        <span className="text-xs font-bold">
          {label}
        </span>

      </div>

      <p className="mt-1 text-2xl font-black">
        {value}
      </p>

    </div>
  )
}


/* ============================================================
   FILTER BUTTON
============================================================ */

function FilterButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  label: string
  count?: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 items-center gap-1.5 rounded-xl px-3.5 text-xs font-extrabold transition ${
        active
          ? 'bg-blue-600 text-white shadow-sm'
          : 'border border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600'
      }`}
    >
      {label}

      {count !== undefined && (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[9px] ${
            active
              ? 'bg-white/20 text-white'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          {count}
        </span>
      )}

    </button>
  )
}


/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState({
  search,
  filter,
}: {
  search: string
  filter: string
}) {
  return (
    <div className="rounded-2xl bg-slate-50 px-5 py-16 text-center">

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
        <Bell size={28} />
      </div>

      <h3 className="mt-5 text-lg font-black text-slate-900">
        No notifications found
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {search
          ? `Nothing matches "${search}". Try a different search term.`
          : filter === 'unread'
            ? 'You have no unread notifications.'
            : 'There are no notifications in this category yet.'}
      </p>

    </div>
  )
}