import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { addSkill } from '../services/teacherService';

export default function AddSkill() {
  const [form, setForm] = useState({ name: '', description: '', price: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Skill name is required.';
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
      await addSkill(form);
      setSuccess(true);
      setForm({ name: '', description: '', price: '' });
      setErrors({});
    } catch (error) {
      setErrors({ submit: 'Failed to add skill. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <Link to="/teacher" className="back-button">Back to Dashboard</Link>
      <h3>Add New Skill</h3>
      {success && <div className="alert alert-success">Skill added successfully!</div>}
      {errors.submit && <div className="alert alert-danger">{errors.submit}</div>}
      <form onSubmit={submit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Skill Name</label>
          <input
            type="text"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter skill name"
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
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
            placeholder="Enter skill description"
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
          {loading ? 'Adding...' : 'Add Skill'}
        </button>
      </form>
    </div>
  );
}
