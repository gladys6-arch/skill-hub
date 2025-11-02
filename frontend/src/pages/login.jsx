import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext.jsx"; // use context
import "./login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); // use global login function
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.msg || "Login failed. Please try again.");
        return;
      }

      // Save user globally using AuthContext
      login({ email, role: data.role, token: data.token });

      // Redirect to role-based dashboard
      if (data.role === "admin") navigate("/admin");
      else if (data.role === "teacher") navigate("/teacher");
      else if (data.role === "student") navigate("/student");
      else navigate("/");

    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="login-page luxury-bg">
      <div className="login-card">
        <h1>Login</h1>
        <p>Welcome back! Please sign in to your account.</p>
        {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email"
            />
          </div>

          <div>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#CFCAC2',
                  fontSize: '14px',
                  textDecoration: 'underline'
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="button-area">
            <button type="submit" className="btn">Login</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
