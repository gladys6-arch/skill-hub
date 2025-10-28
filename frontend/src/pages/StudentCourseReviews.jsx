import React from "react";
import CourseReviews from "../components/CourseReviews";

export default function StudentCourseReviews() {
  const courseId = 1; // replace with dynamic id or selection later

  return (
    <div>
      <h2>Course Reviews</h2>
      <CourseReviews courseId={courseId} />
    </div>
  );
}
