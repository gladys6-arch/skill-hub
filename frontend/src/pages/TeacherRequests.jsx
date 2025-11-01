import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTeacherRequests, updateRequestStatus } from '../services/teacherService';

export default function TeacherRequests() {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await getTeacherRequests();
        setRequests(res.data);
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
    };
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (requestId, status) => {
    try {
      await updateRequestStatus(requestId, status);
      setRequests(requests.map(r => 
        r.id === requestId ? {...r, status} : r
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const acceptAndCreateSession = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/teacher/requests/${requestId}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok) {
        navigate(`/teacher/chat/${data.session_id}`);
      } else {
        alert('Error creating session');
      }
    } catch (error) {
      alert('Error creating session');
    }
  };

  return (
    <div className="container mt-4">
      <h3>Student Requests</h3>
      {requests.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Student</th>
                <th>Message</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(request => (
                <tr key={request.id}>
                  <td>{request.student_name}</td>
                  <td>{request.message}</td>
                  <td>{request.date_created}</td>
                  <td>
                    <span className={`badge bg-${request.status === 'accepted' ? 'success' : request.status === 'rejected' ? 'danger' : 'warning'}`}>
                      {request.status}
                    </span>
                  </td>
                  <td>
                    {request.status === 'pending' && (
                      <>
                        <button 
                          className="btn btn-success btn-sm me-2"
                          onClick={() => acceptAndCreateSession(request.id)}
                        >
                          Accept & Start Session
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleStatusUpdate(request.id, 'rejected')}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="alert alert-info">No student requests yet</div>
      )}
    </div>
  );
}