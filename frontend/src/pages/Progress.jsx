import React, { useEffect, useState } from 'react';
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
      height: '20px',
      backgroundColor: '#f0f0f0',
      borderRadius: '10px',
      overflow: 'hidden',
      border: '1px solid #ddd',
      marginBottom: '5px'
    }}>
      <div style={{
        width: `${progress}%`,
        height: '100%',
        backgroundColor: getColor(progress),
        borderRadius: '10px',
        transition: 'width 0.3s ease'
      }} />
    </div>
  );
};

export default function Progress() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

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
      await axios.put('http://127.0.0.1:5000/api/student/update-progress', 
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

  if (loading) return <p>Loading progress...</p>;

  return (
    <div className="container mt-4">
      <h3>My Learning Progress</h3>
      
      {enrollments.length === 0 ? (
        <p>No enrollments yet. Start learning!</p>
      ) : (
        <div>
          {enrollments.map((item) => (
            <div key={item.id} className="card mb-3 p-3">
              <h5>{item.title} <span className="badge bg-secondary">{item.type}</span></h5>
              
              <div className="mb-2">
                <ProgressBar progress={item.progress} />
                <small className="text-muted">{item.progress}% Complete</small>
              </div>
              
              <p><strong>Status:</strong> {item.status}</p>
              
              <div>
                <button 
                  className="btn btn-sm btn-primary me-2"
                  onClick={() => updateProgress(item.id, Math.min(item.progress + 25, 100))}
                  disabled={item.completed}
                >
                  Study More (+25%)
                </button>
                
                {item.completed && (
                  <button className="btn btn-sm btn-success">
                    Download Certificate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}