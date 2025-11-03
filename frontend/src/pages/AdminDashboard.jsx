import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, getAllStudentProgress } from '../services/adminService';

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [studentProgress, setStudentProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, progressRes] = await Promise.all([
          getDashboardStats(),
          getAllStudentProgress()
        ]);
        setStats(statsRes.data);
        setStudentProgress(progressRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="container section" style={{ marginTop: '150px', textAlign: 'center' }}>
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading dashboard...</span>
          </div>
        </div>
        <p className="lux-accent mt-2">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container section" style={{ marginTop: '150px' }}>
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h1 className="lux-accent mb-1">Admin Dashboard</h1>
              <p className="text-muted mb-0">Welcome back! Here's what's happening with your platform.</p>
            </div>
            <div className="d-flex gap-2">
              <Link to="/admin/manage-users" className="site-button">
                <i className="fas fa-users me-2"></i>
                Manage Users
              </Link>
              <Link to="/admin/register-teacher" className="site-button">
                <i className="fas fa-user-plus me-2"></i>
                Register Teacher
              </Link>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="row mb-5">
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div style={{ background: 'linear-gradient(135deg, #C7A76E, #A8895A)', borderRadius: '12px', padding: '15px' }}>
                        <i className="fas fa-chalkboard-teacher fa-2x" style={{ color: '#000' }}></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <div className="small text-muted">Total Teachers</div>
                      <div className="h3 mb-0 fw-bold lux-accent">{stats.total_teachers || 0}</div>
                      <div className="small" style={{ color: '#C7A76E' }}>
                        <i className="fas fa-arrow-up me-1"></i>
                        Active educators
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div style={{ background: 'linear-gradient(135deg, #C7A76E, #A8895A)', borderRadius: '12px', padding: '15px' }}>
                        <i className="fas fa-user-graduate fa-2x" style={{ color: '#000' }}></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <div className="small text-muted">Total Students</div>
                      <div className="h3 mb-0 fw-bold lux-accent">{stats.total_students || 0}</div>
                      <div className="small" style={{ color: '#C7A76E' }}>
                        <i className="fas fa-users me-1"></i>
                        Enrolled learners
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div style={{ background: 'linear-gradient(135deg, #C7A76E, #A8895A)', borderRadius: '12px', padding: '15px' }}>
                        <i className="fas fa-dollar-sign fa-2x" style={{ color: '#000' }}></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <div className="small text-muted">Platform Revenue</div>
                      <div className="h3 mb-0 fw-bold lux-accent">${stats.admin_earnings || 0}</div>
                      <div className="small" style={{ color: '#C7A76E' }}>
                        <i className="fas fa-chart-line me-1"></i>
                        Total earnings
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0 fw-bold lux-accent">
                    <i className="fas fa-bolt me-2"></i>
                    Quick Actions
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-lg-3 col-md-6 mb-3">
                      <Link to="/admin/manage-users" className="text-decoration-none">
                        <div className="card h-100" style={{ borderColor: 'rgba(199,167,110,0.3)', background: 'rgba(199,167,110,0.05)' }}>
                          <div className="card-body text-center">
                            <i className="fas fa-users fa-2x mb-2" style={{ color: '#C7A76E' }}></i>
                            <h6 style={{ color: '#C7A76E' }} className="mb-1">Manage Users</h6>
                            <small className="text-muted">View and manage all users</small>
                          </div>
                        </div>
                      </Link>
                    </div>

                    <div className="col-lg-3 col-md-6 mb-3">
                      <Link to="/admin/register-teacher" className="text-decoration-none">
                        <div className="card h-100" style={{ borderColor: 'rgba(199,167,110,0.3)', background: 'rgba(199,167,110,0.05)' }}>
                          <div className="card-body text-center">
                            <i className="fas fa-user-plus fa-2x mb-2" style={{ color: '#C7A76E' }}></i>
                            <h6 style={{ color: '#C7A76E' }} className="mb-1">Add Teacher</h6>
                            <small className="text-muted">Register new teacher</small>
                          </div>
                        </div>
                      </Link>
                    </div>

                    <div className="col-lg-3 col-md-6 mb-3">
                      <Link to="/admin/student-progress" className="text-decoration-none">
                        <div className="card h-100" style={{ borderColor: 'rgba(199,167,110,0.3)', background: 'rgba(199,167,110,0.05)' }}>
                          <div className="card-body text-center">
                            <i className="fas fa-chart-line fa-2x mb-2" style={{ color: '#C7A76E' }}></i>
                            <h6 style={{ color: '#C7A76E' }} className="mb-1">Student Progress</h6>
                            <small className="text-muted">Track student learning</small>
                          </div>
                        </div>
                      </Link>
                    </div>

                    <div className="col-lg-3 col-md-6 mb-3">
                      <div className="card h-100" style={{ borderColor: 'rgba(199,167,110,0.3)', background: 'rgba(199,167,110,0.05)' }}>
                        <div className="card-body text-center">
                          <i className="fas fa-cog fa-2x mb-2" style={{ color: '#C7A76E' }}></i>
                          <h6 style={{ color: '#C7A76E' }} className="mb-1">Settings</h6>
                        <small className="text-muted">Platform configuration</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* Recent Activity */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0 fw-bold lux-accent">
                    <i className="fas fa-clock me-2"></i>
                    Recent Activity
                  </h5>
                </div>
                <div className="card-body">
                  <div className="d-flex align-items-center py-3" style={{ borderBottom: '1px solid rgba(199,167,110,0.2)' }}>
                    <div className="flex-shrink-0">
                      <div style={{ background: 'linear-gradient(135deg, #C7A76E, #A8895A)', borderRadius: '50%', padding: '10px' }}>
                        <i className="fas fa-user-plus" style={{ color: '#000' }}></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <div className="fw-medium" style={{ color: '#C7A76E' }}>New teacher registered</div>
                      <small className="text-muted">A new teacher joined the platform</small>
                    </div>
                    <small className="text-muted">2 hours ago</small>
                  </div>

                  <div className="d-flex align-items-center py-3" style={{ borderBottom: '1px solid rgba(199,167,110,0.2)' }}>
                    <div className="flex-shrink-0">
                      <div style={{ background: 'linear-gradient(135deg, #C7A76E, #A8895A)', borderRadius: '50%', padding: '10px' }}>
                        <i className="fas fa-book" style={{ color: '#000' }}></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <div className="fw-medium" style={{ color: '#C7A76E' }}>New course created</div>
                      <small className="text-muted">A teacher published a new course</small>
                    </div>
                    <small className="text-muted">5 hours ago</small>
                  </div>

                  <div className="d-flex align-items-center py-3">
                    <div className="flex-shrink-0">
                      <div style={{ background: 'linear-gradient(135deg, #C7A76E, #A8895A)', borderRadius: '50%', padding: '10px' }}>
                        <i className="fas fa-graduation-cap" style={{ color: '#000' }}></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <div className="fw-medium" style={{ color: '#C7A76E' }}>Student completed course</div>
                      <small className="text-muted">A student finished their learning journey</small>
                    </div>
                    <small className="text-muted">1 day ago</small>
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