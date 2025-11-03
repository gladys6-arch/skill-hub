import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import CourseReview from "../components/CourseReview";

export default function StudentCourseReviews() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  return (
    <div>
      <button 
        className="btn btn-outline-primary mb-3"
        onClick={() => navigate('/student/dashboard')}
      >
        <i className="fas fa-arrow-left me-1"></i>
        Back to Dashboard
      </button>
      <h2>Course Reviews</h2>
      <CourseReview courseId={parseInt(courseId)} />
    </div>
  );
}
