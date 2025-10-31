import React, { useEffect, useState } from 'react';

export default function StudentProgress() {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://127.0.0.1:5000/api/teacher/students-progress', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setProgress(data);
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
      setLoading(false);
    };
    fetchProgress();
  }, []);

  if (loading) return <div className="container mt-4"><h3>Loading...</h3></div>;

  return (
    <div className="container mt-4">
      <h3>Student Progress</h3>
      {progress.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Course/Skill</th>
                <th>Type</th>
                <th>Progress</th>
                <th>Status</th>
                <th>Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {progress.map((item, index) => (
                <tr key={index}>
                  <td>{item.student_name}</td>
                  <td>{item.student_email}</td>
                  <td>{item.item_name}</td>
                  <td>
                    <span className={`badge bg-${item.item_type === 'course' ? 'primary' : 'info'}`}>
                      {item.item_type}
                    </span>
                  </td>
                  <td>
                    <div className="progress">
                      <div 
                        className="progress-bar" 
                        style={{width: `${item.progress}%`}}
                      >
                        {item.progress}%
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge bg-${item.completed ? 'success' : 'warning'}`}>
                      {item.completed ? 'Completed' : 'In Progress'}
                    </span>
                  </td>
                  <td>{item.date_enrolled}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="alert alert-info">No students enrolled yet</div>
      )}
    </div>
  );
}