import { Routes, Route } from 'react-router-dom'
import StudentDashboard from '../pages/Student/StudentDashboard'
import AvailableCourses from '../pages/Student/AvailableCourses'
import Progress from '../pages/Student/Progress'
import Certificate from '../pages/Student/Certificate'

function StudentRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<StudentDashboard />} />
      <Route path="/courses" element={<AvailableCourses />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="/certificate" element={<Certificate />} />
    </Routes>
  )
}

export default StudentRoutes