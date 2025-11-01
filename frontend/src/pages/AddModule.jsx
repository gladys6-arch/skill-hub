import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { addModule } from '../services/teacherService';

export default function AddModule() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', content: '', order: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Module title is required.';
    if (!form.description.trim()) newErrors.description = 'Description is required.';
    if (!form.content.trim()) newErrors.content = 'Content is required.';
    if (!form.order || isNaN(form.order) || form.order < 0) newErrors.order = 'Valid order (non-negative number) is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setSuccess(false);
    try {
      await addModule(courseId, form);
      setSuccess(true);
      setForm({ title: '', description: '', content: '', order: '' });
      setErrors({});
      // Optionally navigate back to modules page
      setTimeout(() => navigate(`/teacher/courses/${courseId}/modules`), 2000);
    } catch (error) {
      setErrors({ submit: 'Failed to add module. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <Link to="/teacher" className="back-button">Back to Dashboard</Link>
      <h3>Add New Module</h3>
      {success && <div className="alert alert-success">Module added successfully! Redirecting...</div>}
      {errors.submit && <div className="alert alert-danger">{errors.submit}</div>}
      <form onSubmit={submit}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Module Title</label>
          <input
            type="text"
            className={`form-control ${errors.title ? 'is-invalid' : ''}`}
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter module title"
          />
          {errors.title && <div className="invalid-feedback">{errors.title}</div>}
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            className={`form-control ${errors.description ? 'is-invalid' : ''}`}
            id="description"
            name="description"
            rows="3"
            value={form.description}
            onChange={handleChange}
            placeholder="Enter module description"
          />
          {errors.description && <div className="invalid-feedback">{errors.description}</div>}
        </div>
        <div className="mb-3">
          <label htmlFor="content" className="form-label">Content</label>
          <textarea
            className={`form-control ${errors.content ? 'is-invalid' : ''}`}
            id="content"
            name="content"
            rows="5"
            value={form.content}
            onChange={handleChange}
            placeholder="Enter module content"
          />
          {errors.content && <div className="invalid-feedback">{errors.content}</div>}
        </div>
        <div className="mb-3">
          <label htmlFor="order" className="form-label">Order</label>
          <input
            type="number"
            className={`form-control ${errors.order ? 'is-invalid' : ''}`}
            id="order"
            name="order"
            value={form.order}
            onChange={handleChange}
            placeholder="Enter order (e.g., 1, 2, 3...)"
            min="0"
          />
          {errors.order && <div className="invalid-feedback">{errors.order}</div>}
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Adding...' : 'Add Module'}
        </button>
      </form>
    </div>
  );
}