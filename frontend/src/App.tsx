import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { getSession } from './services/api'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Complaints from './pages/Complaints'
import ComplaintDetail from './pages/ComplaintDetail'
import Report from './pages/Report'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import FeedbackPage from './pages/Feedback'

function Protected() {
  return getSession() ? <Layout /> : <Navigate to="/student/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/student/dashboard" replace />} />
      <Route path="/student/login" element={<Login />} />
      <Route path="/student/register" element={<Register />} />
      <Route element={<Protected />}>
        <Route path="/student/dashboard" element={<Dashboard />} />
        <Route path="/student/complaints" element={<Complaints />} />
        <Route path="/student/complaints/:id" element={<ComplaintDetail />} />
        <Route path="/student/report" element={<Report />} />
        <Route path="/student/notifications" element={<Notifications />} />
        <Route path="/student/profile" element={<Profile />} />
        <Route path="/student/feedback/:id" element={<FeedbackPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
    </Routes>
  )
}
