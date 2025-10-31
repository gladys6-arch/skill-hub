import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API = "http://127.0.0.1:5000/api";

export default function TeacherDashboard() {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await axios.get(`${API}/payment/teacher-earnings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEarnings(res.data);
      } catch (err) {
        console.error("Error fetching earnings:", err);
        setError("Failed to load earnings data.");
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  if (loading) return <p>Loading earnings...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="container mt-4">
      <h2>Teacher Dashboard</h2>

      {/* Navigation Links */}
      <div className="mb-4">
        <Link to="/teacher/add-skill" className="btn btn-outline-primary me-2">
          Add Skill
        </Link>
        <Link to="/teacher/modules" className="btn btn-outline-secondary">
          Manage Modules
        </Link>
      </div>

      {/* Earnings Summary */}
      <div className="card shadow p-4 mt-3">
        <h4>Earnings Summary</h4>
        {earnings ? (
          <>
            <p>
              <strong>Teacher:</strong> {earnings.teacher}
            </p>
            <p>
              <strong>Total Earned:</strong> KES {earnings.total_earned.toFixed(2)}
            </p>
            <p>
              <strong>Unpaid Balance:</strong> KES {earnings.unpaid_balance.toFixed(2)}
            </p>

            <h5 className="mt-4">Payment History</h5>
            {earnings.payments.length === 0 ? (
              <p>No payments yet.</p>
            ) : (
              <table className="table table-striped mt-2">
                <thead>
                  <tr>
                    <th>Course ID</th>
                    <th>Amount</th>
                    <th>Teacher Share</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.payments.map((p, index) => (
                    <tr key={index}>
                      <td>{p.course_id}</td>
                      <td>KES {p.amount.toFixed(2)}</td>
                      <td>KES {p.teacher_share.toFixed(2)}</td>
                      <td>{p.paid ? "Paid" : "Unpaid"}</td>
                      <td>{p.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        ) : (
          <p>No earnings available.</p>
        )}
      </div>
    </div>
  );
}
