import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_BASE_URL } from '../api';

export default function Chat() {
  const { sessionId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [studentProgress, setStudentProgress] = useState([]);
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    fetchSessionData();
    fetchMessages();
  }, [sessionId]);

  useEffect(() => {
    if (sessionData?.student_id) {
      fetchStudentProgress();
    }
  }, [sessionData]);

  const fetchSessionData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/teacher/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sessions = await response.json();
      const currentSession = sessions.find(s => s.id === parseInt(sessionId));
      setSessionData(currentSession);
    } catch (error) {
      console.error('Error fetching session data:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/teacher/chat/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchStudentProgress = async () => {
    if (!sessionData?.student_id) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/teacher/student/${sessionData.student_id}/progress`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setStudentProgress(data);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/api/teacher/chat/${sessionId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: newMessage })
      });
      
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="container-fluid mt-4">
      <Link to="/teacher/sessions" className="back-button">Back to Sessions</Link>
      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5>Study Session Chat</h5>
            </div>
            <div className="card-body" style={{height: '400px', overflowY: 'scroll'}}>
              {messages.map(msg => (
                <div key={msg.id} className="mb-2">
                  <strong>{msg.sender_name}:</strong> {msg.message}
                  <small className="text-muted ms-2">{msg.timestamp}</small>
                </div>
              ))}
            </div>
            <div className="card-footer">
              <div className="mb-2">
                <button
                  className="btn btn-success me-2"
                  onClick={() => window.open('https://meet.google.com/new', '_blank')}
                >
                  📹 Start Video Call (Google Meet)
                </button>
              </div>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button className="btn btn-primary" onClick={sendMessage}>
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h6>Student Progress</h6>
            </div>
            <div className="card-body">
              {studentProgress.map((item, index) => (
                <div key={index} className="mb-2">
                  <div className="d-flex justify-content-between">
                    <small><strong>{item.title}</strong></small>
                    {item.completed && <span className="badge bg-success">✓</span>}
                  </div>
                  <div className="progress mb-1">
                    <div 
                      className="progress-bar" 
                      style={{width: `${item.progress}%`}}
                    >
                      {item.progress}%
                    </div>
                  </div>
                  <small className="text-muted">{item.type}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}