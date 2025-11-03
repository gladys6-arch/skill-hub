import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMySkills, updateSkill } from '../services/teacherService';

function TeacherSkills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSkill, setEditingSkill] = useState(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await getMySkills();
        setSkills(res.data);
      } catch (error) {
        console.error('Error fetching skills:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  const handleUpdateSkill = async (e) => {
    e.preventDefault();
    try {
      await updateSkill(editingSkill.id, editingSkill);
      setEditingSkill(null);
      const res = await getMySkills();
      setSkills(res.data);
      alert('Skill updated successfully');
    } catch (error) {
      alert('Error updating skill');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>My Skills</h3>
        <Link to="/teacher/add-skill" className="btn btn-success">Add New Skill</Link>
      </div>

      {skills.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Skill Name</th>
                <th>Description</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {skills.map(skill => (
                <tr key={skill.id}>
                  {editingSkill && editingSkill.id === skill.id ? (
                    <>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={editingSkill.name}
                          onChange={(e) =>
                            setEditingSkill({ ...editingSkill, name: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={editingSkill.description}
                          onChange={(e) =>
                            setEditingSkill({ ...editingSkill, description: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          value={editingSkill.price}
                          onChange={(e) =>
                            setEditingSkill({ ...editingSkill, price: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <button
                          className="btn btn-success btn-sm me-1"
                          onClick={handleUpdateSkill}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditingSkill(null)}
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{skill.name}</td>
                      <td>{skill.description}</td>
                      <td>${skill.price}</td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditingSkill(skill)}
                        >
                          Edit
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="alert alert-info">
          No skills created yet. <Link to="/teacher/add-skill">Create your first skill</Link>
        </div>
      )}
    </div>
  );
}

export default TeacherSkills;
