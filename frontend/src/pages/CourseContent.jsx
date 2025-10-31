import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEnrolledCourseContent } from '../services/studentService';

export default function CourseContent() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseContent();
  }, [courseId]);

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
                    <button
                      key={module.id}
                      className={`list-group-item list-group-item-action border-0 rounded mb-2 ${
                        selectedModule?.id === module.id ? 'active' : ''
                      }`}
                      onClick={() => setSelectedModule(module)}
                      style={{
                        transition: 'all 0.2s ease',
                        border: selectedModule?.id === module.id ? '2px solid #0d6efd' : '1px solid #dee2e6'
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <span className="badge bg-light text-dark me-2 rounded-circle" style={{ width: '24px', height: '24px', fontSize: '12px' }}>
                          {index + 1}
                        </span>
                        <span className="fw-medium">{module.title}</span>
                      </div>
                    </button>
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
            
            <div className="card-body overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {selectedModule ? (
                <div className="content-wrapper">
                  <div 
                    className="module-content"
                    style={{
                      lineHeight: '1.6',
                      fontSize: '16px',
                      color: '#333'
                    }}
                    dangerouslySetInnerHTML={{ __html: selectedModule.content }} 
                  />
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
                        setSelectedModule(courseData.modules[currentIndex - 1]);
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
                        setSelectedModule(courseData.modules[currentIndex + 1]);
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