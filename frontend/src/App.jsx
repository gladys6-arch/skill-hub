import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import AdminRoutes from './routes/AdminRoutes'
import TeacherRoutes from './routes/TeacherRoutes'
import StudentRoutes from './routes/StudentRoutes'

function App() {
  return (
    
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/*" element={<AdminRoutes />} />
            <Route path="/teacher/*" element={<TeacherRoutes />} />
            <Route path="/student/*" element={<StudentRoutes />} />
          </Routes>
        </div>
      </Router>
  
  )
}

export default App