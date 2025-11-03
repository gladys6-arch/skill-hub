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
      const phoneNumber = prompt("Enter M-Pesa phone number (254XXXXXXXXX):\nFor sandbox testing use: 254708374149");
      
      if (!phoneNumber) {
        setIsPaying(false);
        return;
      }
      
      console.log(`Initiating payment for phone: ${phoneNumber}`);
      
      const res = await axios.post(
        `${API}/payment/pay`,
        { 
          course_id: course.id,
          phone_number: phoneNumber
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const checkoutRequestId = res.data.checkout_request_id;
      
      // Poll payment status every 5 seconds
      const pollStatus = setInterval(async () => {
        try {
          const statusRes = await axios.post(
            `${API}/payment/verify-and-enroll/${checkoutRequestId}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          if (statusRes.data.status === 'paid' && statusRes.data.enrolled) {
            clearInterval(pollStatus);
            alert("Payment successful! You are now enrolled and can access the course.");
            window.location.href = '/student/progress';
          }
        } catch (err) {
          console.error("Status check error:", err);
        }
      }, 5000);

      // Stop polling after 2 minutes
      setTimeout(() => clearInterval(pollStatus), 120000);
      
      alert(`M-Pesa payment initiated for ${phoneNumber}! Please check your phone.\nIf using sandbox, use test number: 254708374149`);
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
