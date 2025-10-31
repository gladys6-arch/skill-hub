import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTeacherDetails } from '../services/adminService';

export default function TeacherDetails() {
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await getTeacherDetails(id);
        setTeacher(res.data);
      } catch (error) {
        console.error('Error fetching teacher details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeacher();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!teacher) return <div>Teacher not found</div>;

  return (
    <div className="container mt-4">
      <Link to="/admin/manage-users" className="btn btn-secondary mb-3">← Back to Users</Link>
      
      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h4>Teacher Information</h4>
            </div>
            <div className="card-body">
              <p><strong>Name:</strong> {teacher.full_name}</p>
              <p><strong>Email:</strong> {teacher.email}</p>
              <p><strong>Total Earnings:</strong> ${teacher.total_earnings || 0}</p>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card mb-3">
            <div className="card-header">
              <h5>Courses ({teacher.courses?.length || 0})</h5>
            </div>
            <div className="card-body">
              {teacher.courses?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Price</th>
                        <th>Enrolled</th>
                        <th>Completed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teacher.courses.map(course => (
                        <tr key={course.id}>
                          <td>{course.title}</td>
                          <td>${course.price}</td>
                          <td>{course.enrolled_students}</td>
                          <td>{course.completed_students}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No courses created yet</p>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h5>Skills ({teacher.skills?.length || 0})</h5>
            </div>
            <div className="card-body">
              {teacher.skills?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Skill</th>
                        <th>Price</th>
                        <th>Enrolled</th>
                        <th>Completed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teacher.skills.map(skill => (
                        <tr key={skill.id}>
                          <td>{skill.name}</td>
                          <td>${skill.price}</td>
                          <td>{skill.enrolled_students}</td>
                          <td>{skill.completed_students}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No skills created yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}