import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getQuizResults } from '../services/teacherService';

export default function QuizResults() {
  const { courseId } = useParams();
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await getQuizResults(courseId);
        setResults(response.data);
      } catch (error) {
        console.error('Error fetching quiz results:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [courseId]);

  if (loading) {
    return (
      <div className="container mt-4" style={{ marginTop: '120px' }}>
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading quiz results...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ marginTop: '120px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Quiz Results</h2>
          <p className="text-muted mb-0">Course: {results.course_title}</p>
        </div>
        <Link to={`/teacher/courses/${courseId}/add-quiz`} className="btn btn-primary">
          <i className="fas fa-arrow-left me-2"></i>
          Back to Quiz Management
        </Link>
      </div>

      {results.results && results.results.length > 0 ? (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-chart-bar me-2"></i>
                  {results.quiz_title} - Results Overview
                </h5>
                <small className="text-muted">Passing Score: {results.passing_score}%</small>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Email</th>
                        <th>Score</th>
                        <th>Status</th>
                        <th>Questions Correct</th>
                        <th>Total Questions</th>
                        <th>Submitted At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.results.map((result, index) => (
                        <tr key={index}>
                          <td>{result.student_name}</td>
                          <td>{result.student_email}</td>
                          <td>
                            <span className={`badge ${result.score >= results.passing_score ? 'bg-success' : 'bg-danger'}`}>
                              {result.score}%
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${result.passed ? 'bg-success' : 'bg-danger'}`}>
                              {result.passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </td>
                          <td>{result.correct_answers}</td>
                          <td>{result.total_questions}</td>
                          <td>
                            {result.attempted_at ?
                              new Date(result.attempted_at).toLocaleDateString() + ' ' +
                              new Date(result.attempted_at).toLocaleTimeString()
                              : 'N/A'
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary Statistics */}
                <div className="row mt-4">
                  <div className="col-md-3">
                    <div className="card bg-light">
                      <div className="card-body text-center">
                        <h4 className="text-primary">{results.results.length}</h4>
                        <small className="text-muted">Total Attempts</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-success">
                      <div className="card-body text-center text-white">
                        <h4>{results.results.filter(r => r.passed).length}</h4>
                        <small>Passed</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-danger">
                      <div className="card-body text-center text-white">
                        <h4>{results.results.filter(r => !r.passed).length}</h4>
                        <small>Failed</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-info">
                      <div className="card-body text-center text-white">
                        <h4>{results.results.length > 0 ? Math.round(results.results.reduce((sum, r) => sum + r.score, 0) / results.results.length) : 0}%</h4>
                        <small>Average Score</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="fas fa-chart-bar fa-4x text-muted"></i>
          </div>
          <h4 className="text-muted">No Quiz Results Yet</h4>
          <p className="text-muted">Students haven't taken the final quiz yet.</p>
          <Link to={`/teacher/courses/${courseId}/add-quiz`} className="btn btn-primary">
            Back to Quiz Management
          </Link>
        </div>
      )}
    </div>
  );
}