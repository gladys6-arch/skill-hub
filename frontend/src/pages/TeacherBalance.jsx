import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTeacherBalance } from '../services/teacherService';

export default function TeacherBalance() {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await getTeacherBalance();
        setBalance(response.data);
      } catch (err) {
        console.error('Error fetching balance:', err);
        setError('Failed to load balance data.');
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  if (loading) return <div className="container" style={{ marginTop: '150px' }}>Loading...</div>;
  if (error) return <div className="container text-danger" style={{ marginTop: '150px' }}>{error}</div>;

  return (
    <div className="container" style={{ marginTop: '150px' }}>
      <Link to="/teacher" className="back-button">Back to Dashboard</Link>
      <h3>My Balance</h3>

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Total Balance</h5>
              <h3 className="text-success">${balance.total_balance.toFixed(2)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Total Courses</h5>
              <h3 className="text-primary">{balance.total_courses}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Total Skills</h5>
              <h3 className="text-info">{balance.total_skills}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5>Payment History</h5>
        </div>
        <div className="card-body">
          {balance.payment_history.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Type</th>
                    <th>Student</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {balance.payment_history.map((payment, index) => (
                    <tr key={index}>
                      <td>{payment.item_name}</td>
                      <td>
                        <span className={`badge ${payment.item_type === 'course' ? 'bg-primary' : 'bg-success'}`}>
                          {payment.item_type}
                        </span>
                      </td>
                      <td>{payment.student_name}</td>
                      <td className="text-success">${payment.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-info">No payment history available.</div>
          )}
        </div>
      </div>
    </div>
  );
}
