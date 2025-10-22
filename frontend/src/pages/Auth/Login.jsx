import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/authService'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await authService.login(email, password)
      login(response.token, response.role)
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  )
}

export default Login