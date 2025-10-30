import React, { useState } from 'react';
import { addSkill } from '../services/teacherService';

export default function AddSkill() {
  const [form, setForm] = useState({ name: '', description: '', price: '' });

  const submit = async (e) => {
    e.preventDefault();
    await addSkill(form);
    alert('Skill added!');
  };

  return (
    <div className="container mt-4">
      <h3>Add Skill</h3>
      <form onSubmit={submit}>
        <input placeholder="Skill Name" onChange={e => setForm({...form, name: e.target.value})} /><br/>
        <textarea placeholder="Description" onChange={e => setForm({...form, description: e.target.value})} /><br/>
        <input placeholder="Price" type="number" onChange={e => setForm({...form, price: e.target.value})} /><br/>
        <button type="submit">Save</button>
      </form>
    </div>
  );
}
