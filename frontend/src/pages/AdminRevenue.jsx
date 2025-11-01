import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminRevenue } from '../services/adminService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function AdminRevenue() {
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data for revenue distribution bar chart
  const revenueData = revenue ? [
    { name: 'Revenue Split', admin: revenue.total_revenue * 0.3, teachers: revenue.total_revenue * 0.7 }
  ] : [];

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const response = await getAdminRevenue();
        setRevenue(response.data);
      } catch (err) {
        console.error('Error fetching revenue:', err);
        setError('Failed to load revenue data.');
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, []);

  if (loading) return <div className="container mt-4">Loading revenue data...</div>;
  if (error) return <div className="container mt-4 text-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <Link to="/admin" className="back-button">Back to Dashboard</Link>
      <h3>Platform Revenue</h3>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Revenue Distribution</h5>
            </div>
            <div className="card-body d-flex justify-content-center">
              <BarChart width={400} height={300} data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="admin" fill="#0088FE" name="Admin Share (30%)" />
                <Bar dataKey="teachers" fill="#00C49F" name="Teacher Share (70%)" />
              </BarChart>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="row">
            <div className="col-12 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Total Revenue</h5>
                  <h3 className="text-primary">${revenue.total_revenue.toFixed(2)}</h3>
                  <small className="text-muted">100% of all payments</small>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Admin (30%)</h5>
                  <h4 className="text-success">${(revenue.total_revenue * 0.3).toFixed(2)}</h4>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Teachers (70%)</h5>
                  <h4 className="text-info">${(revenue.total_revenue * 0.7).toFixed(2)}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5>Teacher Revenue Breakdown</h5>
        </div>
        <div className="card-body">
          {revenue.teacher_revenues.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Teacher Name</th>
                    <th>Email</th>
                    <th>Total Revenue</th>
                    <th>Courses</th>
                    <th>Skills</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {revenue.teacher_revenues.map((teacher, index) => (
                    <tr key={index}>
                      <td>{teacher.full_name}</td>
                      <td>{teacher.email}</td>
                      <td className="text-success">${teacher.total_revenue.toFixed(2)}</td>
                      <td>{teacher.courses_count}</td>
                      <td>{teacher.skills_count}</td>
                      <td>
                        <Link to={`/admin/teachers/${teacher.id}/details`} className="btn btn-sm btn-primary">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-info">No revenue data available.</div>
          )}
        </div>
      </div>
    </div>
  );
}