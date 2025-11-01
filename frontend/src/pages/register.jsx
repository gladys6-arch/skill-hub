import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "student", // default role
  });

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
    <div className="form-container">
      <h2>Join SkillHub</h2>
      <p className="form-description">Create your account to start learning or teaching</p>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      {message && <p style={{ color: "green", textAlign: "center" }}>{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="full_name"
          placeholder="Full Name"
          value={formData.full_name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <div className="role-selection">
          <label>Choose your role:</label>
          <select
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
  );
}

export default Register;
