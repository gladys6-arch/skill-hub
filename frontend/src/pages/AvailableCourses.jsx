import React, { useEffect, useState } from 'react';
import { getCourses } from '../services/studentService';

export default function AvailableCourses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => { 
    getCourses().then(res => setCourses(res.data));
  }, []);

  return (
    <div className="container mt-4">
      <h3>Available Courses</h3>
      <ul>
        {courses.map((c) => (
          <li key={c.id}>{c.title}</li>
        ))}
      </ul>
    </div>
  );
}
