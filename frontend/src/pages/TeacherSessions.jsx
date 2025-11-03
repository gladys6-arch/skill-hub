import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStudySessions, getTeacherRequests } from '../services/teacherService';

export default function TeacherSessions() {
  const [sessions, setSessions] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoSessions, setVideoSessions] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionsRes, requestsRes] = await Promise.all([
          getStudySessions(),
          getTeacherRequests()
        ]);
        
        setSessions(sessionsRes.data);
        setPendingRequests(requestsRes.data.filter(r => 
          r.status === 'pending' && r.message.startsWith('Study Session Request:')
        ));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const startVideoSession = (sessionId) => {
    setVideoSessions(prev => ({
      ...prev,
      [sessionId]: { active: true, url: `https://meet.jit.si/skillhub-session-${sessionId}` }
    }));
  };

  const endVideoSession = (sessionId) => {
    setVideoSessions(prev => ({
      ...prev,
      [sessionId]: { active: false, url: null }
    }));
  };

  if (loading) {
    return (
      <div className="container" style={{ marginTop: '150px' }}>
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '150px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Study Sessions</h3>
        <Link to="/teacher" className="btn btn-secondary">Back to Dashboard</Link>
      </div>

      {/* Pending Session Requests */}
      {pendingRequests.length > 0 && (
        <div className="mb-5">
          <h5 className="text-warning">
            <i className="fas fa-clock me-2"></i>
            Pending Session Requests ({pendingRequests.length})
          </h5>
          <div className="alert alert-warning">
            <i className="fas fa-info-circle me-2"></i>
            Accept these requests to create study sessions with students.
          </div>
          <div className="row">
            {pendingRequests.map(request => (
              <div key={request.id} className="col-md-6 mb-3">
                <div className="card border-warning">
                  <div className="card-header bg-warning text-dark">
                    <strong>{request.student_name}</strong>
                    <span className="badge bg-primary ms-2">New Request</span>
                  </div>
                  <div className="card-body">
                    <h6>{request.message.split('\n')[0].replace('Study Session Request: ', '')}</h6>
                    <p className="text-muted small mb-2">
                      {request.message.split('\n').slice(2).join('\n')}
                    </p>
                    <small className="text-muted">Requested: {request.date_created}</small>
                  </div>
                  <div className="card-footer">
                    <Link 
                      to="/teacher/requests" 
                      className="btn btn-primary btn-sm"
                    >
                      View & Respond
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Sessions */}
      <div>
        <h5 className="text-success">
          <i className="fas fa-comments me-2"></i>
          Active Sessions ({sessions.length})
        </h5>
        
        {sessions.length > 0 ? (
          <div className="row">
            {sessions.map(session => (
              <div key={session.id} className="col-md-6 mb-4">
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{session.student_name}</strong>
                      <span className={`badge bg-${session.status === 'active' ? 'success' : 'secondary'} ms-2`}>
                        {session.status}
                      </span>
                    </div>
                    {videoSessions[session.id]?.active && (
                      <span className="badge bg-danger">
                        <i className="fas fa-video me-1"></i>
                        Live
                      </span>
                    )}
                  </div>
                  <div className="card-body">
                    <h6 className="card-title">{session.subject}</h6>
                    <p className="text-muted small">Started: {session.created_at}</p>
                    
                    {/* Video Section */}
                    {videoSessions[session.id]?.active && (
                      <div className="mb-3">
                        <div className="alert alert-success">
                          <i className="fas fa-video me-2"></i>
                          Video session is active. Student can see the video and chat.
                        </div>
                        <iframe
                          src={videoSessions[session.id].url}
                          width="100%"
                          height="200"
                          frameBorder="0"
                          allow="camera; microphone; fullscreen; display-capture"
                          className="rounded"
                        ></iframe>
                      </div>
                    )}
                  </div>
                  <div className="card-footer">
                    <div className="d-flex gap-2">
                      <Link 
                        to={`/teacher/chat/${session.id}`} 
                        className="btn btn-primary btn-sm"
                      >
                        <i className="fas fa-comments me-1"></i>
                        Open Chat
                      </Link>
                      
                      {!videoSessions[session.id]?.active ? (
                        <button
                          onClick={() => startVideoSession(session.id)}
                          className="btn btn-success btn-sm"
                        >
                          <i className="fas fa-video me-1"></i>
                          Start Video
                        </button>
                      ) : (
                        <button
                          onClick={() => endVideoSession(session.id)}
                          className="btn btn-danger btn-sm"
                        >
                          <i className="fas fa-video-slash me-1"></i>
                          End Video
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="alert alert-info">
            <i className="fas fa-info-circle me-2"></i>
            No active study sessions yet. Sessions will appear here when you accept student requests.
          </div>
        )}
      </div>

      {/* Help Section */}
      {sessions.length === 0 && pendingRequests.length === 0 && (
        <div className="mt-4">
          <div className="card border-info">
            <div className="card-header bg-info text-white">
              <i className="fas fa-question-circle me-2"></i>
              How Study Sessions Work
            </div>
            <div className="card-body">
              <ol>
                <li>Students send study session requests from their dashboard</li>
                <li>You receive these requests in your <Link to="/teacher/requests">Student Requests</Link> page</li>
                <li>When you accept a request, a study session is created</li>
                <li>You can start video sessions and chat with students here</li>
                <li>Students can see the video and participate in chat</li>
              </ol>
              <div className="mt-3">
                <Link to="/teacher/requests" className="btn btn-primary me-2">
                  <i className="fas fa-inbox me-1"></i>
                  Check Requests
                </Link>
                <Link to="/teacher" className="btn btn-outline-secondary">
                  <i className="fas fa-home me-1"></i>
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}