import React, { useState } from 'react';
import { addSkill } from '../services/teacherService';

export default function AddSkill() {
  const [form, setForm] = useState({ title: '', description: '', price: '' });

  const submit = async (e) => {
    e.preventDefault();
    await addSkill(form);
    alert('Skill added!');
  };

  return (
    <div className="container mt-4">
      <h3>Add Skill</h3>
      <form onSubmit={submit}>
        <input placeholder="Title" onChange={e => setForm({...form, title: e.target.value})} /><br/>
        <input placeholder="Description" onChange={e => setForm({...form, description: e.target.value})} /><br/>
        <input placeholder="Price" onChange={e => setForm({...form, price: e.target.value})} /><br/>
        <button type="submit">Save</button>
      </form>
    </div>
  );
}
