import React from "react";
import CourseReview from "../components/CourseReview";

export default function StudentCourseReview() {
  const courseId = 1; 

  return (
    <div>
      <h2>Course Reviews</h2>
      <CourseReviews courseId={courseId} />
    </div>
  );
}
