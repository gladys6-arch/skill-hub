import { useEffect, useState } from "react";
import { getAllUsers } from "./services/adminService";
import AdminRoutes from './Routes/AdminRoutes';
import TeacherRoutes from './Routes/TeacherRoutes';
import StudentRoutes from './Routes/StudentRoutes';
import Login from './pages/login';
import Register from './pages/register';


function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getAllUsers()
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: "1rem" }}>
      <h1>All Users</h1>
      {users.length > 0 ? (
        <ul>
          {users.map((user) => (
            <li key={user._id}>{user.name}</li>
          ))}
        </ul>
      ) : (
        <p>No users found.</p>
      )}
    </div>
  );
}

export default App;