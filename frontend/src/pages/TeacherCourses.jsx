import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyCourses } from '../services/teacherService';

export default function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await getMyCourses();
        setCourses(res.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>My Courses</h3>
        <Link to="/teacher/add-course" className="btn btn-success">Add New Course</Link>
      </div>

      {courses.length > 0 ? (
        <div className="row">
          {courses.map(course => (
            <div key={course.id} className="col-md-4 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{course.title}</h5>
                  <p className="card-text">{course.description}</p>
                  <p className="card-text"><strong>Price: ${course.price}</strong></p>
                  <div className="d-flex gap-2 flex-wrap">
                    <Link to={`/teacher/courses/${course.id}/modules`} className="btn btn-primary btn-sm">
                      Manage Modules
                    </Link>
                    <Link to={`/teacher/courses/${course.id}/add-quiz`} className="btn btn-warning btn-sm">
                      <i className="fas fa-question-circle me-1"></i>
                      Add Quiz
                    </Link>
                    <Link to={`/teacher/courses/${course.id}/edit`} className="btn btn-secondary btn-sm">
                      Edit Course
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info">
          No courses created yet. <Link to="/teacher/add-course">Create your first course</Link>
        </div>
      )}
    </div>
  );
}