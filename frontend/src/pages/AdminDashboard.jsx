import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../services/adminService';

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardStats();
        setStats(res.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h1 className="mb-1">Admin Dashboard</h1>
              <p className="text-muted mb-0">Welcome back! Here's what's happening with your platform.</p>
            </div>
            <div className="d-flex gap-2">
              <Link to="/admin/manage-users" className="btn btn-primary">
                <i className="fas fa-users me-2"></i>
                Manage Users
              </Link>
              <Link to="/admin/register-teacher" className="btn btn-success">
                <i className="fas fa-user-plus me-2"></i>
                Register Teacher
              </Link>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="row mb-5">
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-primary bg-gradient rounded-3 p-3">
                        <i className="fas fa-chalkboard-teacher fa-2x text-white"></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <div className="small text-muted">Total Teachers</div>
                      <div className="h3 mb-0 fw-bold">{stats.total_teachers || 0}</div>
                      <div className="small text-success">
                        <i className="fas fa-arrow-up me-1"></i>
                        Active educators
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-info bg-gradient rounded-3 p-3">
                        <i className="fas fa-user-graduate fa-2x text-white"></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <div className="small text-muted">Total Students</div>
                      <div className="h3 mb-0 fw-bold">{stats.total_students || 0}</div>
                      <div className="small text-info">
                        <i className="fas fa-users me-1"></i>
                        Enrolled learners
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-success bg-gradient rounded-3 p-3">
                        <i className="fas fa-dollar-sign fa-2x text-white"></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <div className="small text-muted">Platform Revenue</div>
                      <div className="h3 mb-0 fw-bold">${stats.admin_earnings || 0}</div>
                      <div className="small text-success">
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
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom">
                  <h5 className="mb-0 fw-bold">
                    <i className="fas fa-bolt me-2 text-warning"></i>
                    Quick Actions
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-lg-3 col-md-6 mb-3">
                      <Link to="/admin/manage-users" className="text-decoration-none">
                        <div className="card border border-primary bg-primary bg-opacity-10 h-100">
                          <div className="card-body text-center">
                            <i className="fas fa-users fa-2x text-primary mb-2"></i>
                            <h6 className="text-primary mb-1">Manage Users</h6>
                            <small className="text-muted">View and manage all users</small>
                          </div>
                        </div>
                      </Link>
                    </div>
                    
                    <div className="col-lg-3 col-md-6 mb-3">
                      <Link to="/admin/register-teacher" className="text-decoration-none">
                        <div className="card border border-success bg-success bg-opacity-10 h-100">
                          <div className="card-body text-center">
                            <i className="fas fa-user-plus fa-2x text-success mb-2"></i>
                            <h6 className="text-success mb-1">Add Teacher</h6>
                            <small className="text-muted">Register new teacher</small>
                          </div>
                        </div>
                      </Link>
                    </div>
                    
                    <div className="col-lg-3 col-md-6 mb-3">
                      <div className="card border border-info bg-info bg-opacity-10 h-100">
                        <div className="card-body text-center">
                          <i className="fas fa-chart-bar fa-2x text-info mb-2"></i>
                          <h6 className="text-info mb-1">Analytics</h6>
                          <small className="text-muted">View platform analytics</small>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-lg-3 col-md-6 mb-3">
                      <div className="card border border-warning bg-warning bg-opacity-10 h-100">
                        <div className="card-body text-center">
                          <i className="fas fa-cog fa-2x text-warning mb-2"></i>
                          <h6 className="text-warning mb-1">Settings</h6>
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
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom">
                  <h5 className="mb-0 fw-bold">
                    <i className="fas fa-clock me-2 text-primary"></i>
                    Recent Activity
                  </h5>
                </div>
                <div className="card-body">
                  <div className="d-flex align-items-center py-3 border-bottom">
                    <div className="flex-shrink-0">
                      <div className="bg-success rounded-circle p-2">
                        <i className="fas fa-user-plus text-white"></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <div className="fw-medium">New teacher registered</div>
                      <small className="text-muted">A new teacher joined the platform</small>
                    </div>
                    <small className="text-muted">2 hours ago</small>
                  </div>
                  
                  <div className="d-flex align-items-center py-3 border-bottom">
                    <div className="flex-shrink-0">
                      <div className="bg-info rounded-circle p-2">
                        <i className="fas fa-book text-white"></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <div className="fw-medium">New course created</div>
                      <small className="text-muted">A teacher published a new course</small>
                    </div>
                    <small className="text-muted">5 hours ago</small>
                  </div>
                  
                  <div className="d-flex align-items-center py-3">
                    <div className="flex-shrink-0">
                      <div className="bg-primary rounded-circle p-2">
                        <i className="fas fa-graduation-cap text-white"></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <div className="fw-medium">Student completed course</div>
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