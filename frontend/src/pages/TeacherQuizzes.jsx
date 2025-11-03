import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTeacherQuizzes } from '../services/teacherService';

export default function TeacherQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await getTeacherQuizzes();
        setQuizzes(response.data.quizzes);

        // Calculate stats
        const totalQuizzes = response.data.quizzes.length;
        const finalQuizzes = response.data.quizzes.filter(q => q.is_final_quiz).length;
        const totalAttempts = response.data.quizzes.reduce((sum, q) => sum + q.attempts_count, 0);

        setStats({
          totalQuizzes,
          finalQuizzes,
          regularQuizzes: totalQuizzes - finalQuizzes,
          totalAttempts
        });
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ marginTop: '150px' }}>
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading quizzes...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '150px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">My Quizzes</h2>
          <p className="text-muted mb-0">Manage and view all quizzes you've created</p>
        </div>
        <Link to="/teacher" className="btn btn-secondary">
          <i className="fas fa-arrow-left me-2"></i>
          Back to Dashboard
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card">
            <div className="card-body text-center">
              <div style={{ background: 'linear-gradient(135deg, #C7A76E, #A8895A)', borderRadius: '12px', padding: '15px', display: 'inline-block' }}>
                <i className="fas fa-question-circle fa-2x" style={{ color: '#000' }}></i>
              </div>
              <h4 className="lux-accent mt-2">{stats.totalQuizzes}</h4>
              <small className="text-muted">Total Quizzes</small>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card">
            <div className="card-body text-center">
              <div style={{ background: 'linear-gradient(135deg, #C7A76E, #A8895A)', borderRadius: '12px', padding: '15px', display: 'inline-block' }}>
                <i className="fas fa-trophy fa-2x" style={{ color: '#000' }}></i>
              </div>
              <h4 className="lux-accent mt-2">{stats.finalQuizzes}</h4>
              <small className="text-muted">Final Quizzes</small>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card">
            <div className="card-body text-center">
              <div style={{ background: 'linear-gradient(135deg, #C7A76E, #A8895A)', borderRadius: '12px', padding: '15px', display: 'inline-block' }}>
                <i className="fas fa-book fa-2x" style={{ color: '#000' }}></i>
              </div>
              <h4 className="lux-accent mt-2">{stats.regularQuizzes}</h4>
              <small className="text-muted">Module Quizzes</small>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card">
            <div className="card-body text-center">
              <div style={{ background: 'linear-gradient(135deg, #C7A76E, #A8895A)', borderRadius: '12px', padding: '15px', display: 'inline-block' }}>
                <i className="fas fa-users fa-2x" style={{ color: '#000' }}></i>
              </div>
              <h4 className="lux-accent mt-2">{stats.totalAttempts}</h4>
              <small className="text-muted">Total Attempts</small>
            </div>
          </div>
        </div>
      </div>

      {/* Quizzes List */}
      {quizzes.length > 0 ? (
        <div className="row">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="col-lg-6 col-xl-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-header">
                  <div className="d-flex justify-content-between align-items-start">
                    <h6 className="mb-0 flex-grow-1">{quiz.title}</h6>
                    <span className={`badge ${quiz.is_final_quiz ? 'bg-warning text-dark' : 'bg-info'}`}>
                      {quiz.is_final_quiz ? 'Final Quiz' : 'Module Quiz'}
                    </span>
                  </div>
                </div>
                <div className="card-body">
                  <div className="mb-2">
                    <small className="text-muted">Course:</small>
                    <div className="fw-bold">{quiz.course_title}</div>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">Passing Score:</small>
                    <div className="fw-bold">{quiz.passing_score}%</div>
                  </div>
                  <div className="row text-center">
                    <div className="col-6">
                      <div className="p-2 bg-light rounded">
                        <div className="h6 mb-0">{quiz.questions_count}</div>
                        <small className="text-muted">Questions</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-2 bg-light rounded">
                        <div className="h6 mb-0">{quiz.attempts_count}</div>
                        <small className="text-muted">Attempts</small>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-footer">
                  <div className="d-flex gap-2">
                    {quiz.is_final_quiz ? (
                      <>
                        <Link
                          to={`/teacher/courses/${quiz.course_id}/add-quiz`}
                          className="btn btn-outline-primary btn-sm flex-fill"
                        >
                          <i className="fas fa-edit me-1"></i>
                          Edit Quiz
                        </Link>
                        <Link
                          to={`/teacher/courses/${quiz.course_id}/quiz-results`}
                          className="btn btn-outline-success btn-sm flex-fill"
                        >
                          <i className="fas fa-chart-bar me-1"></i>
                          View Results
                        </Link>
                      </>
                    ) : (
                      <button className="btn btn-outline-secondary btn-sm flex-fill" disabled>
                        <i className="fas fa-lock me-1"></i>
                        Module Quiz
                      </button>
                    )}
                  </div>
                  <small className="text-muted mt-2 d-block">
                    Created: {quiz.created_at || 'N/A'}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="fas fa-question-circle fa-4x text-muted"></i>
          </div>
          <h4 className="text-muted">No Quizzes Created Yet</h4>
          <p className="text-muted">Create your first quiz by adding a final quiz to one of your courses.</p>
          <Link to="/teacher/courses" className="btn btn-primary">
            <i className="fas fa-plus me-2"></i>
            Create Quiz
          </Link>
        </div>
      )}
    </div>
  );
}