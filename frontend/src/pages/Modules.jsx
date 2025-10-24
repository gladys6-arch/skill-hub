import React, { useState } from 'react';

export default function Modules() {
  const [modules, setModules] = useState([]);
  const [moduleName, setModuleName] = useState('');

  const addModule = () => {
    if (!moduleName) return;
    setModules([...modules, moduleName]);
    setModuleName('');
  };

  return (
    <div className="container mt-4">
      <h3>Manage Modules</h3>
      <input placeholder="Module Name" 
        value={moduleName}
        onChange={(e)=>setModuleName(e.target.value)} />
      <button onClick={addModule}>Add</button>

      <ul>
        {modules.map((m,i)=> <li key={i}>{m}</li>)}
      </ul>
    </div>
  );
}
