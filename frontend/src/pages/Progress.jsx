import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProgressBar = ({ progress }) => {
  const getColor = (progress) => {
    if (progress === 0) return '#e0e0e0';
    if (progress < 50) return '#ff9800';
    if (progress < 100) return '#2196f3';
    return '#4caf50';
  };

  return (
    <div style={{
      width: '100%',
      height: '24px',
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid #dee2e6',
      marginBottom: '8px',
      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        width: `${progress}%`,
        height: '100%',
        backgroundColor: getColor(progress),
        borderRadius: '12px',
        transition: 'width 0.4s ease',
        position: 'relative',
        background: `linear-gradient(90deg, ${getColor(progress)}, ${getColor(progress)}dd)`
      }} />
    </div>
  );
};

export default function Progress() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://127.0.0.1:5000/api/student/my-progress', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEnrollments(res.data);
      } catch (err) {
        console.error('Error fetching progress:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const updateProgress = async (id, newProgress) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://127.0.0.1:5000/api/student/update-my-progress', 
        { id, progress: newProgress },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setEnrollments(prev => prev.map(item => 
        item.id === id ? { 
          ...item, 
          progress: newProgress,
          completed: newProgress >= 100,
          status: newProgress >= 100 ? 'Completed - Certificate Available' : 
                  newProgress > 0 ? 'Continue Learning' : 'Start' 
        } : item
      ));
    } catch (err) {
      alert('Failed to update progress');
    }
  };

  const handleStartCourse = (item) => {
    if (item.type === 'course') {
      navigate(`/student/course/${item.id}/content`);
    } else if (item.type === 'skill') {
      alert('Skill content is not yet available. This feature is coming soon!');
    }
  };

  const downloadCertificate = async (item) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = item.type === 'course'
        ? `http://127.0.0.1:5000/api/student/certificate/${item.id}`
        : `http://127.0.0.1:5000/api/student/skill-certificate/${item.id.replace('skill_', '')}`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'text/html' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = `${item.title}_certificate.html`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err) {
      console.error('Error downloading certificate:', err);
      if (err.response?.status === 400) {
        alert('Certificate not available. Complete all modules and pass the final quiz first.');
      } else {
        alert('Error downloading certificate. Please try again.');
      }
    }
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
      <div className="row">
        <div className="col-12">
          <button 
            className="btn btn-outline-primary mb-3"
            onClick={() => navigate('/student/dashboard')}
          >
            <i className="fas fa-arrow-left me-1"></i>
            Back to Dashboard
          </button>
          <div className="d-flex align-items-center mb-4">
            <h2 className="mb-0 me-3">My Learning Progress</h2>
            <span className="badge bg-light text-dark fs-6">{enrollments.length} Courses</span>
          </div>
          
          {enrollments.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="fas fa-book-open fa-4x text-muted"></i>
              </div>
              <h4 className="text-muted">No enrollments yet</h4>
              <p className="text-muted">Start your learning journey today!</p>
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/student/courses')}
              >
                Browse Courses
              </button>
            </div>
          ) : (
            <div className="row">
              {enrollments.map((item) => (
                <div key={item.id} className="col-lg-6 col-xl-4 mb-4">
                  <div className="card h-100 shadow-sm border-0" style={{
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                  }}>
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="card-title mb-0 flex-grow-1">{item.title}</h5>
                        <span className={`badge ms-2 ${item.type === 'course' ? 'bg-primary' : 'bg-info'}`}>
                          {item.type}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <small className="text-muted fw-medium">Progress</small>
                          <small className="fw-bold">{item.progress}%</small>
                        </div>
                        <ProgressBar progress={item.progress} />
                      </div>
                      
                      <div className="mb-3">
                        <span className="badge bg-light text-dark border">
                          <i className={`fas ${item.completed ? 'fa-check-circle text-success' : 'fa-clock text-warning'} me-1`}></i>
                          {item.status}
                        </span>
                      </div>
                      
                      <div className="mt-auto">
                        <div className="d-grid gap-2">
                          <button
                            className={`btn ${item.completed ? 'btn-success' : 'btn-primary'}`}
                            onClick={() => handleStartCourse(item)}
                          >
                            <i className={`fas ${item.completed ? 'fa-trophy' : item.progress > 0 ? 'fa-play' : 'fa-rocket'} me-2`}></i>
                            {item.status}
                          </button>
                          
                          {item.type === 'course' && (
                            <button 
                              className="btn btn-outline-warning btn-sm"
                              onClick={() => navigate(`/student/reviews/${item.id}`)}
                            >
                              <i className="fas fa-star me-1"></i>
                              Review Course
                            </button>
                          )}
                          
                          {item.completed && (
                            <>
                              <button 
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => handleStartCourse(item)}
                              >
                                <i className="fas fa-arrow-right me-1"></i>
                                Access Course
                              </button>
                              <button 
                                className="btn btn-outline-success btn-sm"
                                onClick={() => downloadCertificate(item)}
                              >
                                <i className="fas fa-download me-1"></i>
                                Download Certificate
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}