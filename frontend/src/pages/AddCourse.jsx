import React, { useState } from 'react';
import { addCourse } from '../services/teacherService';

export default function AddCourse() {
  const [form, setForm] = useState({ title: '', description: '', price: '' });

  const submit = async (e) => {
    e.preventDefault();
    await addCourse(form);
    alert('Course added!');
  };

  return (
    <div className="container mt-4">
      <h3>Add Course</h3>
      <form onSubmit={submit}>
        <input placeholder="Course Title" onChange={e => setForm({...form, title: e.target.value})} /><br/>
        <textarea placeholder="Description" onChange={e => setForm({...form, description: e.target.value})} /><br/>
        <input placeholder="Price" type="number" onChange={e => setForm({...form, price: e.target.value})} /><br/>
        <button type="submit">Save</button>
      </form>
    </div>
  );
}