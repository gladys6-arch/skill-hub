import React, { useEffect, useState } from "react";
import axios from "axios";

const CourseProgress = ({ studentId, courseId }) => {
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = "http://127.0.0.1:5000"; // adjust if using render/vercel/backend URL

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/student/progress/${studentId}/${courseId}`
        );
        setProgress(response.data.progress);
        setCompleted(response.data.completed);
      } catch (error) {
        console.error("Error fetching progress:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [studentId, courseId]);

  const handleDownloadCertificate = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/student/download_certificate/${studentId}/${courseId}`,
        {
          responseType: "blob", // ensures it downloads file properly
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Certificate_${courseId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading certificate:", error);
      alert("Certificate not available yet!");
    }
  };

  if (loading) return <p>Loading progress...</p>;

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-2">Course Progress</h2>
      <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
        <div
          className="bg-green-500 h-4 rounded-full transition-all duration-700"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-sm mb-4">Progress: {progress}%</p>

      {completed ? (
        <button
          onClick={handleDownloadCertificate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Download Certificate
        </button>
      ) : (
        <p className="text-gray-600">Keep learning to earn your certificate!</p>
      )}
    </div>
  );
};

export default CourseProgress;
