import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { createFinalQuiz, addQuizQuestion, getFinalQuiz } from '../services/teacherService';

export default function AddQuiz() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [quizForm, setQuizForm] = useState({
    title: '',
    passing_score: 70
  });
  const [existingQuiz, setExistingQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question_text: '',
    answers: [
      { answer_text: '', is_correct: false },
      { answer_text: '', is_correct: false },
      { answer_text: '', is_correct: false },
      { answer_text: '', is_correct: false }
    ]
  });
  const [quizCreated, setQuizCreated] = useState(false);
  const [quizId, setQuizId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Check if quiz already exists
    const checkExistingQuiz = async () => {
      try {
        const response = await getFinalQuiz(courseId);
        if (response.data) {
          setExistingQuiz(response.data);
          setQuizCreated(true);
          setQuizId(response.data.quiz_id);
          setQuizForm({
            title: response.data.title,
            passing_score: response.data.passing_score
          });
          setQuestions(response.data.questions || []);
        }
      } catch (error) {
        // Quiz doesn't exist yet, which is fine
      }
    };
    checkExistingQuiz();
  }, [courseId]);

  const validateQuizForm = () => {
    const newErrors = {};
    if (!quizForm.title.trim()) newErrors.title = 'Quiz title is required';
    if (!quizForm.passing_score || quizForm.passing_score < 0 || quizForm.passing_score > 100) {
      newErrors.passing_score = 'Passing score must be between 0 and 100';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (!validateQuizForm()) return;

    setLoading(true);
    try {
      const response = await createFinalQuiz(courseId, quizForm);
      setQuizCreated(true);
      setQuizId(response.data.quiz_id);
      setErrors({});
    } catch (error) {
      setErrors({ submit: 'Failed to create quiz' });
    } finally {
      setLoading(false);
    }
  };

  const validateQuestion = () => {
    const newErrors = {};
    if (!currentQuestion.question_text.trim()) newErrors.question = 'Question text is required';
    const validAnswers = currentQuestion.answers.filter(a => a.answer_text.trim());
    if (validAnswers.length < 2) newErrors.answers = 'At least 2 answers are required';
    const correctAnswers = currentQuestion.answers.filter(a => a.is_correct);
    if (correctAnswers.length !== 1) newErrors.correct = 'Exactly one answer must be marked as correct';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!validateQuestion()) return;

    setLoading(true);
    try {
      const questionData = {
        question_text: currentQuestion.question_text,
        question_type: 'multiple_choice',
        answers: currentQuestion.answers.filter(a => a.answer_text.trim())
      };

      await addQuizQuestion(quizId, questionData);
      setQuestions([...questions, { ...questionData, id: Date.now() }]); // Temporary ID
      setCurrentQuestion({
        question_text: '',
        answers: [
          { answer_text: '', is_correct: false },
          { answer_text: '', is_correct: false },
          { answer_text: '', is_correct: false },
          { answer_text: '', is_correct: false }
        ]
      });
      setErrors({});
    } catch (error) {
      setErrors({ submit: 'Failed to add question' });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (index, field, value) => {
    const newAnswers = [...currentQuestion.answers];
    newAnswers[index] = { ...newAnswers[index], [field]: value };
    setCurrentQuestion({ ...currentQuestion, answers: newAnswers });
  };

  return (
    <div className="container mt-4" style={{ marginTop: '120px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Link to="/teacher" className="btn btn-secondary mb-2">Back to Dashboard</Link>
          <h3 className="mb-0">Final Quiz Management</h3>
          <small className="text-muted">Create and manage the final assessment for this course</small>
        </div>
        <Link to={`/teacher/courses/${courseId}/modules`} className="btn btn-outline-primary">
          Manage Modules
        </Link>
      </div>

      {!quizCreated ? (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Create Final Quiz</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreateQuiz}>
              <div className="mb-3">
                <label htmlFor="title" className="form-label">Quiz Title</label>
                <input
                  type="text"
                  className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                  id="title"
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  placeholder="e.g., Final Assessment - Course Name"
                />
                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="passing_score" className="form-label">Passing Score (%)</label>
                <input
                  type="number"
                  className={`form-control ${errors.passing_score ? 'is-invalid' : ''}`}
                  id="passing_score"
                  value={quizForm.passing_score || ''}
                  onChange={(e) => setQuizForm({ ...quizForm, passing_score: e.target.value ? parseInt(e.target.value) : '' })}
                  min="0"
                  max="100"
                  placeholder="70"
                />
                {errors.passing_score && <div className="invalid-feedback">{errors.passing_score}</div>}
              </div>
              {errors.submit && <div className="alert alert-danger">{errors.submit}</div>}
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Quiz'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Add Questions</h5>
                <small className="text-muted">Create multiple choice questions for the final quiz</small>
              </div>
              <div className="card-body">
                <form onSubmit={handleAddQuestion}>
                  <div className="mb-3">
                    <label htmlFor="question_text" className="form-label">Question</label>
                    <textarea
                      className={`form-control ${errors.question ? 'is-invalid' : ''}`}
                      id="question_text"
                      rows="3"
                      value={currentQuestion.question_text}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, question_text: e.target.value })}
                      placeholder="Enter your question here..."
                    />
                    {errors.question && <div className="invalid-feedback">{errors.question}</div>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Answer Options</label>
                    {errors.answers && <div className="text-danger small mb-2">{errors.answers}</div>}
                    {errors.correct && <div className="text-danger small mb-2">{errors.correct}</div>}
                    {currentQuestion.answers.map((answer, index) => (
                      <div key={index} className="input-group mb-2">
                        <div className="input-group-text">
                          <input
                            type="radio"
                            name="correct_answer"
                            checked={answer.is_correct}
                            onChange={() => {
                              const newAnswers = currentQuestion.answers.map((a, i) => ({
                                ...a,
                                is_correct: i === index
                              }));
                              setCurrentQuestion({ ...currentQuestion, answers: newAnswers });
                            }}
                          />
                        </div>
                        <input
                          type="text"
                          className="form-control"
                          placeholder={`Answer option ${index + 1}`}
                          value={answer.answer_text}
                          onChange={(e) => handleAnswerChange(index, 'answer_text', e.target.value)}
                        />
                      </div>
                    ))}
                    <small className="text-muted">Select the radio button next to the correct answer</small>
                  </div>

                  {errors.submit && <div className="alert alert-danger">{errors.submit}</div>}
                  <button type="submit" className="btn btn-success" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Question'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">Quiz Summary</h6>
              </div>
              <div className="card-body">
                <p><strong>Title:</strong> {quizForm.title}</p>
                <p><strong>Passing Score:</strong> {quizForm.passing_score}%</p>
                <p><strong>Questions:</strong> {questions.length}</p>
                <hr />
                <small className="text-muted">
                  Students must complete all course modules before taking this quiz.
                  They need to score at least {quizForm.passing_score}% to pass and receive their certificate.
                </small>
                {existingQuiz && (
                  <div className="mt-3">
                    <button
                      className="btn btn-info btn-sm w-100"
                      onClick={() => window.location.href = `/teacher/courses/${courseId}/quiz-results`}
                    >
                      <i className="fas fa-chart-bar me-1"></i>
                      View Student Results
                    </button>
                  </div>
                )}
              </div>
            </div>

            {questions.length > 0 && (
              <div className="card mt-3">
                <div className="card-header">
                  <h6 className="mb-0">Questions Added ({questions.length})</h6>
                </div>
                <div className="card-body">
                  <div className="list-group list-group-flush">
                    {questions.map((q, index) => (
                      <div key={q.id || index} className="list-group-item px-0">
                        <small className="fw-bold">Q{index + 1}:</small>
                        <small className="ms-2">{q.question_text.substring(0, 50)}...</small>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}