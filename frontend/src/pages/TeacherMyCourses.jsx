import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API = "http://127.0.0.1:5000/api";

export default function TeacherMyCourses() {
  const [courses, setCourses] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${API}/teacher/my-courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(res.data);
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="container mt-4">
      <h2>My Courses</h2>
      {courses.length === 0 ? (
        <p>No courses found.</p>
      ) : (
        <ul className="list-group">
          {courses.map((c) => (
            <li key={c.id} className="list-group-item">
              <strong>{c.title}</strong> — KES {c.price}
              <div>
                <Link to={`/teacher/course/${c.id}/add-skill`} className="btn btn-sm btn-primary me-2 mt-2">
                  Add skill
                </Link>
                <Link to={`/teacher/course/${c.id}/students`} className="btn btn-sm btn-secondary mt-2">
                  View Students
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
