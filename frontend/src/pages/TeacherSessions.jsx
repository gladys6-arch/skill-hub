import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStudySessions } from '../services/teacherService';

export default function TeacherSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await getStudySessions();
        setSessions(res.data);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const handleAccept = async (requestId) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:5000/api/teacher/requests/${requestId}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        // Navigate to chat session
        window.location.href = `/teacher/chat/${data.session_id}`;
      } else {
        alert('Error accepting request');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Error accepting request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async (requestId) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://127.0.0.1:5000/api/teacher/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'declined' })
      });
      fetchSessions(); // Refresh the list
    } catch (error) {
      console.error('Error declining request:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <Link to="/teacher" className="back-button">Back to Dashboard</Link>
      <h3>My Study Sessions</h3>
      {sessions.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Student</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(session => (
                <tr key={session.id}>
                  <td>{session.student_name}</td>
                  <td>{session.subject}</td>
                  <td>
                    <span className={`badge bg-${session.status === 'active' ? 'success' : 'secondary'}`}>
                      {session.status}
                    </span>
                  </td>
                  <td>{session.created_at}</td>
                  <td>
                    {session.status === 'pending' ? (
                      <div>
                        <button
                          onClick={() => handleAccept(session.id)}
                          className="btn btn-success btn-sm me-2"
                          disabled={actionLoading}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDecline(session.id)}
                          className="btn btn-danger btn-sm"
                          disabled={actionLoading}
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      <Link to={`/teacher/chat/${session.id}`} className="btn btn-primary btn-sm">
                        Open Chat
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="alert alert-info">No study sessions yet. Sessions will appear here when students request and you accept them.</div>
      )}
    </div>
  );
}