import React, { useState } from 'react';
import { addSkill } from '../services/teacherService';

export default function AddSkill() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    course_link: '',
  });

  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addSkill(form);
      alert('Skill added successfully!');
      setForm({ title: '', description: '', price: '', course_link: '' });
    } catch (err) {
      console.error(err);
      alert('Error adding skill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow p-4">
        <h3 className="mb-3">Add Skill / Course</h3>
        <form onSubmit={submit}>
          <div className="mb-3">
            <label>Title</label>
            <input
              className="form-control"
              placeholder="Course title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label>Description</label>
            <textarea
              className="form-control"
              placeholder="Short description of the course"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label>Price (KES)</label>
            <input
              type="number"
              className="form-control"
              placeholder="Enter price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label>External Course Link</label>
            <input
              className="form-control"
              placeholder="Paste YouTube, Google Drive, or website link"
              value={form.course_link}
              onChange={(e) => setForm({ ...form, course_link: e.target.value })}
            />
            <small className="text-muted">
              Students will only access this link after payment.
            </small>
          </div>

          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? 'Saving...' : 'Save Course'}
          </button>
        </form>
      </div>
    </div>
  );
}
