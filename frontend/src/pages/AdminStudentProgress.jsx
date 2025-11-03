import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllStudentProgress, getStudentProgressDetail, deleteUser } from '../services/adminService';

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
      backgroundColor: '#f8f9fa',
      borderRadius: '10px',
      overflow: 'hidden',
      border: '1px solid #dee2e6'
    }}>
      <div style={{
        width: `${progress}%`,
        height: '100%',
        backgroundColor: getColor(progress),
        borderRadius: '10px',
        transition: 'width 0.4s ease'
      }} />
    </div>
  );
};

export default function AdminStudentProgress() {
  const [progressData, setProgressData] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await getAllStudentProgress();
        setProgressData(res.data);
      } catch (error) {
        console.error('Error fetching student progress:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  const handleViewDetails = async (studentId) => {
    setDetailsLoading(true);
    try {
      const res = await getStudentProgressDetail(studentId);
      setStudentDetails(res.data);
      setSelectedStudent(studentId);

      // Auto-scroll to the details panel after a short delay to ensure content is rendered
      setTimeout(() => {
        const detailsPanel = document.getElementById('student-details-panel');
        if (detailsPanel) {
          detailsPanel.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    } catch (error) {
      console.error('Error fetching student details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    if (window.confirm(`Are you sure you want to delete student "${studentName}"? This action cannot be undone and will remove all their progress data.`)) {
      setDeletingStudent(studentId);
      try {
        await deleteUser(studentId);

        // Refresh the progress data
        const res = await getAllStudentProgress();
        setProgressData(res.data);

        // Clear selected student if it was the deleted one
        if (selectedStudent === studentId) {
          setSelectedStudent(null);
          setStudentDetails({});
        }

        alert('Student deleted successfully');
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Failed to delete student');
      } finally {
        setDeletingStudent(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="container section" style={{ marginTop: '120px', textAlign: 'center' }}>
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading student progress...</span>
          </div>
        </div>
        <p className="lux-accent mt-2">Loading student progress...</p>
      </div>
    );
  }

  return (
    <div className="container section" style={{ marginTop: '120px' }}>
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h1 className="lux-accent mb-1">Student Progress Tracking</h1>
              <p className="text-muted mb-0">Monitor student learning progress across all courses and skills.</p>
            </div>
            <Link to="/admin/dashboard" className="site-button">
              <i className="fas fa-arrow-left me-2"></i>
              Back to Dashboard
            </Link>
          </div>

          {/* Summary Stats */}
          <div className="row mb-4">
            <div className="col-lg-3 col-md-6 mb-3">
              <div className="card">
                <div className="card-body text-center">
                  <div style={{ background: 'linear-gradient(135deg, #C7A76E, #A8895A)', borderRadius: '12px', padding: '15px', display: 'inline-block' }}>
                    <i className="fas fa-users fa-2x" style={{ color: '#000' }}></i>
                  </div>
                  <h4 className="lux-accent mt-2">{progressData.total_students || 0}</h4>
                  <small className="text-muted">Total Students</small>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-3">
              <div className="card">
                <div className="card-body text-center">
                  <div style={{ background: 'linear-gradient(135deg, #C7A76E, #A8895A)', borderRadius: '12px', padding: '15px', display: 'inline-block' }}>
                    <i className="fas fa-user-check fa-2x" style={{ color: '#000' }}></i>
                  </div>
                  <h4 className="lux-accent mt-2">{progressData.students_with_progress || 0}</h4>
                  <small className="text-muted">Active Learners</small>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-3">
              <div className="card">
                <div className="card-body text-center">
                  <div style={{ background: 'linear-gradient(135deg, #C7A76E, #A8895A)', borderRadius: '12px', padding: '15px', display: 'inline-block' }}>
                    <i className="fas fa-graduation-cap fa-2x" style={{ color: '#000' }}></i>
                  </div>
                  <h4 className="lux-accent mt-2">
                    {progressData.student_progress?.reduce((sum, student) => sum + student.completed_courses, 0) || 0}
                  </h4>
                  <small className="text-muted">Courses Completed</small>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-3">
              <div className="card">
                <div className="card-body text-center">
                  <div style={{ background: 'linear-gradient(135deg, #C7A76E, #A8895A)', borderRadius: '12px', padding: '15px', display: 'inline-block' }}>
                    <i className="fas fa-certificate fa-2x" style={{ color: '#000' }}></i>
                  </div>
                  <h4 className="lux-accent mt-2">
                    {progressData.student_progress?.reduce((sum, student) => sum + student.completed_skills, 0) || 0}
                  </h4>
                  <small className="text-muted">Skills Completed</small>
                </div>
              </div>
            </div>
          </div>

          {/* Student Progress List */}
          <div className="row">
            <div className="col-lg-8">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0 fw-bold lux-accent">
                    <i className="fas fa-chart-line me-2"></i>
                    Student Progress Overview
                  </h5>
                </div>
                <div className="card-body">
                  {progressData.student_progress?.length > 0 ? (
                    <div className="row">
                      {progressData.student_progress.map((student) => (
                        <div key={student.student_id} className="col-12 mb-3">
                          <div className="card border">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                  <h6 className="mb-1 fw-bold">{student.student_name}</h6>
                                  <small className="text-muted">{student.student_email}</small>
                                </div>
                                <div className="btn-group" role="group">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleViewDetails(student.student_id)}
                                    disabled={detailsLoading}
                                  >
                                    {detailsLoading ? 'Loading...' : 'View Details'}
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteStudent(student.student_id, student.student_name)}
                                    disabled={deletingStudent === student.student_id}
                                    title="Delete Student"
                                  >
                                    {deletingStudent === student.student_id ? (
                                      <>
                                        <i className="fas fa-spinner fa-spin me-1"></i>
                                        Deleting...
                                      </>
                                    ) : (
                                      <>
                                        <i className="fas fa-trash me-1"></i>
                                        Delete
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>

                              <div className="row">
                                <div className="col-md-6">
                                  <div className="mb-2">
                                    <small className="text-muted d-block">Courses: {student.completed_courses}/{student.total_courses}</small>
                                    <ProgressBar progress={student.total_courses > 0 ? (student.completed_courses / student.total_courses) * 100 : 0} />
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="mb-2">
                                    <small className="text-muted d-block">Skills: {student.completed_skills}/{student.total_skills}</small>
                                    <ProgressBar progress={student.total_skills > 0 ? (student.completed_skills / student.total_skills) * 100 : 0} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <i className="fas fa-chart-line fa-3x text-muted mb-3"></i>
                      <h5 className="text-muted">No Student Progress Data</h5>
                      <p className="text-muted">Students haven't started any courses or skills yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Student Details Panel */}
            <div className="col-lg-4">
              <div className="card" id="student-details-panel">
                <div className="card-header">
                  <h5 className="mb-0 fw-bold lux-accent">
                    <i className="fas fa-user me-2"></i>
                    Student Details
                  </h5>
                </div>
                <div className="card-body">
                  {selectedStudent && studentDetails.student ? (
                    <div>
                      <div className="text-center mb-3">
                        <div style={{ background: 'linear-gradient(135deg, #C7A76E, #A8895A)', borderRadius: '50%', padding: '20px', display: 'inline-block' }}>
                          <i className="fas fa-user fa-2x" style={{ color: '#000' }}></i>
                        </div>
                        <h6 className="mt-2 mb-1">{studentDetails.student.name}</h6>
                        <small className="text-muted">{studentDetails.student.email}</small>
                      </div>

                      <div className="mb-3">
                        <h6 className="fw-bold">Summary</h6>
                        <div className="row text-center">
                          <div className="col-6">
                            <div className="p-2 bg-light rounded">
                              <div className="h5 mb-0 lux-accent">{studentDetails.summary?.completed_courses || 0}</div>
                              <small className="text-muted">Courses Done</small>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="p-2 bg-light rounded">
                              <div className="h5 mb-0 lux-accent">{studentDetails.summary?.completed_skills || 0}</div>
                              <small className="text-muted">Skills Done</small>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <small className="text-muted">Overall Completion: </small>
                          <span className="fw-bold lux-accent">{studentDetails.summary?.overall_completion_rate || 0}%</span>
                        </div>
                      </div>

                      {studentDetails.course_progress?.length > 0 && (
                        <div className="mb-3">
                          <h6 className="fw-bold">Course Progress</h6>
                          {studentDetails.course_progress.map((course) => (
                            <div key={course.course_id} className="mb-2 p-2 border rounded">
                              <small className="fw-bold d-block">{course.course_title}</small>
                              <small className="text-muted d-block">by {course.teacher_name}</small>
                              <div className="mt-1">
                                <ProgressBar progress={course.progress_percentage} />
                                <small className="text-muted mt-1 d-block">
                                  {course.modules_completed}/{course.total_modules} modules • {course.progress_percentage}%
                                </small>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {studentDetails.skill_progress?.length > 0 && (
                        <div className="mb-3">
                          <h6 className="fw-bold">Skill Progress</h6>
                          {studentDetails.skill_progress.map((skill) => (
                            <div key={skill.skill_id} className="mb-2 p-2 border rounded">
                              <small className="fw-bold d-block">{skill.skill_name}</small>
                              <small className="text-muted d-block">by {skill.teacher_name}</small>
                              <div className="mt-1">
                                <ProgressBar progress={skill.progress} />
                                <small className="text-muted mt-1 d-block">{skill.progress}% complete</small>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <i className="fas fa-user fa-3x text-muted mb-3"></i>
                      <p className="text-muted">Select a student to view detailed progress</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}