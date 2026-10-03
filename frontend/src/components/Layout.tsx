import {
  Bell,
  ClipboardList,
  Home,
  LogOut,
  PlusCircle,
  Sparkles,
  User,
} from 'lucide-react'
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { getSession, logout } from '../services/api'

const links = [
  {
    to: '/student/dashboard',
    label: 'Dashboard',
    Icon: Home,
  },
  {
    to: '/student/report',
    label: 'Report Complaint',
    Icon: PlusCircle,
  },
  {
    to: '/student/complaints',
    label: 'My Complaints',
    Icon: ClipboardList,
  },
  {
    to: '/student/notifications',
    label: 'Notifications',
    Icon: Bell,
  },
  {
    to: '/student/profile',
    label: 'Profile',
    Icon: User,
  },
]

export default function Layout() {
  const nav = useNavigate()
  const location = useLocation()
  const me = getSession()

  const pageTitle =
    links.find((link) =>
      location.pathname.startsWith(link.to)
    )?.label || 'Dashboard'

  const firstLetter =
    me?.name?.charAt(0).toUpperCase() || 'S'

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">

      {/* HEADER */}

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="flex h-[72px] items-center justify-between">

            {/* BRAND */}

            <NavLink
              to="/student/dashboard"
              className="flex items-center gap-3"
            >

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 text-white shadow-lg">
                <Sparkles size={21} />
              </div>

              <div>

                <p className="text-lg font-extrabold tracking-tight text-slate-950">
                  SmartHostel
                </p>

              </div>

            </NavLink>


            {/* USER AREA */}

            <div className="flex items-center gap-3">

              {/* Notifications */}

              <button
                onClick={() =>
                  nav('/student/notifications')
                }
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                aria-label="Notifications"
              >

                <Bell size={18} />

                <span className="absolute right-2 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />

              </button>


              <div className="hidden h-8 w-px bg-slate-200 sm:block" />


              {/* Student */}

              <div className="hidden items-center gap-3 sm:flex">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-teal-500 text-sm font-extrabold text-white shadow-sm">
                  {firstLetter}
                </div>

                <div className="leading-tight">

                  <p className="text-sm font-extrabold text-slate-900">
                    {me?.name || 'Student'}
                  </p>

                  <p className="text-xs text-slate-400">
                    Student
                  </p>

                </div>

              </div>


              {/* Logout */}

              <button
                onClick={() => {
                  logout()
                  nav('/student/login')
                }}
                className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:flex"
              >

                <LogOut size={16} />

                Log out

              </button>

            </div>

          </div>


          {/* DESKTOP NAV */}

          <nav className="hidden items-center gap-1 overflow-x-auto pb-3 md:flex">

            {links.map(({ to, label, Icon }) => (

              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `group flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    isActive
                      ? 'bg-teal-50 text-teal-800 shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >

                {({ isActive }) => (
                  <>
                    <Icon
                      size={17}
                      className={
                        isActive
                          ? 'text-teal-700'
                          : 'text-slate-400 group-hover:text-slate-700'
                      }
                    />

                    {label}
                  </>
                )}

              </NavLink>

            ))}

          </nav>

        </div>

      </header>


      {/* MOBILE HEADER */}

      <div className="border-b border-slate-200 bg-white px-4 py-3 md:hidden">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              SmartHostel
            </p>

            <p className="font-extrabold text-slate-900">
              {pageTitle}
            </p>

          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-teal-500 text-sm font-extrabold text-white">
            {firstLetter}
          </div>

        </div>

      </div>


      {/* MAIN */}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Outlet />
      </main>


      {/* MOBILE NAV */}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 px-2 py-2 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] backdrop-blur md:hidden">

        <div className="grid grid-cols-5 gap-1">

          {links.map(({ to, label, Icon }) => (

            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-bold transition ${
                  isActive
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-400'
                }`
              }
            >

              <Icon size={18} />

              <span>
                {label === 'Report Complaint'
                  ? 'Report'
                  : label === 'My Complaints'
                    ? 'Complaints'
                    : label}
              </span>

            </NavLink>

          ))}

        </div>

      </nav>

    </div>
  )
}