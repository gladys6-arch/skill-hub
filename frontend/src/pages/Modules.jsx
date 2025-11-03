import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseModules, addModule, updateModule } from '../services/teacherService';

export default function Modules() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [newModule, setNewModule] = useState({ title: '', content: '' });
  const [editingModule, setEditingModule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModules();
  }, [courseId]);

  const fetchModules = async () => {
    try {
      const res = await getCourseModules(courseId);
      setModules(res.data);
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    try {
      await addModule(courseId, newModule);
      setNewModule({ title: '', content: '' });
      fetchModules();
      alert('Module added successfully');
    } catch (error) {
      alert('Error adding module');
    }
  };

  const handleUpdateModule = async (e) => {
    e.preventDefault();
    try {
      await updateModule(editingModule.id, editingModule);
      setEditingModule(null);
      fetchModules();
      alert('Module updated successfully');
    } catch (error) {
      alert('Error updating module');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Manage Modules</h3>
        <div>
          <button className="btn btn-primary me-2" onClick={() => navigate(`/teacher/courses/${courseId}/add-quiz`)}>
            <i className="fas fa-plus me-1"></i>
            Add Final Quiz
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/teacher/courses')}>Back to Courses</button>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <h5>Add New Module</h5>
          <form onSubmit={handleAddModule}>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Module Title"
                value={newModule.title}
                onChange={(e) => setNewModule({...newModule, title: e.target.value})}
                required
              />
            </div>
            <div className="mb-3">
              <textarea
                className="form-control"
                placeholder="Module Content"
                rows="4"
                value={newModule.content}
                onChange={(e) => setNewModule({...newModule, content: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="btn btn-success">Add Module</button>
          </form>
        </div>

        <div className="col-md-6">
          <h5>Existing Modules</h5>
          {modules.length > 0 ? (
            <div className="list-group">
              {modules.map(module => (
                <div key={module.id} className="list-group-item">
                  {editingModule && editingModule.id === module.id ? (
                    <form onSubmit={handleUpdateModule}>
                      <div className="mb-2">
                        <input
                          type="text"
                          className="form-control"
                          value={editingModule.title}
                          onChange={(e) => setEditingModule({...editingModule, title: e.target.value})}
                        />
                      </div>
                      <div className="mb-2">
                        <textarea
                          className="form-control"
                          rows="3"
                          value={editingModule.content}
                          onChange={(e) => setEditingModule({...editingModule, content: e.target.value})}
                        />
                      </div>
                      <button type="submit" className="btn btn-primary btn-sm me-2">Save</button>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingModule(null)}>Cancel</button>
                    </form>
                  ) : (
                    <>
                      <h6>{module.title}</h6>
                      <p className="mb-2">{module.content}</p>
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setEditingModule(module)}
                      >
                        Edit
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>No modules added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
