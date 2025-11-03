import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "student", // default role
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.msg || "Registration failed. Try again.");
        setMessage("");
        return;
      }

      setMessage("Registration successful! You can now log in.");
      setError("");
      
      // Redirect to login page after a short delay
      setTimeout(() => navigate("/login"), 1500);

    } catch (err) {
      console.error("Registration error:", err);
      setError("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="register-page luxury-bg">
      <div className="register-card">
        <h1>Register</h1>
        <p>Create your account to get started with Skill Hub.</p>

        {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}
        {message && <p style={{ color: "green", marginBottom: "1rem" }}>{message}</p>}

        <form onSubmit={handleSubmit}>
          <div>
            <input
              id="full_name"
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              placeholder="Full Name"
            />
          </div>

          <div>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Email"
            />
          </div>

          <div>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
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

          <div>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          <button type="submit" className="btn">Register</button>
        </form>
      </div>
    </div>
  );
}

export default Register;
