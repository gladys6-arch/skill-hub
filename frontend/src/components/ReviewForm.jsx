import { useState } from 'react'

function ReviewForm({ courseId, onSubmit }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ courseId, rating, comment })
    setRating(5)
    setComment('')
  }

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h3>Leave a Review</h3>
      <div>
        <label>Rating:</label>
        <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
          {[1,2,3,4,5].map(num => (
            <option key={num} value={num}>{num} Star{num > 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Comment:</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
        />
      </div>
      <button type="submit">Submit Review</button>
    </form>
  )
}

export default ReviewForm