import React, { useState } from 'react';
import { registerTeacher } from '../services/adminService';

export default function RegisterTeacher() {
  const [formData, setFormData] = useState({
    full_name: '', 
    email: '', 
    password: ''
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerTeacher(formData);
      setMessage('Teacher registered successfully');
      setFormData({ full_name: '', email: '', password: '' });
    } catch (error) {
      setMessage('Error registering teacher');
    }
  };

  return (
    <div className="container mt-4">
      <h3>Register Teacher</h3>
      {message && <div className="alert alert-info">{message}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input 
            type="text" 
            className="form-control"
            placeholder="Full Name" 
            value={formData.full_name}
            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            required 
          />
        </div>
        <div className="mb-3">
          <input 
            type="email" 
            className="form-control"
            placeholder="Email" 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required 
          />
        </div>
        <div className="mb-3">
          <input 
            type="password" 
            className="form-control"
            placeholder="Password" 
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required 
          />
        </div>
        <button type="submit" className="btn btn-success">Register Teacher</button>
      </form>
    </div>
  );
}