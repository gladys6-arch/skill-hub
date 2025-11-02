import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEnrolledCourseContent, markModuleCompleted, startTimeTracking, updateTimeTracking, getTimeTracking, getReadingSections, markReadingSectionComplete, getInteractiveElements, getFinalQuiz } from '../services/studentService';
import QuizComponent from '../components/QuizComponent';
import InteractiveElement from '../components/InteractiveElement';
import FinalQuizComponent from '../components/FinalQuizComponent';

export default function CourseContent() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [progressUpdateTrigger, setProgressUpdateTrigger] = useState(0);

  // Time tracking state
  const [timeTracking, setTimeTracking] = useState({ timeSpent: 0, lastUpdate: Date.now() });
  const [isTracking, setIsTracking] = useState(false);
  const timeIntervalRef = useRef(null);

  // Reading progress state
  const [readingSections, setReadingSections] = useState([]);
  const [readingProgress, setReadingProgress] = useState({});
  const [scrollProgress, setScrollProgress] = useState(0);
  const contentRef = useRef(null);

  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Interactive elements state
  const [interactiveElements, setInteractiveElements] = useState([]);
  const [interactiveProgress, setInteractiveProgress] = useState({});

  // Anti-cheating state
  const [isTabActive, setIsTabActive] = useState(true);
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const [cheatFlags, setCheatFlags] = useState([]);

  // Load persisted tracking state on mount
  useEffect(() => {
    const persistedTracking = localStorage.getItem(`timeTracking_${courseId}`);
    if (persistedTracking) {
      setTimeTracking(JSON.parse(persistedTracking));
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseContent();
  }, [courseId]);

  // Anti-cheating event listeners
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setIsTabActive(isVisible);
      if (!isVisible) {
        setCheatFlags(prev => [...prev, 'tab_switch']);
        pauseTimeTracking();
      } else {
        resumeTimeTracking();
      }
    };

    const handleFocus = () => setIsWindowFocused(true);
    const handleBlur = () => {
      setIsWindowFocused(false);
      setCheatFlags(prev => [...prev, 'window_blur']);
      pauseTimeTracking();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const element = contentRef.current;
        const scrollTop = element.scrollTop;
        const scrollHeight = element.scrollHeight - element.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        setScrollProgress(progress);

        // Auto-mark reading sections as complete based on scroll
        if (progress > 90 && readingSections.length > 0) {
          const incompleteSections = readingSections.filter(section => !readingProgress[section.id]);
          incompleteSections.forEach(section => {
            markSectionAsRead(section.id);
          });
        }
      }
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
      return () => contentElement.removeEventListener('scroll', handleScroll);
    }
  }, [readingSections, readingProgress]);

  const fetchCourseContent = async () => {
    try {
      const res = await getEnrolledCourseContent(courseId);
      setCourseData(res.data);
      if (res.data.modules.length > 0) {
        setSelectedModule(res.data.modules[0]);
      }
    } catch (error) {
      console.error('Error fetching course content:', error);
    } finally {
      setLoading(false);
    }
  };

  // Time tracking functions
  const startTimeTrackingForModule = useCallback(async (moduleId) => {
    try {
      await startTimeTracking(moduleId);
      const timeData = await getTimeTracking(moduleId);
      setTimeTracking({
        timeSpent: timeData.data.time_spent_seconds || 0,
        lastUpdate: Date.now()
      });
      setIsTracking(true);

      // Start periodic updates
      timeIntervalRef.current = setInterval(async () => {
        if (isTracking && isTabActive && isWindowFocused) {
          const now = Date.now();
          const elapsed = Math.floor((now - timeTracking.lastUpdate) / 1000);
          if (elapsed >= 30) { // Update every 30 seconds
            try {
              await updateTimeTracking(moduleId, elapsed);
              setTimeTracking(prev => ({
                timeSpent: prev.timeSpent + elapsed,
                lastUpdate: now
              }));
              localStorage.setItem(`timeTracking_${courseId}`, JSON.stringify({
                timeSpent: timeTracking.timeSpent + elapsed,
                lastUpdate: now
              }));
            } catch (error) {
              console.error('Error updating time tracking:', error);
            }
          }
        }
      }, 30000);
    } catch (error) {
      console.error('Error starting time tracking:', error);
    }
  }, [courseId, isTracking, isTabActive, isWindowFocused, timeTracking.lastUpdate]);

  const pauseTimeTracking = useCallback(() => {
    setIsTracking(false);
  }, []);

  const resumeTimeTracking = useCallback(() => {
    if (selectedModule) {
      setIsTracking(true);
    }
  }, [selectedModule]);

  // Reading progress functions
  const loadReadingSections = useCallback(async (moduleId) => {
    try {
      const res = await getReadingSections(moduleId);
      setReadingSections(res.data.sections);
      const progressMap = {};
      res.data.sections.forEach(section => {
        progressMap[section.id] = section.completed;
      });
      setReadingProgress(progressMap);
    } catch (error) {
      console.error('Error loading reading sections:', error);
    }
  }, []);

  // Interactive elements functions
  const loadInteractiveElements = useCallback(async (moduleId) => {
    try {
      const res = await getInteractiveElements(moduleId);
      setInteractiveElements(res.data.elements);
      const progressMap = {};
      res.data.elements.forEach(element => {
        progressMap[element.id] = element.completed;
      });
      setInteractiveProgress(progressMap);
    } catch (error) {
      console.error('Error loading interactive elements:', error);
    }
  }, []);

  const handleInteractiveElementComplete = useCallback((elementId) => {
    setInteractiveProgress(prev => ({
      ...prev,
      [elementId]: true
    }));
    // Refresh module progress to reflect interactive element completion
    fetchCourseContent();
  }, []);

  const markSectionAsRead = useCallback(async (sectionId) => {
    try {
      await markReadingSectionComplete(sectionId);
      setReadingProgress(prev => ({
        ...prev,
        [sectionId]: true
      }));
    } catch (error) {
      console.error('Error marking section as read:', error);
    }
  }, []);

  const handleMarkCompleted = async (moduleId, completed) => {
    setMarkingComplete(true);
    try {
      await markModuleCompleted(moduleId, completed);
      // Update local state
      setCourseData(prev => ({
        ...prev,
        modules: prev.modules.map(module =>
          module.id === moduleId ? { ...module, completed } : module
        ),
        progress: prev.modules.filter(m => m.id === moduleId ? completed : m.completed).length / prev.modules.length * 100
      }));
      // Trigger progress update in parent components
      setProgressUpdateTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error marking module as completed:', error);
    } finally {
      setMarkingComplete(false);
    }
  };

  // Handle module selection with tracking initialization
  const handleModuleSelect = useCallback((module) => {
    setSelectedModule(module);
    setShowQuiz(false);
    setQuizCompleted(false);

    // Stop current tracking
    if (timeIntervalRef.current) {
      clearInterval(timeIntervalRef.current);
    }

    // Start new tracking for selected module
    startTimeTrackingForModule(module.id);
    loadReadingSections(module.id);
    loadInteractiveElements(module.id);
  }, [startTimeTrackingForModule, loadReadingSections, loadInteractiveElements]);

  // Handle quiz completion
  const handleQuizComplete = useCallback((results) => {
    setQuizCompleted(true);
    // Refresh module progress to reflect quiz completion
    fetchCourseContent();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="container-fluid mt-5">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading course content...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
          <h4>Course not found or not enrolled</h4>
          <button className="btn btn-primary" onClick={() => navigate('/student/progress')}>
            Back to Progress
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-3" style={{ height: '100vh' }}>
      <div className="row h-100">
        {/* Sidebar */}
        <div className="col-lg-3 col-md-4 pe-0">
          <div className="card h-100 border-end border-0 rounded-0 shadow-sm">
            <div className="card-header bg-primary text-white border-0">
              <div className="d-flex align-items-center justify-content-between">
                <button 
                  className="btn btn-outline-light btn-sm"
                  onClick={() => navigate('/student/progress')}
                >
                  <i className="fas fa-arrow-left"></i>
                </button>
                <h6 className="mb-0 text-center flex-grow-1 mx-2">Course Content</h6>
              </div>
            </div>
            
            <div className="card-body p-0">
              {/* Course Info */}
              <div className="p-3 border-bottom bg-light">
                <h6 className="mb-1 fw-bold">{courseData.course.title}</h6>
                <small className="text-muted">
                  <i className="fas fa-user me-1"></i>
                  {courseData.course.teacher_name}
                </small>
                
                <div className="mt-2">
                  <div className="progress" style={{ height: '6px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      style={{ width: `${courseData.progress}%` }}
                    ></div>
                  </div>
                  <small className="text-muted">{courseData.progress}% Complete</small>
                </div>
              </div>
              
              {/* Modules List */}
              <div className="p-3">
                <h6 className="mb-3 text-muted text-uppercase small fw-bold">
                  <i className="fas fa-list me-2"></i>
                  Modules ({courseData.modules.length})
                </h6>
                
                <div className="list-group list-group-flush">
                  {courseData.modules.map((module, index) => (
                    <div key={module.id} className="mb-2">
                      <button
                        className={`list-group-item list-group-item-action border-0 rounded mb-1 ${
                          selectedModule?.id === module.id ? 'active' : ''
                        }`}
                        onClick={() => handleModuleSelect(module)}
                        style={{
                          transition: 'all 0.2s ease',
                          border: selectedModule?.id === module.id ? '2px solid #0d6efd' : '1px solid #dee2e6'
                        }}
                      >
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <span className="badge bg-light text-dark me-2 rounded-circle" style={{ width: '24px', height: '24px', fontSize: '12px' }}>
                              {index + 1}
                            </span>
                            <span className="fw-medium">{module.title}</span>
                          </div>
                          {module.completed && (
                            <i className="fas fa-check-circle text-success"></i>
                          )}
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="col-lg-9 col-md-8 ps-0">
          <div className="card h-100 border-0 rounded-0">
            <div className="card-header bg-white border-bottom">
              <div className="d-flex align-items-center justify-content-between">
                <h5 className="mb-0 fw-bold">
                  {selectedModule?.title || 'Select a module to start'}
                </h5>
                {selectedModule && (
                  <div className="d-flex align-items-center">
                    <span className="badge bg-primary me-2">
                      <i className="fas fa-book-open me-1"></i>
                      Module Content
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="card-body overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }} ref={contentRef}>
              {selectedModule ? (
                <div className="content-wrapper">
                  {/* Time tracking indicator */}
                  <div className="mb-3 p-2 bg-light rounded d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-clock me-2 text-primary"></i>
                      <small className="text-muted">
                        Time spent: {Math.floor(timeTracking.timeSpent / 60)}m {timeTracking.timeSpent % 60}s
                      </small>
                    </div>
                    <div className="d-flex align-items-center">
                      {!isTabActive && <i className="fas fa-eye-slash text-warning me-2" title="Tab not active"></i>}
                      {!isWindowFocused && <i className="fas fa-window-minimize text-warning me-2" title="Window not focused"></i>}
                      <div className="progress" style={{ width: '100px', height: '6px' }}>
                        <div
                          className="progress-bar bg-success"
                          style={{ width: `${scrollProgress}%` }}
                        ></div>
                      </div>
                      <small className="ms-2 text-muted">{Math.round(scrollProgress)}%</small>
                    </div>
                  </div>

                  {/* Reading sections indicator */}
                  {readingSections.length > 0 && (
                    <div className="mb-3 p-2 bg-light rounded">
                      <small className="text-muted d-block mb-2">
                        <i className="fas fa-book-reader me-1"></i>
                        Reading Progress ({Object.values(readingProgress).filter(Boolean).length}/{readingSections.length})
                      </small>
                      <div className="d-flex flex-wrap gap-1">
                        {readingSections.map(section => (
                          <span
                            key={section.id}
                            className={`badge ${readingProgress[section.id] ? 'bg-success' : 'bg-secondary'}`}
                            style={{ fontSize: '10px' }}
                          >
                            {section.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interactive elements indicator */}
                  {interactiveElements.length > 0 && (
                    <div className="mb-3 p-2 bg-light rounded">
                      <small className="text-muted d-block mb-2">
                        <i className="fas fa-play-circle me-1"></i>
                        Interactive Elements ({Object.values(interactiveProgress).filter(Boolean).length}/{interactiveElements.length})
                      </small>
                      <div className="d-flex flex-wrap gap-1">
                        {interactiveElements.map(element => (
                          <span
                            key={element.id}
                            className={`badge ${interactiveProgress[element.id] ? 'bg-success' : 'bg-secondary'}`}
                            style={{ fontSize: '10px' }}
                          >
                            <i className={`fas fa-${getElementIcon(element.element_type)} me-1`}></i>
                            {getElementTitle(element.element_type)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {showQuiz ? (
                    <div className="quiz-section">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">
                          <i className="fas fa-brain me-2"></i>
                          Final Course Assessment
                        </h5>
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => setShowQuiz(false)}
                        >
                          <i className="fas fa-times me-1"></i>
                          Close Quiz
                        </button>
                      </div>
                      <FinalQuizComponent
                        courseId={courseId}
                        onQuizComplete={handleQuizComplete}
                      />
                    </div>
                  ) : (
                    <>
                      <div
                        className="module-content"
                        style={{
                          lineHeight: '1.6',
                          fontSize: '16px',
                          color: '#333'
                        }}
                        dangerouslySetInnerHTML={{ __html: selectedModule.content }}
                      />

                      {/* Interactive Elements Section */}
                      {interactiveElements.length > 0 && (
                        <div className="mt-4">
                          <h5 className="mb-3">
                            <i className="fas fa-play-circle me-2"></i>
                            Interactive Elements
                          </h5>
                          {interactiveElements.map(element => (
                            <InteractiveElement
                              key={element.id}
                              element={element}
                              onComplete={handleInteractiveElementComplete}
                            />
                          ))}
                        </div>
                      )}

                      {/* Mark as Read Section - for all modules */}
                      <div className="mt-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h5 className="mb-0">
                            <i className="fas fa-check-circle me-2"></i>
                            Module Completion
                          </h5>
                          {selectedModule.completed && (
                            <span className="badge bg-success">
                              <i className="fas fa-check me-1"></i>
                              Completed
                            </span>
                          )}
                        </div>

                        <div className="completion-actions">
                          <button
                            className={`btn ${selectedModule.completed ? 'btn-success' : 'btn-primary'}`}
                            onClick={() => handleMarkCompleted(selectedModule.id, !selectedModule.completed)}
                            disabled={markingComplete}
                          >
                            {markingComplete ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Processing...
                              </>
                            ) : (
                              <>
                                <i className={`fas ${selectedModule.completed ? 'fa-undo' : 'fa-check'} me-2`}></i>
                                {selectedModule.completed ? 'Mark as Incomplete' : 'Mark as Read'}
                              </>
                            )}
                          </button>
                          <small className="text-muted d-block mt-2">
                            <i className="fas fa-info-circle me-1"></i>
                            Mark this module as read to update your course progress (75% total)
                          </small>
                        </div>
                      </div>

                      {/* Final Quiz Section - appears after all modules are completed */}
                      {(() => {
                        // Check if all modules are completed
                        const allModulesCompleted = courseData.modules.every(module => module.completed);

                        return allModulesCompleted ? (
                          <div className="mt-4">
                            <div className="card border-warning">
                              <div className="card-header bg-warning text-dark">
                                <h5 className="mb-0">
                                  <i className="fas fa-trophy me-2"></i>
                                  Final Course Assessment
                                </h5>
                              </div>
                              <div className="card-body">
                                <div className="alert alert-success">
                                  <i className="fas fa-check-circle me-2"></i>
                                  <strong>Congratulations!</strong> You've completed all course modules. Now take the final assessment to earn your certificate.
                                </div>

                                <div className="text-center">
                                  <button
                                    className="btn btn-warning btn-lg"
                                    onClick={() => setShowQuiz(true)}
                                  >
                                    <i className="fas fa-play-circle me-2"></i>
                                    Take Final Assessment
                                  </button>
                                  <p className="text-muted mt-2 mb-0">
                                    <i className="fas fa-info-circle me-1"></i>
                                    This assessment will test your understanding of the entire course. Passing score required for certification.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4">
                            <div className="card border-info">
                              <div className="card-body text-center">
                                <i className="fas fa-lock fa-2x text-info mb-2"></i>
                                <h6 className="text-info">Final Assessment Locked</h6>
                                <p className="text-muted mb-0">
                                  Complete all course modules to unlock the final assessment and earn your certificate.
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="fas fa-hand-pointer fa-3x text-muted mb-3"></i>
                  <h4 className="text-muted">Select a module to start learning</h4>
                  <p className="text-muted">Choose any module from the sidebar to begin your learning journey.</p>
                </div>
              )}
            </div>
            
            {/* Navigation Footer */}
            {selectedModule && (
              <div className="card-footer bg-light border-top">
                <div className="d-flex justify-content-between align-items-center">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      const currentIndex = courseData.modules.findIndex(m => m.id === selectedModule.id);
                      if (currentIndex > 0) {
                        handleModuleSelect(courseData.modules[currentIndex - 1]);
                      }
                    }}
                    disabled={courseData.modules.findIndex(m => m.id === selectedModule.id) === 0}
                  >
                    <i className="fas fa-chevron-left me-1"></i>
                    Previous
                  </button>

                  <span className="text-muted small">
                    Module {courseData.modules.findIndex(m => m.id === selectedModule.id) + 1} of {courseData.modules.length}
                  </span>

                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      const currentIndex = courseData.modules.findIndex(m => m.id === selectedModule.id);
                      if (currentIndex < courseData.modules.length - 1) {
                        handleModuleSelect(courseData.modules[currentIndex + 1]);
                      }
                    }}
                    disabled={courseData.modules.findIndex(m => m.id === selectedModule.id) === courseData.modules.length - 1}
                  >
                    Next
                    <i className="fas fa-chevron-right ms-1"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}