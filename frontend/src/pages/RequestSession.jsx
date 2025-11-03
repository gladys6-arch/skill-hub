import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../api';

export default function RequestSession() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({ teacher_id: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/student/teachers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        setTeachers(data);
      } catch (error) {
        console.error('Error fetching teachers:', error);
      }
    };
    fetchTeachers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/api/student/request-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      setSuccess(true);
      setTimeout(() => navigate('/student'), 2000);
    } catch (error) {
      console.error('Error requesting session:', error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mt-4">
        <div className="alert alert-success">
          <h4>Request Sent Successfully!</h4>
          <p>Your study session request has been sent to the teacher. You will be notified when they respond.</p>
          <p>Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <Link to="/student" className="back-button">Back to Dashboard</Link>
      <h3>Request a Study Session</h3>

      <div className="card">
        <div className="card-body">
          <form onSubmit={submit}>
            <div className="mb-3">
              <label htmlFor="teacher_id" className="form-label">Select Teacher</label>
              <select
                className="form-control"
                id="teacher_id"
                name="teacher_id"
                value={form.teacher_id}
                onChange={handleChange}
                required
              >
                <option value="">Choose a teacher...</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.full_name} - {teacher.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="subject" className="form-label">Subject/Topic</label>
              <input
                type="text"
                className="form-control"
                id="subject"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="e.g., Python Programming, Data Structures"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="message" className="form-label">Message (Optional)</label>
              <textarea
                className="form-control"
                id="message"
                name="message"
                rows="3"
                value={form.message}
                onChange={handleChange}
                placeholder="Tell the teacher about your learning goals or specific questions..."
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending Request...' : 'Send Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}