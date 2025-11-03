import React, { useState, useEffect, useRef } from 'react';
import { markInteractiveElementComplete } from '../services/studentService';

const InteractiveElement = ({ element, onComplete }) => {
  const [completed, setCompleted] = useState(element.completed);
  const [isCompleting, setIsCompleting] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);
  const [simulationInteracted, setSimulationInteracted] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    setCompleted(element.completed);
  }, [element.completed]);

  const handleMarkComplete = async () => {
    if (completed || isCompleting) return;

    setIsCompleting(true);
    try {
      await markInteractiveElementComplete(element.id);
      setCompleted(true);
      onComplete && onComplete(element.id);
    } catch (error) {
      console.error('Error marking interactive element complete:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleVideoEnd = () => {
    setVideoWatched(true);
  };

  const handleExerciseComplete = () => {
    setExerciseCompleted(true);
  };

  const handleSimulationInteract = () => {
    setSimulationInteracted(true);
  };

  const renderElement = () => {
    switch (element.element_type) {
      case 'video':
        return (
          <div className="interactive-video">
            <div className="video-container mb-3">
              <video
                ref={videoRef}
                controls
                className="w-100 rounded"
                onEnded={handleVideoEnd}
                style={{ maxHeight: '400px' }}
              >
                <source src={element.content.video_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="video-info">
              <h6>{element.content.title}</h6>
              <p className="text-muted small">{element.content.description}</p>
              {videoWatched && (
                <div className="alert alert-success py-2">
                  <i className="fas fa-check-circle me-2"></i>
                  Video watched! You can now mark this element as complete.
                </div>
              )}
            </div>
          </div>
        );

      case 'exercise':
        return (
          <div className="interactive-exercise">
            <div className="exercise-header mb-3">
              <h6>{element.content.title}</h6>
              <p className="text-muted small">{element.content.description}</p>
            </div>
            <div className="exercise-content mb-3">
              <div dangerouslySetInnerHTML={{ __html: element.content.instructions }} />
            </div>
            <div className="exercise-actions">
              <button
                className="btn btn-success"
                onClick={handleExerciseComplete}
                disabled={exerciseCompleted}
              >
                <i className="fas fa-check me-2"></i>
                {exerciseCompleted ? 'Exercise Completed' : 'Mark Exercise Complete'}
              </button>
            </div>
          </div>
        );

      case 'simulation':
        return (
          <div className="interactive-simulation">
            <div className="simulation-header mb-3">
              <h6>{element.content.title}</h6>
              <p className="text-muted small">{element.content.description}</p>
            </div>
            <div className="simulation-content mb-3">
              <div
                className="simulation-container border rounded p-3 bg-light"
                onClick={handleSimulationInteract}
                style={{ minHeight: '200px', cursor: 'pointer' }}
              >
                <div className="text-center">
                  <i className="fas fa-play-circle fa-3x text-primary mb-3"></i>
                  <p>Click to interact with the simulation</p>
                  {simulationInteracted && (
                    <div className="alert alert-info mt-3">
                      <i className="fas fa-info-circle me-2"></i>
                      Simulation interaction recorded!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="interactive-generic">
            <div className="alert alert-warning">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Unknown interactive element type: {element.element_type}
            </div>
          </div>
        );
    }
  };

  const canMarkComplete = () => {
    switch (element.element_type) {
      case 'video':
        return videoWatched;
      case 'exercise':
        return exerciseCompleted;
      case 'simulation':
        return simulationInteracted;
      default:
        return true;
    }
  };

  return (
    <div className={`interactive-element card mb-4 ${completed ? 'border-success' : 'border-primary'}`}>
      <div className="card-header bg-light">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <i className={`fas fa-${getElementIcon(element.element_type)} me-2 text-primary`}></i>
            <span className="fw-medium">{getElementTitle(element.element_type)}</span>
          </div>
          <div className="d-flex align-items-center">
            {completed && (
              <span className="badge bg-success me-2">
                <i className="fas fa-check me-1"></i>
                Completed
              </span>
            )}
            <button
              className={`btn btn-sm ${completed ? 'btn-success' : canMarkComplete() ? 'btn-primary' : 'btn-secondary'}`}
              onClick={handleMarkComplete}
              disabled={completed || isCompleting || !canMarkComplete()}
            >
              {isCompleting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Marking...
                </>
              ) : completed ? (
                <>
                  <i className="fas fa-check me-1"></i>
                  Completed
                </>
              ) : (
                <>
                  <i className="fas fa-check me-1"></i>
                  Mark Complete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="card-body">
        {renderElement()}
      </div>
    </div>
  );
};

const getElementIcon = (type) => {
  switch (type) {
    case 'video': return 'video';
    case 'exercise': return 'pencil-alt';
    case 'simulation': return 'cogs';
    default: return 'question-circle';
  }
};

const getElementTitle = (type) => {
  switch (type) {
    case 'video': return 'Video';
    case 'exercise': return 'Exercise';
    case 'simulation': return 'Simulation';
    default: return 'Interactive Element';
  }
};

export default InteractiveElement;