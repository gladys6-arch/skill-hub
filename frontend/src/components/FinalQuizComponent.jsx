import React, { useState, useEffect, useCallback } from 'react';
import { getFinalQuiz, submitFinalQuizAttempt } from '../services/studentService';

const FinalQuizComponent = ({ courseId, onQuizComplete }) => {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);

  // Load quiz data
  useEffect(() => {
    loadQuiz();
  }, [courseId]);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => {
          if (timeLeft <= 1) {
            handleTimeUp();
            return 0;
          }
          return timeLeft - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleTimeUp();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getFinalQuiz(courseId);
      if (response.data) {
        setQuiz(response.data);
        // Set timer to 45 minutes (2700 seconds) for final quiz
        setTimeLeft(2700);
      } else {
        setQuiz(null);
      }
    } catch (error) {
      console.error('Error loading final quiz:', error);
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.message?.includes('Complete all modules')) {
          setError(`Please complete all modules first. Progress: ${errorData.modules_completed}/${errorData.total_modules} modules completed.`);
        } else if (errorData.message?.includes('already completed')) {
          setError('You have already completed this quiz.');
        } else {
          setError(errorData.message || 'Cannot access final quiz at this time.');
        }
      } else if (error.response?.status === 404) {
        setError('No final quiz available for this course.');
      } else {
        setError('Failed to load final quiz. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async () => {
    try {
      setError(null);
      // For final quiz, we'll create an attempt when starting
      setAttemptId('final_' + Date.now()); // Temporary ID
      setIsActive(true);
    } catch (error) {
      console.error('Error starting final quiz:', error);
      setError('Failed to start final quiz. Please try again.');
    }
  };

  const handleTimeUp = useCallback(async () => {
    setIsActive(false);
    setWarning('Time is up! Your final quiz has been auto-submitted.');
    if (attemptId) {
      await submitQuiz(true); // Auto-submit when time is up
    }
  }, [attemptId]);

  const handleAnswerSelect = (questionId, answerId) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const handleTextAnswer = (questionId, text) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: text
    }));
  };

  const submitQuiz = async (timeUp = false) => {
    if (!attemptId) return;

    // Check if all questions are answered (except for time up)
    if (!timeUp) {
      const unansweredQuestions = quiz.questions.filter(q => !selectedAnswers[q.id]);
      if (unansweredQuestions.length > 0) {
        setWarning(`You have ${unansweredQuestions.length} unanswered question(s). Click "Submit Quiz" again to submit anyway, or go back to answer them.`);
        return;
      }
    }

    try {
      setSubmitting(true);
      setError(null);
      setWarning(null);

      // Prepare responses
      const responses = quiz.questions.map(question => {
        const selectedAnswer = selectedAnswers[question.id];
        return {
          question_id: question.id,
          selected_answer_id: question.question_type === 'short_answer' ? null : selectedAnswer,
          response_text: question.question_type === 'short_answer' ? selectedAnswer : null
        };
      });

      const response = await submitFinalQuizAttempt(quiz.quiz_id, responses);

      setResults(response.data);
      setIsActive(false);

      if (onQuizComplete) {
        onQuizComplete(response.data);
      }
    } catch (error) {
      console.error('Error submitting final quiz:', error);
      setError('Failed to submit final quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateScore = () => {
    if (!results) return 0;
    return results.score || 0;
  };

  const isPassed = () => {
    if (!results || !quiz) return false;
    return results.score >= quiz.passing_score;
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading final quiz...</span>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="alert alert-info">
        <i className="fas fa-info-circle me-2"></i>
        No final quiz available for this course.
      </div>
    );
  }

  if (results) {
    return (
      <div className="final-quiz-results">
        <div className="card">
          <div className="card-header bg-success text-white">
            <h5 className="mb-0">
              <i className="fas fa-trophy me-2"></i>
              Final Assessment Results
            </h5>
          </div>
          <div className="card-body">
            <div className="row text-center">
              <div className="col-md-4">
                <div className={`score-circle ${isPassed() ? 'passed' : 'failed'}`}>
                  <h2 className="mb-0">{calculateScore()}%</h2>
                  <small>Final Score</small>
                </div>
              </div>
              <div className="col-md-4">
                <div className="result-icon">
                  {isPassed() ? (
                    <i className="fas fa-graduation-cap text-success fa-3x"></i>
                  ) : (
                    <i className="fas fa-times-circle text-danger fa-3x"></i>
                  )}
                </div>
                <h5 className={isPassed() ? 'text-success' : 'text-danger'}>
                  {isPassed() ? 'PASSED - Certificate Earned!' : 'FAILED - Try Again'}
                </h5>
                <small className="text-muted">
                  Passing Score: {quiz.passing_score}%
                </small>
              </div>
              <div className="col-md-4">
                <div className="stats">
                  <p className="mb-1">
                    <strong>Questions:</strong> {quiz.questions.length}
                  </p>
                  <p className="mb-1">
                    <strong>Time Taken:</strong> {results.time_taken || 'N/A'}
                  </p>
                  <p className="mb-0">
                    <strong>Completed:</strong> {new Date(results.completed_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h6>Assessment Review:</h6>
              <div className="question-review">
                {quiz.questions.map((question, index) => {
                  const userAnswer = selectedAnswers[question.id];
                  const correctAnswer = question.answers.find(a => a.is_correct);

                  return (
                    <div key={question.id} className="question-item mb-3 p-3 border rounded">
                      <h6>Question {index + 1}: {question.question_text}</h6>
                      <div className="answer-review">
                        {question.question_type === 'short_answer' ? (
                          <div>
                            <strong>Your Answer:</strong> {userAnswer || 'No answer provided'}
                            <br />
                            <small className="text-muted">Short answer questions are manually graded.</small>
                          </div>
                        ) : (
                          <div>
                            <strong>Your Answer:</strong> {
                              question.answers.find(a => a.id === userAnswer)?.answer_text || 'No answer selected'
                            }
                            <br />
                            <strong>Correct Answer:</strong> {correctAnswer?.answer_text}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className="final-quiz-start">
        <div className="card border-warning">
          <div className="card-header bg-warning text-dark">
            <h5 className="mb-0">
              <i className="fas fa-graduation-cap me-2"></i>
              {quiz.title}
            </h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-8">
                <p className="mb-2"><strong>Questions:</strong> {quiz.questions.length}</p>
                <p className="mb-2"><strong>Passing Score:</strong> {quiz.passing_score}%</p>
                <p className="mb-2"><strong>Time Limit:</strong> 45 minutes</p>
                <div className="alert alert-warning">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <strong>Important:</strong> This is your final assessment. You must pass to earn your certificate. The quiz will auto-submit when time runs out.
                </div>
              </div>
              <div className="col-md-4 text-center">
                <button
                  className="btn btn-warning btn-lg"
                  onClick={startQuiz}
                  disabled={loading}
                >
                  <i className="fas fa-play-circle me-2"></i>
                  Start Final Assessment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="final-quiz-active">
      <div className="card border-warning">
        <div className="card-header bg-warning text-dark">
          <div className="d-flex align-items-center justify-content-between">
            <h5 className="mb-0">
              <i className="fas fa-graduation-cap me-2"></i>
              {quiz.title}
            </h5>
            <div className="timer">
              <i className="fas fa-clock me-2"></i>
              <span className={`badge ${timeLeft < 900 ? 'bg-danger' : 'bg-dark'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          {warning && (
            <div className="alert alert-warning">
              <i className="fas fa-exclamation-circle me-2"></i>
              {warning}
            </div>
          )}

          <div className="question-progress mb-3">
            <small className="text-muted">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </small>
            <div className="progress" style={{ height: '6px' }}>
              <div
                className="progress-bar bg-warning"
                style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="question-container">
            <h4 className="question-text mb-4">{currentQuestion.question_text}</h4>

            <div className="answers-container">
              {currentQuestion.question_type === 'multiple_choice' && (
                <div className="multiple-choice">
                  {currentQuestion.answers.map((answer) => (
                    <div key={answer.id} className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        id={`answer-${answer.id}`}
                        checked={selectedAnswers[currentQuestion.id] === answer.id}
                        onChange={() => handleAnswerSelect(currentQuestion.id, answer.id)}
                      />
                      <label className="form-check-label" htmlFor={`answer-${answer.id}`}>
                        {answer.answer_text}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {currentQuestion.question_type === 'true_false' && (
                <div className="true-false">
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      id={`true-${currentQuestion.id}`}
                      checked={selectedAnswers[currentQuestion.id] === currentQuestion.answers.find(a => a.answer_text.toLowerCase() === 'true')?.id}
                      onChange={() => handleAnswerSelect(currentQuestion.id, currentQuestion.answers.find(a => a.answer_text.toLowerCase() === 'true')?.id)}
                    />
                    <label className="form-check-label" htmlFor={`true-${currentQuestion.id}`}>
                      True
                    </label>
                  </div>
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      id={`false-${currentQuestion.id}`}
                      checked={selectedAnswers[currentQuestion.id] === currentQuestion.answers.find(a => a.answer_text.toLowerCase() === 'false')?.id}
                      onChange={() => handleAnswerSelect(currentQuestion.id, currentQuestion.answers.find(a => a.answer_text.toLowerCase() === 'false')?.id)}
                    />
                    <label className="form-check-label" htmlFor={`false-${currentQuestion.id}`}>
                      False
                    </label>
                  </div>
                </div>
              )}

              {currentQuestion.question_type === 'short_answer' && (
                <div className="short-answer">
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Enter your answer here..."
                    value={selectedAnswers[currentQuestion.id] || ''}
                    onChange={(e) => handleTextAnswer(currentQuestion.id, e.target.value)}
                  ></textarea>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="card-footer bg-light">
          <div className="d-flex justify-content-between">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
            >
              <i className="fas fa-chevron-left me-1"></i>
              Previous
            </button>

            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-warning"
                  onClick={() => setWarning('Are you sure you want to submit with unanswered questions?')}
                  disabled={submitting}
                >
                  <i className="fas fa-question me-1"></i>
                  Check Answers
                </button>
                <button
                  className="btn btn-warning"
                  onClick={() => submitQuiz()}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane me-1"></i>
                      Submit Final Assessment
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button
                className="btn btn-warning"
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              >
                Next
                <i className="fas fa-chevron-right ms-1"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalQuizComponent;