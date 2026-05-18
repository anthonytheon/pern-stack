import React from 'react';
import ReactDOM from 'react-dom/client';
import TVApp from './TVApp';
import './tv.css';  // Make sure this line exists

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TVApp />
  </React.StrictMode>
);