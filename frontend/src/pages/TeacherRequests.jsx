import React, { useEffect, useState } from 'react';
import { getTeacherRequests } from '../services/teacherService';

export default function TeacherRequests() {
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [responseType, setResponseType] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await getTeacherRequests();
      setRequests(res.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleRespond = (request, type) => {
    setSelectedRequest(request);
    setResponseType(type);
    setResponseMessage('');
    setShowModal(true);
  };

  const submitResponse = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://127.0.0.1:5000/api/teacher/requests/${selectedRequest.id}/respond`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: responseType,
          message: responseMessage
        })
      });
      
      setShowModal(false);
      fetchRequests();
    } catch (error) {
      console.error('Error responding to request:', error);
    }
  };

  const isStudySessionRequest = (message) => {
    return message.startsWith('Study Session Request:');
  };

  const getRequestType = (message) => {
    return isStudySessionRequest(message) ? 'Study Session' : 'General Request';
  };

  const getRequestSubject = (message) => {
    if (isStudySessionRequest(message)) {
      const lines = message.split('\n');
      return lines[0].replace('Study Session Request: ', '');
    }
    return message.substring(0, 50) + (message.length > 50 ? '...' : '');
  };

  return (
    <div className="container" style={{ marginTop: '150px' }}>
      <h3>Student Requests</h3>
      {requests.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Student</th>
                <th>Type</th>
                <th>Subject/Message</th>
                <th>Date</th>
                <th>Status</th>
                <th>Response</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(request => (
                <tr key={request.id}>
                  <td>{request.student_name}</td>
                  <td>
                    <span className={`badge ${isStudySessionRequest(request.message) ? 'bg-primary' : 'bg-secondary'}`}>
                      {getRequestType(request.message)}
                    </span>
                  </td>
                  <td>
                    <div>
                      <strong>{getRequestSubject(request.message)}</strong>
                      {isStudySessionRequest(request.message) && (
                        <div className="text-muted small mt-1">
                          {request.message.split('\n').slice(2).join('\n')}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{request.date_created}</td>
                  <td>
                    <span className={`badge bg-${request.status === 'accepted' ? 'success' : request.status === 'rejected' ? 'danger' : 'warning'}`}>
                      {request.status}
                    </span>
                  </td>
                  <td>
                    {request.response_message ? (
                      <small className="text-muted">{request.response_message}</small>
                    ) : (
                      <small className="text-muted">No response yet</small>
                    )}
                  </td>
                  <td>
                    {request.status === 'pending' && (
                      <>
                        <button 
                          className="btn btn-success btn-sm me-2"
                          onClick={() => handleRespond(request, 'accepted')}
                        >
                          Accept
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRespond(request, 'rejected')}
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

      {/* Response Modal */}
      {showModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {responseType === 'accepted' ? 'Accept' : 'Reject'} Request
                </h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <p><strong>Student:</strong> {selectedRequest?.student_name}</p>
                <p><strong>Type:</strong> {getRequestType(selectedRequest?.message || '')}</p>
                <p><strong>Request:</strong> {selectedRequest?.message}</p>
                <div className="mb-3">
                  <label className="form-label">Your Response Message:</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    placeholder={responseType === 'accepted' ? 
                      (isStudySessionRequest(selectedRequest?.message || '') ? 
                        'Let the student know you\'ve accepted their study session request and provide session details...' :
                        'Let the student know you\'ve accepted their request...') : 
                      'Explain why you cannot accept this request...'}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button 
                  className={`btn btn-${responseType === 'accepted' ? 'success' : 'danger'}`}
                  onClick={submitResponse}
                >
                  {responseType === 'accepted' ? 'Accept Request' : 'Reject Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}