import React, { useState } from 'react';
import axios from 'axios';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/auth/register', form);
      alert('Registration successful');
    } catch (err) {
      alert('Error registering');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} /><br/>
        <input type="email" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} /><br/>
        <input type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} /><br/>
        <select onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select><br/>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
