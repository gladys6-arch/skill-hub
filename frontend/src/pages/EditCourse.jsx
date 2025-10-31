import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourse, updateCourse, getCourseModules } from '../services/teacherService';

export default function EditCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState({ title: '', description: '', price: '' });
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, modulesRes] = await Promise.all([
          getCourse(courseId),
          getCourseModules(courseId)
        ]);
        setCourse(courseRes.data);
        setModules(modulesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateCourse(courseId, course);
      alert('Course updated successfully');
      navigate('/teacher/courses');
    } catch (error) {
      alert('Error updating course');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mt-4">
      <h3>Edit Course</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            value={course.title}
            onChange={(e) => setCourse({...course, title: e.target.value})}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            value={course.description}
            onChange={(e) => setCourse({...course, description: e.target.value})}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Price</label>
          <input
            type="number"
            className="form-control"
            value={course.price}
            onChange={(e) => setCourse({...course, price: e.target.value})}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary me-2">Update Course</button>
        <button type="button" className="btn btn-secondary" onClick={() => navigate('/teacher/courses')}>
          Cancel
        </button>
      </form>

      <hr className="my-4" />
      
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Course Modules</h4>
        <button 
          className="btn btn-success"
          onClick={() => navigate(`/teacher/courses/${courseId}/modules`)}
        >
          Manage Modules
        </button>
      </div>
      
      {modules.length > 0 ? (
        <div className="list-group">
          {modules.map(module => (
            <div key={module.id} className="list-group-item">
              <h6>{module.title}</h6>
              <p className="mb-1">{module.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No modules added yet.</p>
      )}
    </div>
  );
}