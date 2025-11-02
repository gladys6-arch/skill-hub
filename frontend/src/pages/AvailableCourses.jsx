// src/pages/AvailableCourses.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCourses, enrollInCourse, enrollInSkill, payForCourse } from "../services/studentService";

export default function AvailableCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentModal, setPaymentModal] = useState({ show: false, course: null });
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const navigate = useNavigate();

  const handleEnroll = async (courseId) => {
    try {
      if (String(courseId).startsWith('skill_')) {
        const skillId = courseId.replace('skill_', '');
        await enrollInSkill(skillId);
        alert('Successfully enrolled in skill!');
      } else {
        // Check if course has a price
        const course = courses.find(c => c.id === courseId);
        if (course && course.price && course.price > 0) {
          // Show payment modal for paid courses
          setPaymentModal({ show: true, course });
        } else {
          // Free course - enroll directly
          await enrollInCourse(courseId);
          alert('Successfully enrolled in course!');
        }
      }
    } catch (err) {
      alert('Enrollment failed: ' + (err.response?.data?.msg || err.message));
    }
  };

  const handlePayment = async () => {
    if (!phoneNumber || !phoneNumber.startsWith('254')) {
      alert('Please enter a valid phone number starting with 254');
      return;
    }

    setPaymentLoading(true);
    try {
      const response = await payForCourse(paymentModal.course.id, phoneNumber);
      alert('STK Push initiated! Please check your phone and enter your M-Pesa PIN to complete the payment.');
      setPaymentModal({ show: false, course: null });
      setPhoneNumber("");
    } catch (err) {
      alert('Payment initiation failed: ' + (err.response?.data?.msg || err.message));
    } finally {
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await getCourses();
        setCourses(res.data);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Failed to load courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) return (
    <div className="container section" style={{ marginTop: '120px', textAlign: 'center' }}>
      <p className="lux-accent">Loading courses...</p>
    </div>
  );
  if (error) return (
    <div className="container section" style={{ marginTop: '120px' }}>
      <div className="card">
        <div className="card-body">
          <p style={{ color: "red" }}>{error}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="courses-section">
      <h1 className="section-title lux-accent">Available Courses</h1>

      {courses.length === 0 ? (
        <p className="lux-accent">No courses available yet.</p>
      ) : (
        <div className="courses-grid">
          {courses.map((course) => (
            <div key={course.id} className="course-card">
              <div style={{ height: '220px', background: 'linear-gradient(135deg, #2a2a2a, #1a1a1a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#C7A76E', fontSize: '48px' }}>📚</span>
              </div>
              <div style={{ padding: '20px' }}>
                <h3>{course.title}</h3>
                <p>
                  {course.description?.length > 100
                    ? course.description.substring(0, 100) + "..."
                    : course.description}
                </p>
                <p style={{ color: '#C7A76E', fontSize: '14px', marginBottom: '15px' }}>
                  <strong>Teacher:</strong> {course.teacher_name || "Unknown"}
                </p>

                {/* Rating Display */}
                {course.average_rating > 0 && (
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          style={{
                            color: star <= course.average_rating ? '#ffc107' : '#e9ecef',
                            fontSize: '16px',
                            marginRight: '2px'
                          }}
                        >
                          ★
                        </span>
                      ))}
                      <span style={{ color: '#C7A76E', fontSize: '14px', marginLeft: '8px' }}>
                        {course.average_rating} ({course.rating_count} reviews)
                      </span>
                    </div>
                  </div>
                )}

                {/* Reviews Preview */}
                {course.reviews && course.reviews.length > 0 && (
                  <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: 'rgba(199,167,110,0.1)', borderRadius: '5px' }}>
                    <small style={{ color: '#C7A76E', fontWeight: 'bold' }}>Recent Reviews:</small>
                    {course.reviews.slice(0, 2).map((review, index) => (
                      <div key={index} style={{ marginTop: '5px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
                          <small style={{ color: '#fff', fontWeight: 'bold' }}>{review.student_name}:</small>
                          {review.rating && (
                            <small style={{ color: '#ffc107', marginLeft: '5px' }}>
                              {'★'.repeat(review.rating)}
                            </small>
                          )}
                        </div>
                        <small style={{ color: '#ccc' }}>
                          "{review.comment.length > 60 ? review.comment.substring(0, 60) + '...' : review.comment}"
                        </small>
                      </div>
                    ))}
                    {course.reviews.length > 2 && (
                      <small style={{ color: '#C7A76E', fontStyle: 'italic' }}>
                        +{course.reviews.length - 2} more reviews
                      </small>
                    )}
                  </div>
                )}

                <p style={{ color: '#C7A76E', fontSize: '14px', marginBottom: '20px' }}>
                  <strong>Price:</strong> KES {course.price || "Free"}
                </p>
                <button
                  className="course-btn"
                  onClick={() => handleEnroll(course.id)}
                >
                  {course.price && course.price > 0 ? 'Pay & Enroll' : 'Enroll Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Modal */}
      {paymentModal.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1a1a1a',
            padding: '30px',
            borderRadius: '10px',
            border: '1px solid #C7A76E',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ color: '#C7A76E', marginBottom: '20px' }}>Complete Payment</h3>
            <p style={{ marginBottom: '15px', color: '#fff' }}>
              Course: <strong>{paymentModal.course?.title}</strong>
            </p>
            <p style={{ marginBottom: '15px', color: '#fff' }}>
              Amount: <strong>KES {paymentModal.course?.price}</strong>
            </p>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#C7A76E' }}>
                M-Pesa Phone Number (254XXXXXXXXX):
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="254712345678"
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #C7A76E',
                  borderRadius: '5px',
                  color: '#fff',
                  fontSize: '16px'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handlePayment}
                disabled={paymentLoading}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#C7A76E',
                  color: '#000',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: paymentLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {paymentLoading ? 'Processing...' : 'Pay Now'}
              </button>
              <button
                onClick={() => {
                  setPaymentModal({ show: false, course: null });
                  setPhoneNumber("");
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#333',
                  color: '#fff',
                  border: '1px solid #C7A76E',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
