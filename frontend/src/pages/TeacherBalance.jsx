import React, { useEffect, useState } from 'react';
import { getTeacherBalance } from '../services/teacherService';

export default function TeacherBalance() {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await getTeacherBalance(); // uses axios with token inside service
        setBalance(res.data); // axios returns data under res.data
      } catch (err) {
        console.error('Error fetching balance:', err);
        setError('Failed to load balance.');
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  if (loading) return <div className="container mt-4"><h3>Loading...</h3></div>;
  if (error) return <div className="container mt-4 text-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h3>My Earnings</h3>
      
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <h2 className="text-success">${balance?.total_balance || 0}</h2>
              <p>Total Earnings (70% share)</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <h4>{balance?.total_courses || 0}</h4>
              <p>Courses Created</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <h4>{balance?.total_skills || 0}</h4>
              <p>Skills Created</p>
            </div>
          </div>
        </div>
      </div>
      
      <h5>Payment History</h5>
      {balance?.payment_history?.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Item</th>
                <th>Type</th>
                <th>Student</th>
                <th>Earnings</th>
              </tr>
            </thead>
            <tbody>
              {balance.payment_history.map((payment, index) => (
                <tr key={index}>
                  <td>{payment.item_name}</td>
                  <td>
                    <span className={`badge bg-${payment.item_type === 'course' ? 'primary' : 'info'}`}>
                      {payment.item_type}
                    </span>
                  </td>
                  <td>{payment.student_name}</td>
                  <td className="text-success">${payment.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="alert alert-info">No earnings yet. Create courses and skills to start earning!</div>
      )}
    </div>
  );
}
