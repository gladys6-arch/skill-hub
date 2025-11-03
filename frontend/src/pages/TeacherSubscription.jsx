import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTeacherSubscription } from "../services/teacherService";

export default function TeacherSubscription() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await getTeacherSubscription();
        setSubscription(response.data);
      } catch (err) {
        console.error("Error fetching subscription:", err);
        setError("Failed to load subscription details.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  if (loading) return <div className="container" style={{ marginTop: '150px' }}>Loading subscription details...</div>;
  if (error) return <div className="container text-danger" style={{ marginTop: '150px' }}>{error}</div>;

  return (
    <div className="container" style={{ marginTop: '150px' }}>
      <Link to="/teacher" className="back-button">Back to Dashboard</Link>
      <h3>Subscription Details</h3>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Plan: {subscription.plan_type}</h5>
          <p className="card-text">
            <strong>Status:</strong>{" "}
            <span
              className={`badge ${
                subscription.status === "active"
                  ? "bg-success"
                  : subscription.status === "inactive"
                  ? "bg-warning"
                  : "bg-danger"
              }`}
            >
              {subscription.status}
            </span>
          </p>
          <p className="card-text">
            <strong>Renewal Date:</strong> {subscription.renewal_date || "N/A"}
          </p>
          <p className="card-text">
            <strong>Created At:</strong> {subscription.created_at || "N/A"}
          </p>
          {subscription.message && (
            <div className="alert alert-info mt-3">
              {subscription.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}