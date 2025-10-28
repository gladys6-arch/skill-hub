import React from "react";
import { useAuth } from "../context/AuthContext.jsx";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav style={styles.nav}>
      <div style={styles.logoArea}>
        <h2 style={{ margin: 0 }}>SkillHub</h2>
      </div>

      {user && (
        <div style={styles.userArea}>
          <span style={styles.welcome}>
            Welcome, {user.full_name || user.email}
          </span>
          <button onClick={logout} style={styles.button}>Logout</button>
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    borderBottom: "1px solid #ccc",
  },
  logoArea: {
    display: "flex",
    alignItems: "center",
  },
  userArea: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  welcome: {
    color: "#333",
    fontWeight: "bold",
  },
  button: {
    background: "none",
    border: "1px solid #333",
    borderRadius: "4px",
    padding: "5px 10px",
    cursor: "pointer",
  },
};

export default Navbar;