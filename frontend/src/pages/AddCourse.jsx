import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { addCourse } from '../services/teacherService';

export default function AddCourse() {
  const [form, setForm] = useState({ title: '', description: '', price: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Course title is required.';
    if (!form.description.trim()) newErrors.description = 'Description is required.';
    if (!form.price || isNaN(form.price) || form.price <= 0) newErrors.price = 'Valid price is required.';
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
      await addCourse(form);
      setSuccess(true);
      setForm({ title: '', description: '', price: '' });
      setErrors({});
    } catch (error) {
      setErrors({ submit: 'Failed to add course. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ marginTop: '150px' }}>
      <Link to="/teacher" className="back-button">Back to Dashboard</Link>
      <h3>Add New Course</h3>
      {success && <div className="alert alert-success">Course added successfully!</div>}
      {errors.submit && <div className="alert alert-danger">{errors.submit}</div>}
      <form onSubmit={submit}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Course Title</label>
          <input
            type="text"
            className={`form-control ${errors.title ? 'is-invalid' : ''}`}
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter course title"
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
            placeholder="Enter course description"
          />
          {errors.description && <div className="invalid-feedback">{errors.description}</div>}
        </div>
        <div className="mb-3">
          <label htmlFor="price" className="form-label">Price</label>
          <input
            type="number"
            className={`form-control ${errors.price ? 'is-invalid' : ''}`}
            id="price"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Enter price"
            min="0"
            step="0.01"
          />
          {errors.price && <div className="invalid-feedback">{errors.price}</div>}
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Adding...' : 'Add Course'}
        </button>
      </form>
    </div>
  );
}