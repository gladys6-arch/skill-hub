import React, { useEffect, useState } from 'react';

export default function TeacherBalance() {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://127.0.0.1:5000/api/teacher/balance', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setBalance(data);
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
      setLoading(false);
    };
    fetchBalance();
  }, []);

  if (loading) return <div className="container mt-4"><h3>Loading...</h3></div>;

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