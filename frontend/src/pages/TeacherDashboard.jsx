import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyCourses, getStudentsProgress, getTeacherRequests } from "../services/teacherService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';


export default function TeacherDashboard() {
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculate metrics from progress data
  const calculateMetrics = (progressData) => {
    const totalEnrollments = progressData.length;
    const completedEnrollments = progressData.filter(p => p.completed).length;
    const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments * 100).toFixed(1) : 0;

    const uniqueStudents = new Set(progressData.map(p => p.student_email)).size;
    const averageProgress = totalEnrollments > 0 ? (progressData.reduce((sum, p) => sum + p.progress, 0) / totalEnrollments).toFixed(1) : 0;

    // Group by item type for charts
    const courseProgress = progressData.filter(p => p.item_type === 'course');
    const skillProgress = progressData.filter(p => p.item_type === 'skill');

    const courseCompletionRate = courseProgress.length > 0 ? (courseProgress.filter(p => p.completed).length / courseProgress.length * 100).toFixed(1) : 0;
    const skillCompletionRate = skillProgress.length > 0 ? (skillProgress.filter(p => p.completed).length / skillProgress.length * 100).toFixed(1) : 0;

    return {
      totalEnrollments,
      completedEnrollments,
      completionRate,
      uniqueStudents,
      averageProgress,
      courseCompletionRate,
      skillCompletionRate,
      courseEnrollments: courseProgress.length,
      skillEnrollments: skillProgress.length
    };
  };

  const metrics = calculateMetrics(progress);

  // Data for charts
  const completionData = [
    { name: 'Completed', value: metrics.completedEnrollments },
    { name: 'In Progress', value: metrics.totalEnrollments - metrics.completedEnrollments }
  ];

  const typeData = [
    { name: 'Courses', value: metrics.courseEnrollments },
    { name: 'Skills', value: metrics.skillEnrollments }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, progressRes, requestsRes] = await Promise.all([
          getMyCourses(),
          getStudentsProgress(),
          getTeacherRequests()
        ]);

        setCourses(coursesRes.data);
        setProgress(progressRes.data);

        const pending = requestsRes.data.filter(r => r.status === 'pending');
        setPendingRequests(pending);
        setShowNotification(pending.length > 0);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.response?.data?.message || "Failed to load dashboard data. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return (
    <div className="container mt-4">
      <div className="d-flex justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
      <p className="text-center mt-2">Loading dashboard data...</p>
    </div>
  );

  if (error) return (
    <div className="container mt-4">
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Error Loading Dashboard</h4>
        <p>{error}</p>
        <hr />
        <p className="mb-0">Please try refreshing the page or contact support if the problem persists.</p>
      </div>
    </div>
  );

  return (
    <div className="container mt-4">
      <Link to="/" className="back-button">Back to Home</Link>
      <h3>Teacher Dashboard</h3>

      {/* Notification for pending requests */}
      {showNotification && (
        <div className="alert alert-info alert-dismissible fade show" role="alert">
          <strong>📚 New Study Session Request!</strong> You have {pendingRequests.length} pending student request{pendingRequests.length > 1 ? 's' : ''} for study sessions.
          <Link to="/teacher/requests" className="alert-link ms-2">View Requests</Link>
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowNotification(false)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* <div className="mb-4">
        <Link to="/teacher/add-skill" className="btn btn-primary me-2">Add New Skill</Link>
        <Link to="/teacher/add-course" className="btn btn-success me-2">Add New Course</Link>
        <Link to="/teacher/requests" className="btn btn-warning me-2">Student Requests</Link>
        <Link to="/teacher/sessions" className="btn btn-info me-2">Chat Sessions</Link>
        <Link to="/teacher/balance" className="btn btn-secondary me-2">View Balance</Link>
        <Link to="/teacher/subscription" className="btn btn-dark">View Subscription</Link>
      </div> */}

      {/* Student Progress Metrics */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">{metrics.uniqueStudents}</h5>
              <p className="card-text">Enrolled Students</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">{metrics.totalEnrollments}</h5>
              <p className="card-text">Total Enrollments</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">{metrics.completionRate}%</h5>
              <p className="card-text">Overall Completion Rate</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">{metrics.averageProgress}%</h5>
              <p className="card-text">Average Progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="row mb-4">
        <div className="col-md-6">
          <h5>Completion Status</h5>
          <PieChart width={400} height={300}>
            <Pie
              data={completionData}
              cx={200}
              cy={150}
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {completionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
        <div className="col-md-6">
          <h5>Enrollments by Type</h5>
          <BarChart width={400} height={300} data={typeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </div>
      </div>

      {/* Detailed Progress Table */}
      <div className="row mb-4">
        <div className="col-12">
          <h5>Detailed Student Progress</h5>
          {progress.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Item Type</th>
                    <th>Item Name</th>
                    <th>Progress</th>
                    <th>Status</th>
                    <th>Date Enrolled</th>
                  </tr>
                </thead>
                <tbody>
                  {progress.map((p, index) => (
                    <tr key={index}>
                      <td>{p.student_name}</td>
                      <td>{p.student_email}</td>
                      <td>{p.item_type}</td>
                      <td>{p.item_name}</td>
                      <td>
                        <div className="progress" style={{ width: '100px' }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${p.progress}%` }}
                            aria-valuenow={p.progress}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          >
                            {p.progress}%
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${p.completed ? 'bg-success' : 'bg-warning'}`}>
                          {p.completed ? 'Completed' : 'In Progress'}
                        </span>
                      </td>
                      <td>{p.date_enrolled}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-info">No student progress data available.</div>
          )}
        </div>
      </div>

      {/* My Courses Section */}
      <div className="row">
        <div className="col-md-6">
          <h5>My Courses</h5>
          {courses.length > 0 ? (
            <ul className="list-group">
              {courses.map((course) => (
                <li key={course.id} className="list-group-item d-flex justify-content-between align-items-center">
                  {course.title}
                  <div>
                    <Link to={`/teacher/courses/${course.id}/add-module`} className="btn btn-sm btn-primary me-2">
                      Add Module
                    </Link>
                    <Link to={`/teacher/courses/${course.id}/edit`} className="btn btn-sm btn-secondary">
                      Edit
                    </Link>
                  </div>
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
          <h5>Completion Rates by Type</h5>
          <div className="card">
            <div className="card-body">
              <p><strong>Courses:</strong> {metrics.courseCompletionRate}% completion rate ({metrics.courseEnrollments} enrollments)</p>
              <p><strong>Skills:</strong> {metrics.skillCompletionRate}% completion rate ({metrics.skillEnrollments} enrollments)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
