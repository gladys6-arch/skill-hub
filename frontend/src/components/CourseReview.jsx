import React, { useState, useEffect } from "react";

function CourseReviews({ courseId }) {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch reviews when course changes
  useEffect(() => {
    if (!courseId) return;
    fetch(`http://127.0.0.1:5000/courses/${courseId}/reviews`)
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch((err) => console.error("Error fetching reviews:", err));
  }, [courseId]);

  const submitReview = (e) => {
    e.preventDefault();
    if (!rating || !newReview) return alert("Please add both rating and review.");

    setLoading(true);
    fetch(`http://127.0.0.1:5000/courses/${courseId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, review: newReview }),
    })
      .then((res) => res.json())
      .then((data) => {
        setReviews((prev) => [...prev, data]);
        setNewReview("");
        setRating("");
      })
      .catch((err) => console.error("Error posting review:", err))
      .finally(() => setLoading(false));
  };

  return (
    <div>
      <h3>Student Reviews</h3>

      <form onSubmit={submitReview}>
        <label>Rating (1–5): </label>
        <input
          type="number"
          min="1"
          max="5"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        />
        <br />
        <textarea
          placeholder="Write your review..."
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
        />
        <br />
        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>

      <hr />

      {reviews.length > 0 ? (
        reviews.map((r, i) => (
          <div key={i}>
            <strong>⭐ {r.rating}</strong>
            <p>{r.review}</p>
          </div>
        ))
      ) : (
        <p>No reviews yet for this course.</p>
      )}
    </div>
  );
}

export default CourseReviews;