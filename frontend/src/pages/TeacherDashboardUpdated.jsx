import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyCourses, getMySkills, getTeacherRequests } from '../services/teacherService';

export default function TeacherDashboard() {
  const [stats, setStats] = useState({ courses: 0, skills: 0, requests: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [coursesRes, skillsRes, requestsRes] = await Promise.all([
          getMyCourses(),
          getMySkills(),
          getTeacherRequests()
        ]);
        setStats({
          courses: coursesRes.data.length,
          skills: skillsRes.data.length,
          requests: requestsRes.data.length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="container mt-4">
      <h2>Teacher Dashboard</h2>
      
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5>My Courses: {stats.courses}</h5>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5>My Skills: {stats.skills}</h5>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5>Student Requests: {stats.requests}</h5>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Course Management</h5>
            </div>
            <div className="card-body">
              <Link to="/teacher/courses" className="btn btn-primary me-2">My Courses</Link>
              <Link to="/teacher/add-course" className="btn btn-success">Add Course</Link>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Skill Management</h5>
            </div>
            <div className="card-body">
              <Link to="/teacher/skills" className="btn btn-primary me-2">My Skills</Link>
              <Link to="/teacher/add-skill" className="btn btn-success">Add Skill</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5>Student Interactions</h5>
            </div>
            <div className="card-body">
              <Link to="/teacher/requests" className="btn btn-info btn-sm">View Student Requests</Link>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5>Student Progress</h5>
            </div>
            <div className="card-body">
              <Link to="/teacher/students-progress" className="btn btn-warning btn-sm">View Student Progress</Link>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5>Earnings</h5>
            </div>
            <div className="card-body">
              <Link to="/teacher/balance" className="btn btn-success btn-sm">View My Earnings</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}