import React, { useEffect, useState } from 'react';
import { getAllUsers, deleteUser } from '../services/adminService';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);

  const fetchData = async () => {
    const res = await getAllUsers();
    setUsers(res.data);
  };

  useEffect(() => { fetchData(); }, []);

  const removeUser = async (id) => {
    await deleteUser(id);
    fetchData();
  };

  return (
    <div className="container mt-4">
      <h3>User Management</h3>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} ({user.role})
            <button onClick={() => removeUser(user.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
