import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStudentDetails } from '../services/adminService';

export default function StudentDetails() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await getStudentDetails(id);
        setStudent(res.data);
      } catch (error) {
        console.error('Error fetching student details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!student) return <div>Student not found</div>;

  return (
    <div className="container mt-4">
      <Link to="/admin/manage-users" className="btn btn-secondary mb-3">← Back to Users</Link>
      
      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h4>Student Information</h4>
            </div>
            <div className="card-body">
              <p><strong>Name:</strong> {student.full_name}</p>
              <p><strong>Email:</strong> {student.email}</p>
              <p><strong>Total Spent:</strong> ${student.total_spent || 0}</p>
              <p><strong>Courses:</strong> {student.completed_courses_count}/{student.total_courses}</p>
              <p><strong>Skills:</strong> {student.completed_skills_count}/{student.total_skills}</p>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card mb-3">
            <div className="card-header">
              <h5>Course Progress</h5>
            </div>
            <div className="card-body">
              {student.course_progress?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Progress</th>
                        <th>Status</th>
                        <th>Enrolled</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.course_progress.map(course => (
                        <tr key={course.course_id}>
                          <td>{course.course_title}</td>
                          <td>
                            <div className="progress">
                              <div 
                                className="progress-bar" 
                                style={{width: `${course.progress}%`}}
                              >
                                {course.progress}%
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge bg-${course.completed ? 'success' : 'warning'}`}>
                              {course.completed ? 'Completed' : 'In Progress'}
                            </span>
                          </td>
                          <td>{course.date_enrolled}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No courses enrolled</p>
              )}
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-header">
              <h5>Skill Progress</h5>
            </div>
            <div className="card-body">
              {student.skill_progress?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Skill</th>
                        <th>Progress</th>
                        <th>Status</th>
                        <th>Enrolled</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.skill_progress.map(skill => (
                        <tr key={skill.skill_id}>
                          <td>{skill.skill_name}</td>
                          <td>
                            <div className="progress">
                              <div 
                                className="progress-bar" 
                                style={{width: `${skill.progress}%`}}
                              >
                                {skill.progress}%
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge bg-${skill.completed ? 'success' : 'warning'}`}>
                              {skill.completed ? 'Completed' : 'In Progress'}
                            </span>
                          </td>
                          <td>{skill.date_enrolled}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No skills enrolled</p>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h5>Payment History</h5>
            </div>
            <div className="card-body">
              {student.payment_history?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.payment_history.map((payment, index) => (
                        <tr key={index}>
                          <td>{payment.item_name}</td>
                          <td>
                            <span className={`badge bg-${payment.payment_type === 'course' ? 'primary' : 'info'}`}>
                              {payment.payment_type}
                            </span>
                          </td>
                          <td>${payment.amount}</td>
                          <td>
                            <span className="badge bg-success">{payment.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No payments made</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}