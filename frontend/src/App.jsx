import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './components/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/login'
import Register from './pages/register'
import AdminRoutes from './Routes/AdminRoutes'
import TeacherRoutes from './Routes/TeacherRoutes'
import StudentRoutes from './Routes/StudentRoutes'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/*" element={<AdminRoutes />} />
            <Route path="/teacher/*" element={<TeacherRoutes />} />
            <Route path="/student/*" element={<StudentRoutes />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
