import { Routes, Route } from 'react-router-dom'
import AdminDashboard from '../pages/Admin/AdminDashboard'
import ManageUsers from '../pages/Admin/ManageUsers'

function AdminRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route path="/users" element={<ManageUsers />} />
    </Routes>
  )
}

export default AdminRoutes