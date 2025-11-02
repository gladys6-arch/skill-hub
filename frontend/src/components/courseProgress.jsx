import React, { useEffect, useState } from "react";
import axios from "axios";

const CourseProgress = ({ studentId, courseId, onProgressUpdate }) => {
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);

  const BACKEND_URL = "http://127.0.0.1:5000"; // adjust if using render/vercel/backend URL

  const fetchProgress = async () => {
    try {
      // Use the new validated course progress endpoint
      const response = await axios.get(
        `${BACKEND_URL}/api/student/course-progress/${courseId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setProgress(response.data.overall_progress);
      setCompleted(response.data.completed);

      // Store additional progress breakdown if available
      if (response.data.module_progress !== undefined) {
        // Could store this in state if needed for more detailed display
      }

      // Fetch module details with validation status
      const modulesResponse = await axios.get(
        `${BACKEND_URL}/api/student/courses/${courseId}/modules`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setModules(modulesResponse.data.modules);
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [studentId, courseId]);

  useEffect(() => {
    if (onProgressUpdate) {
      fetchProgress();
    }
  }, [onProgressUpdate]);

  const handleDownloadCertificate = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/student/certificate/${courseId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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
      alert("Certificate not available yet! Complete all modules and pass the final quiz.");
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
      {progress < 100 && (
        <div className="text-xs text-gray-600 mb-2">
          <div>Modules: {Math.round((progress / 100) * 75)}% of 75%</div>
          <div>Final Quiz: {Math.round((progress / 100) * 25)}% of 25%</div>
        </div>
      )}

      {/* Module-level progress with validation status */}
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Module Progress</h3>
        <div className="space-y-2">
          {modules.map((module, index) => (
            <div key={module.id} className="flex items-center justify-between">
              <span className="text-sm">
                {index + 1}. {module.title}
                {module.validation_errors && module.validation_errors.length > 0 && (
                  <span className="text-red-500 text-xs ml-2">
                    ({module.validation_errors.length} issues)
                  </span>
                )}
              </span>
              {module.is_completed ? (
                <i className="fas fa-check-circle text-green-500"></i>
              ) : module.is_current ? (
                <i className="fas fa-play-circle text-blue-500"></i>
              ) : (
                <i className="fas fa-circle text-gray-400"></i>
              )}
            </div>
          ))}
        </div>
      </div>

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
