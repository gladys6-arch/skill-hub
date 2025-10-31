import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers, deleteUser, getTeachers, getStudents } from '../services/adminService';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  const fetchData = async () => {
    try {
      const [usersRes, teachersRes, studentsRes] = await Promise.all([
        getAllUsers(),
        getTeachers(),
        getStudents()
      ]);
      setUsers(usersRes.data);
      setTeachers(teachersRes.data);
      setStudents(studentsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const removeUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const renderUserList = (userList) => (
    <div className="table-responsive">
      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {userList.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.full_name}</td>
              <td>{user.email}</td>
              <td><span className={`badge bg-${user.role === 'teacher' ? 'primary' : 'success'}`}>{user.role}</span></td>
              <td>
                <Link 
                  to={`/admin/${user.role}s/${user.id}/details`} 
                  className="btn btn-info btn-sm me-2"
                >
                  View Details
                </Link>
                <button 
                  className="btn btn-danger btn-sm" 
                  onClick={() => removeUser(user.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="container mt-4">
      <h3>User Management</h3>
      
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Users ({users.length})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'teachers' ? 'active' : ''}`}
            onClick={() => setActiveTab('teachers')}
          >
            Teachers ({teachers.length})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            Students ({students.length})
          </button>
        </li>
      </ul>

      {activeTab === 'all' && renderUserList(users)}
      {activeTab === 'teachers' && renderUserList(teachers)}
      {activeTab === 'students' && renderUserList(students)}
    </div>
  );
}
