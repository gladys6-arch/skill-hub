import React, { useEffect, useState } from 'react';
import { getMyRequests } from '../services/studentService';

export default function StudentRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await getMyRequests();
      setRequests(res.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mt-4">Loading your requests...</div>;
  }

  return (
    <div className="container mt-4">
      <h3>My Teacher Requests</h3>
      {requests.length > 0 ? (
        <div className="row">
          {requests.map(request => (
            <div key={request.id} className="col-md-6 mb-3">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Request to {request.teacher_name}</h6>
                  <span className={`badge bg-${request.status === 'accepted' ? 'success' : request.status === 'rejected' ? 'danger' : 'warning'}`}>
                    {request.status}
                  </span>
                </div>
                <div className="card-body">
                  <p><strong>Your Message:</strong></p>
                  <p className="text-muted">{request.message}</p>
                  
                  {request.response_message && (
                    <>
                      <p><strong>Teacher's Response:</strong></p>
                      <div className={`alert alert-${request.status === 'accepted' ? 'success' : 'danger'}`}>
                        {request.response_message}
                      </div>
                    </>
                  )}
                  
                  <small className="text-muted">
                    Sent: {request.date_created}
                    {request.date_responded && ` | Responded: ${request.date_responded}`}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info">
          You haven't sent any teacher requests yet.
        </div>
      )}
    </div>
  );
}