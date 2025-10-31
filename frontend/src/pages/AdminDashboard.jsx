import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../services/adminService';

export default function AdminDashboard() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardStats();
        setStats(res.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="container mt-4">
      <h2>Admin Dashboard</h2>
      
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h5>Teachers: {stats.total_teachers || 0}</h5>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h5>Students: {stats.total_students || 0}</h5>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h5>Revenue: ${stats.admin_earnings || 0}</h5>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Link to="/admin/manage-users" className="btn btn-primary me-2">Manage Users</Link>
        <Link to="/admin/register-teacher" className="btn btn-success">Register Teacher</Link>
      </div>
    </div>
  );
}
