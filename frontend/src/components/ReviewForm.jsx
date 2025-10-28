import React, { useState } from 'react';

export default function ReviewForm({ onSubmit }) {
  const [review, setReview] = useState('');

  return (
    <form onSubmit={(e)=>{e.preventDefault();onSubmit(review);}}>
      <input placeholder="Leave your review"
             onChange={(e)=>setReview(e.target.value)} />
      <button type="submit">Submit</button>
    </form>
  );
}
