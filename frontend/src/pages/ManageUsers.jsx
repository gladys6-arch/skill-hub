import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers, deleteUser, getTeachers, getStudents } from '../services/adminService';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
    } finally {
      setLoading(false);
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

  const filterUsers = (userList) => {
    return userList.filter(user => 
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const renderUserList = (userList) => {
    const filteredUsers = filterUsers(userList);
    
    if (filteredUsers.length === 0) {
      return (
        <div className="text-center py-5">
          <i className="fas fa-users fa-3x text-muted mb-3"></i>
          <h5 className="text-muted">No users found</h5>
          <p className="text-muted">Try adjusting your search criteria</p>
        </div>
      );
    }

    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 fw-bold">
                    <i className="fas fa-hashtag me-2"></i>ID
                  </th>
                  <th className="border-0 fw-bold">
                    <i className="fas fa-user me-2"></i>Name
                  </th>
                  <th className="border-0 fw-bold">
                    <i className="fas fa-envelope me-2"></i>Email
                  </th>
                  <th className="border-0 fw-bold">
                    <i className="fas fa-tag me-2"></i>Role
                  </th>
                  <th className="border-0 fw-bold">
                    <i className="fas fa-cogs me-2"></i>Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td className="align-middle">
                      <span className="badge bg-light text-dark">{user.id}</span>
                    </td>
                    <td className="align-middle">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary rounded-circle p-2 me-3">
                          <i className={`fas ${user.role === 'teacher' ? 'fa-chalkboard-teacher' : 'fa-user-graduate'} text-white`}></i>
                        </div>
                        <div>
                          <div className="fw-medium">{user.full_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="align-middle">
                      <span className="text-muted">{user.email}</span>
                    </td>
                    <td className="align-middle">
                      <span className={`badge ${user.role === 'teacher' ? 'bg-primary' : user.role === 'student' ? 'bg-info' : 'bg-secondary'}`}>
                        <i className={`fas ${user.role === 'teacher' ? 'fa-chalkboard-teacher' : user.role === 'student' ? 'fa-user-graduate' : 'fa-user-shield'} me-1`}></i>
                        {user.role}
                      </span>
                    </td>
                    <td className="align-middle">
                      <div className="btn-group" role="group">
                        <Link 
                          to={`/admin/${user.role}s/${user.id}/details`} 
                          className="btn btn-outline-primary btn-sm"
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </Link>
                        <button 
                          className="btn btn-outline-danger btn-sm" 
                          onClick={() => removeUser(user.id)}
                          title="Delete User"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading users...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 className="mb-1">User Management</h2>
              <p className="text-muted mb-0">Manage all platform users, teachers, and students</p>
            </div>
            <Link to="/admin/register-teacher" className="btn btn-success">
              <i className="fas fa-user-plus me-2"></i>
              Add Teacher
            </Link>
          </div>

          {/* Search Bar */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="fas fa-search text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Search users by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-6 text-md-end mt-3 mt-md-0">
                  <div className="d-flex justify-content-md-end gap-3">
                    <div className="text-center">
                      <div className="h5 mb-0 text-primary">{users.length}</div>
                      <small className="text-muted">Total Users</small>
                    </div>
                    <div className="text-center">
                      <div className="h5 mb-0 text-info">{teachers.length}</div>
                      <small className="text-muted">Teachers</small>
                    </div>
                    <div className="text-center">
                      <div className="h5 mb-0 text-success">{students.length}</div>
                      <small className="text-muted">Students</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <ul className="nav nav-tabs card-header-tabs mb-0">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                  >
                    <i className="fas fa-users me-2"></i>
                    All Users
                    <span className="badge bg-primary ms-2">{users.length}</span>
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'teachers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('teachers')}
                  >
                    <i className="fas fa-chalkboard-teacher me-2"></i>
                    Teachers
                    <span className="badge bg-info ms-2">{teachers.length}</span>
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'students' ? 'active' : ''}`}
                    onClick={() => setActiveTab('students')}
                  >
                    <i className="fas fa-user-graduate me-2"></i>
                    Students
                    <span className="badge bg-success ms-2">{students.length}</span>
                  </button>
                </li>
              </ul>
            </div>
            
            <div className="card-body p-0">
              {activeTab === 'all' && renderUserList(users)}
              {activeTab === 'teachers' && renderUserList(teachers)}
              {activeTab === 'students' && renderUserList(students)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}