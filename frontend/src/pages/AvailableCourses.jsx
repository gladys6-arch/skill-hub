// src/pages/AvailableCourses.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCourses, enrollInCourse, enrollInSkill } from "../services/studentService";

export default function AvailableCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleEnroll = async (courseId) => {
    try {
      if (String(courseId).startsWith('skill_')) {
        const skillId = courseId.replace('skill_', '');
        await enrollInSkill(skillId);
        alert('Successfully enrolled in skill!');
      } else {
        await enrollInCourse(courseId);
        alert('Successfully enrolled in course!');
      }
    } catch (err) {
      alert('Enrollment failed: ' + (err.response?.data?.msg || err.message));
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

  if (loading) return <p>Loading courses...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="container mt-4">
      <h3>Available Courses</h3>

      {courses.length === 0 ? (
        <p>No courses available yet.</p>
      ) : (
        <div className="row">
          {courses.map((course) => (
            <div key={course.id} className="col-md-4 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title">{course.title}</h5>
                  <p className="card-text">
                    {course.description?.length > 100
                      ? course.description.substring(0, 100) + "..."
                      : course.description}
                  </p>
                  <p>
                    <strong>Teacher:</strong>{" "}
                    {course.teacher_name || "Unknown"}
                  </p>
                  <p>
                    <strong>Price:</strong> KES {course.price || "Free"}
                  </p>
                  {/* <button
                    className="btn btn-primary me-2"
                    onClick={() => navigate(`/student/course/${course.id}`)}
                  >
                    View Details
                  </button> */}
                  <button
                    className="btn btn-success"
                    onClick={() => handleEnroll(course.id)}
                  >
                    Enroll
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
