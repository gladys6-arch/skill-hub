import React from "react";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Welcome to Skill Hub</h1>
        <p>A platform for connecting learners and teachers to share skills and knowledge.</p>
      </header>

      <main style={styles.main}>
        <section style={styles.section}>
          <h2>Get Started</h2>
          <p>
            Join Skill Hub today — register as a teacher or a student, log in, and start
            sharing or learning new skills.
          </p>
          <div style={styles.buttonGroup}>
            <Link to="/login" style={styles.button}>Login</Link>
            <Link to="/register" style={styles.button}>Register</Link>
          </div>
        </section>
      </main>

      <footer style={styles.footer}>
        <p>© {new Date().getFullYear()} SkillSwap. All rights reserved.</p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "#f8f8f8",
    color: "#333",
  },
  header: {
    textAlign: "center",
    padding: "60px 20px 20px",
    backgroundColor: "#4a90e2",
    color: "white",
  },
  main: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 20px",
  },
  section: {
    maxWidth: "600px",
    textAlign: "center",
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  buttonGroup: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "center",
    gap: "10px",
  },
  button: {
    textDecoration: "none",
    color: "white",
    backgroundColor: "#4a90e2",
    padding: "10px 20px",
    borderRadius: "4px",
    fontWeight: "bold",
  },
  footer: {
    textAlign: "center",
    padding: "15px",
    backgroundColor: "#eee",
    fontSize: "14px",
  },
};

export default HomePage;
