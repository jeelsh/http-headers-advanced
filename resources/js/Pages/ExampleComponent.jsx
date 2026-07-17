import React, { useState } from 'react';

function ExampleComponent({name, site, user}) {
  const [count, setCount] = useState(0);

  return (
    <div className="example-component">
      <h2>Example React Component</h2>
      <p>This is a sample component created by Antonella Framework</p>
      <div>
        <p>Name: {name}</p>
        <p>Site: {site?.url}</p>
        <p>User: {user?.name}</p>
        <button onClick={() => setCount(count + 1)}>
          Count: {count}
        </button>
      </div>
      <style>{`
        .example-component {
          padding: 20px;
          border: 2px solid #61dafb;
          border-radius: 8px;
          margin: 20px 0;
        }
        .example-component button {
          background: #61dafb;
          color: #000;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }
        .example-component button:hover {
          background: #4fa8c5;
        }
      `}</style>
    </div>
  );
}

export default ExampleComponent;