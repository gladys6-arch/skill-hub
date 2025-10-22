import { Routes, Route } from 'react-router-dom'
import TeacherDashboard from '../pages/Teacher/TeacherDashboard'
import AddSkill from '../pages/Teacher/AddSkill'
import Modules from '../pages/Teacher/Modules'

function TeacherRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<TeacherDashboard />} />
      <Route path="/add-skill" element={<AddSkill />} />
      <Route path="/modules" element={<Modules />} />
    </Routes>
  )
}

export default TeacherRoutes