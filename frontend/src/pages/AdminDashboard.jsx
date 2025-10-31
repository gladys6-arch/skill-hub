import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API = "http://127.0.0.1:5000/api"; // adjust to match your backend URL

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/payment/admin-summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSummary(res.data);
      } catch (err) {
        console.error("Error fetching admin summary:", err);
        setError("Could not load admin data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) return <p>Loading admin dashboard...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Admin Dashboard</h2>

      <div className="card shadow p-4 mb-4">
        <h4>Admin Balance</h4>
        <h2 className="text-success">
          KES {summary?.total_admin_share?.toLocaleString() || 0}
        </h2>
        <p className="text-muted">Total earnings from all completed student payments</p>
      </div>

      <div className="card shadow p-4 mb-4">
        <h4>Payment Summary</h4>
        <p><strong>Total Collected:</strong> KES {summary?.total_collected?.toLocaleString() || 0}</p>
        <p><strong>Total Teacher Share:</strong> KES {summary?.total_teacher_share?.toLocaleString() || 0}</p>
        <p><strong>Total Admin Share:</strong> KES {summary?.total_admin_share?.toLocaleString() || 0}</p>
        <p><strong>Number of Payments:</strong> {summary?.payments_count || 0}</p>
      </div>

      <div className="card shadow p-4">
        <h4>Manage</h4>
        <Link to="/admin/manage-users" className="btn btn-primary me-3">
          Manage Users
        </Link>
        <Link to="/admin/payments" className="btn btn-secondary">
          View Payments
        </Link>
      </div>
    </div>
  );
}
