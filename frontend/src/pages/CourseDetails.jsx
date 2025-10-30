import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API = "http://127.0.0.1:5000/api"; // adjust if your backend URL is different

export default function CourseDetails() {
  const { id } = useParams(); // get course ID from URL
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  // Fetch the selected course by ID
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axios.get(`${API}/student/course/${id}`);
        setCourse(res.data);
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Could not load course details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const handlePayment = async () => {
    if (!course) return;
    setIsPaying(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API}/payment/initiate`,
        { amount: course.price, course_id: course.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("M-Pesa payment initiated! Please check your phone.");
      console.log("Payment response:", res.data);
    } catch (err) {
      console.error("Payment error:", err);
      alert("Failed to start payment. Try again.");
    } finally {
      setIsPaying(false);
    }
  };

  if (loading) return <p>Loading course details...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!course) return <p>Course not found.</p>;

  return (
    <div className="container mt-4">
      <div className="card shadow p-4">
        <h2>{course.title}</h2>
        <p>{course.description}</p>
        <p>
          <strong>Teacher:</strong> {course.teacher_name || "Unknown"}
        </p>
        <p>
          <strong>Price:</strong> KES {course.price}
        </p>

        <button
          className="btn btn-success"
          onClick={handlePayment}
          disabled={isPaying}
        >
          {isPaying ? "Processing Payment..." : "Start Course (Pay with M-Pesa)"}
        </button>
      </div>
    </div>
  );
}
