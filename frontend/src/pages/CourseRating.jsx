import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api';

export default function CourseRating() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingRating, setExistingRating] = useState(null);

  useEffect(() => {
    const fetchCourseAndRating = async () => {
      try {
        const token = localStorage.getItem('token');

        // Fetch course details
        const courseResponse = await axios.get(`${API_BASE_URL}/api/student/course/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourse(courseResponse.data);

        // Check if user already rated this course
        const ratingResponse = await axios.get(`${API_BASE_URL}/api/student/course/${courseId}/rating`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (ratingResponse.data) {
          setExistingRating(ratingResponse.data);
          setRating(ratingResponse.data.score);
          setReview(ratingResponse.data.review || '');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndRating();
  }, [courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const data = {
        course_id: courseId,
        score: rating,
        review: review.trim()
      };

      if (existingRating) {
        // Update existing rating
        await axios.put(`${API_BASE_URL}/api/student/rate`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Create new rating
        await axios.post(`${API_BASE_URL}/api/student/rate`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      alert('Rating submitted successfully!');
      navigate('/student/progress');
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="star-rating mb-3">
        <div className="d-flex justify-content-center align-items-center mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="btn p-0 me-1 border-0 bg-transparent"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              style={{
                fontSize: '2.5rem',
                color: star <= (hoverRating || rating) ? '#ffc107' : '#e9ecef',
                transition: 'color 0.2s ease',
                filter: star <= (hoverRating || rating) ? 'drop-shadow(0 0 2px rgba(255, 193, 7, 0.3))' : 'none'
              }}
              aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
            >
              ★
            </button>
          ))}
        </div>
        <div className="text-center">
          <span className="text-muted fw-medium">
            {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'Click to rate'}
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          Course not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ marginTop: '120px' }}>
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">
                <i className="fas fa-star me-2"></i>
                Rate Course: {course.title}
              </h3>
            </div>
            <div className="card-body">
              <div className="text-center mb-4">
                <div className="mb-3">
                  <i className="fas fa-book-open fa-3x text-primary mb-3"></i>
                  <h5>{course.title}</h5>
                  <p className="text-muted">by {course.teacher_name}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-bold">Your Rating</label>
                  <div className="text-center">
                    {renderStars()}
                  </div>
                  <small className="text-muted">
                    Click on the stars to rate this course
                  </small>
                </div>

                <div className="mb-4">
                  <label htmlFor="review" className="form-label fw-bold">
                    Your Review (Optional)
                  </label>
                  <textarea
                    id="review"
                    className="form-control"
                    rows="4"
                    placeholder="Share your thoughts about this course..."
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    maxLength="500"
                  ></textarea>
                  <small className="text-muted">
                    {review.length}/500 characters
                  </small>
                </div>

                <div className="d-flex gap-2 justify-content-center">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/student/progress')}
                    disabled={submitting}
                  >
                    <i className="fas fa-arrow-left me-1"></i>
                    Back to Progress
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting || rating === 0}
                  >
                    {submitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-1"></i>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-1"></i>
                        {existingRating ? 'Update Rating' : 'Submit Rating'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-body">
              <h6 className="fw-bold mb-2">Rating Guidelines:</h6>
              <ul className="small text-muted mb-0">
                <li><strong>5 stars:</strong> Excellent course, highly recommend</li>
                <li><strong>4 stars:</strong> Very good course with minor improvements needed</li>
                <li><strong>3 stars:</strong> Good course, meets basic expectations</li>
                <li><strong>2 stars:</strong> Fair course with significant issues</li>
                <li><strong>1 star:</strong> Poor course, not recommended</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}