import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../api';

export default function StudentDashboard() {
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseModules, setCourseModules] = useState({});

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/student/sessions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        setSessions(data);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    };

    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/student/my-progress`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        setCourses(data);

        // Fetch module details for each course
        const modulesData = {};
        for (const course of data.filter(c => c.type === 'course')) {
          try {
            const modulesResponse = await fetch(`${API_BASE_URL}/api/student/courses/${course.id}/modules`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const modules = await modulesResponse.json();
            modulesData[course.id] = modules;
          } catch (error) {
            console.error(`Error fetching modules for course ${course.id}:`, error);
          }
        }
        setCourseModules(modulesData);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchSessions();
    fetchCourses();

    // Check for session status updates every 30 seconds
    const interval = setInterval(fetchSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mt-4">
      <Link to="/" className="back-button">Back to Home</Link>
      <h2>Student Dashboard</h2>
      <div className="mb-4">
        <Link to="/student/courses" className="btn btn-primary me-2">Available Courses</Link>
        <Link to="/student/progress" className="btn btn-success me-2">My Progress</Link>
        <Link to="/student/certificate" className="btn btn-info me-2">Certificates</Link>
        <Link to="/student/request-session" className="btn btn-warning me-2">Request Study Session</Link>
      </div>

      {courses.length > 0 && (
        <div className="card mb-4">
          <div className="card-header">
            <h5>My Course Progress</h5>
          </div>
          <div className="card-body">
            <div className="row">
              {courses.filter(course => course.type === 'course').map(course => (
                <div key={course.id} className="col-md-6 mb-3">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="card-title">{course.title}</h6>
                      <div className="mb-2">
                        <div className="progress">
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${course.progress}%` }}
                            aria-valuenow={course.progress}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          >
                            {course.progress}%
                          </div>
                        </div>
                      </div>
                      <p className="card-text small text-muted">{course.status}</p>

                      {courseModules[course.id] && (
                        <div className="mb-3">
                          <small className="text-muted">Modules:</small>
                          <ul className="list-unstyled small">
                            {courseModules[course.id].modules.map(module => (
                              <li key={module.id} className="d-flex align-items-center">
                                <i className={`bi ${module.is_completed ? 'bi-check-circle-fill text-success' : 'bi-circle text-muted'} me-2`}></i>
                                {module.title}
                              </li>
                            ))}
                          </ul>
                          <small className="text-muted">
                            {courseModules[course.id].progress_text}
                          </small>
                        </div>
                      )}

                      <Link to={`/student/course/${course.id}`} className="btn btn-sm btn-outline-primary">
                        View Course
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {sessions.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h5>My Study Sessions</h5>
          </div>
          <div className="card-body">
            <div className="list-group">
              {sessions.map(session => (
                <div key={session.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{session.teacher_name}</strong> - {session.subject}
                    <br />
                    <small className="text-muted">
                      Status: <span className={`fw-bold ${session.status === 'accepted' ? 'text-success' : session.status === 'declined' ? 'text-danger' : 'text-warning'}`}>{session.status}</span> | Created: {session.created_at}
                    </small>
                  </div>
                  <Link to={`/student/chat/${session.id}`} className="btn btn-primary btn-sm">
                    Open Chat
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
