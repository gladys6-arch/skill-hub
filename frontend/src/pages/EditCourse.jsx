import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourse, updateCourse, getCourseModules } from "../services/teacherService";

export default function EditCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Fetch course details and modules on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await getCourse(courseId);
        setCourse(courseRes.data);

        const modulesRes = await getCourseModules(courseId);
        setModules(modulesRes.data);
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Failed to load course data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse({ ...course, [name]: value });
  };

  // Save updated course
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCourse(courseId, course);
      navigate(`/teacher/courses`); // go back to course list
    } catch (err) {
      console.error("Error updating course:", err);
      setError("Failed to update course.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container mt-4">Loading...</div>;
  if (error) return <div className="container mt-4 text-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h3>Edit Course</h3>
      <div className="mb-3">
        <label className="form-label">Title</label>
        <input
          type="text"
          className="form-control"
          name="title"
          value={course.title || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Description</label>
        <textarea
          className="form-control"
          name="description"
          value={course.description || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Price</label>
        <input
          type="number"
          className="form-control"
          name="price"
          value={course.price || 0}
          onChange={handleChange}
        />
      </div>

      <button
        className="btn btn-primary"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>

      <h4 className="mt-5">Modules</h4>
      {modules.length > 0 ? (
        <ul className="list-group">
          {modules.map((mod) => (
            <li key={mod.id} className="list-group-item">
              {mod.title}
            </li>
          ))}
        </ul>
      ) : (
        <p>No modules yet for this course.</p>
      )}
    </div>
  );
}
