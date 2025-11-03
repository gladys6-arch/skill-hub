import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerTeacher } from '../services/adminService';

export default function RegisterTeacher() {
  const [formData, setFormData] = useState({
    full_name: '', 
    email: '', 
    password: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await registerTeacher(formData);
      setMessage('Teacher registered successfully! Redirecting to user management...');
      setMessageType('success');
      setFormData({ full_name: '', email: '', password: '' });
      
      setTimeout(() => {
        navigate('/admin/manage-users');
      }, 2000);
    } catch (error) {
      setMessage('Error registering teacher. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({...formData, [field]: value});
    if (message) {
      setMessage('');
      setMessageType('');
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-success text-white">
              <div className="d-flex align-items-center">
                <button 
                  className="btn btn-outline-light btn-sm me-3"
                  onClick={() => navigate('/admin/manage-users')}
                >
                  <i className="fas fa-arrow-left"></i>
                </button>
                <div>
                  <h4 className="mb-0">
                    <i className="fas fa-user-plus me-2"></i>
                    Register New Teacher
                  </h4>
                  <small className="opacity-75">Add a new teacher to the platform</small>
                </div>
              </div>
            </div>
            
            <div className="card-body p-4">
              {message && (
                <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-danger'} d-flex align-items-center`}>
                  <i className={`fas ${messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
                  {message}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-medium">
                    <i className="fas fa-user me-2 text-muted"></i>
                    Full Name
                  </label>
                  <input 
                    type="text" 
                    className="form-control form-control-lg"
                    placeholder="Enter teacher's full name" 
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    required 
                  />
                </div>
                
                <div className="mb-4">
                  <label className="form-label fw-medium">
                    <i className="fas fa-envelope me-2 text-muted"></i>
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    className="form-control form-control-lg"
                    placeholder="Enter teacher's email address" 
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required 
                  />
                  <div className="form-text">
                    <i className="fas fa-info-circle me-1"></i>
                    This will be used for teacher login
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="form-label fw-medium">
                    <i className="fas fa-lock me-2 text-muted"></i>
                    Password
                  </label>
                  <input 
                    type="password" 
                    className="form-control form-control-lg"
                    placeholder="Create a secure password" 
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required 
                    minLength="6"
                  />
                  <div className="form-text">
                    <i className="fas fa-shield-alt me-1"></i>
                    Password must be at least 6 characters long
                  </div>
                </div>
                
                <div className="d-grid gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-success btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Registering Teacher...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus me-2"></i>
                        Register Teacher
                      </>
                    )}
                  </button>
                  
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/admin/manage-users')}
                  >
                    <i className="fas fa-times me-2"></i>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Info Card */}
          <div className="card border-0 shadow-sm mt-4">
            <div className="card-body">
              <h6 className="fw-bold mb-3">
                <i className="fas fa-lightbulb me-2 text-warning"></i>
                Teacher Account Information
              </h6>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-start">
                    <i className="fas fa-check text-success me-2 mt-1"></i>
                    <div>
                      <div className="fw-medium">Course Creation</div>
                      <small className="text-muted">Can create and manage courses</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-start">
                    <i className="fas fa-check text-success me-2 mt-1"></i>
                    <div>
                      <div className="fw-medium">Student Interaction</div>
                      <small className="text-muted">Can chat with enrolled students</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-start">
                    <i className="fas fa-check text-success me-2 mt-1"></i>
                    <div>
                      <div className="fw-medium">Skill Management</div>
                      <small className="text-muted">Can add and manage skills</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-start">
                    <i className="fas fa-check text-success me-2 mt-1"></i>
                    <div>
                      <div className="fw-medium">Earnings Tracking</div>
                      <small className="text-muted">Can view earnings and balance</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}