import React, { useEffect, useState } from "react";
import { getMyCourses } from "../services/teacherService";


export default function TeacherDashboard() {
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, progressRes] = await Promise.all([
          getMyCourses(),
          getStudentsProgress()
        ]);

        setCourses(coursesRes.data);
        setProgress(progressRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="container mt-4">Loading...</div>;
  if (error) return <div className="container mt-4 text-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h3>Teacher Dashboard</h3>

      <div className="row mb-4">
        <div className="col-md-6">
          <h5>My Courses</h5>
          {courses.length > 0 ? (
            <ul className="list-group">
              {courses.map((course) => (
                <li key={course.id} className="list-group-item d-flex justify-content-between align-items-center">
                  {course.title}
                  <Link to={`/teacher/courses/${course.id}/edit`} className="btn btn-sm btn-secondary">
                    Edit
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="alert alert-info">
              No courses created yet. <Link to="/teacher/add-course">Create your first course</Link>
            </div>
          )}
        </div>

        <div className="col-md-6">
          <h5>Student Progress</h5>
          {progress.length > 0 ? (
            <ul className="list-group">
              {progress.map((p, index) => (
                <li key={index} className="list-group-item">
                  {p.student_name} - {p.course_title || p.skill_name}: {p.progress}%
                </li>
              ))}
            </ul>
          ) : (
            <div className="alert alert-info">No student progress data available.</div>
          )}
        </div>
      </div>
    </div>
  );
}
