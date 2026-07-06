// TVApp.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TVDisplay from "./components/TVDisplay";
import './App.css';

function TVApp() {
  const { type } = useParams();
  const navigate = useNavigate();
  const [currentType, setCurrentType] = useState(type || "EXPORT");

  useEffect(() => {
    if (type && ["EXPORT", "IMPORT", "DOMESTIC"].includes(type)) {
      setCurrentType(type);
    }
  }, [type]);

  return (
    <div className="tv-app">
      {/* Admin Bar at bottom */}
      <div className="tv-admin-bar">
        <button 
          className={currentType === 'FREIGHT' ? 'active' : ''}
          onClick={() => {
            setCurrentType('FREIGHT');
            navigate('/tv/FREIGHT');
          }}
        >
          🚢 FREIGHT
        </button>
        <button 
          className={currentType === 'EXPORT' ? 'active' : ''}
          onClick={() => {
            setCurrentType('EXPORT');
            navigate('/tv/EXPORT');
          }}
        >
          ⚙️ EXPORT
        </button>
        <button 
          className={currentType === 'IMPORT' ? 'active' : ''}
          onClick={() => {
            setCurrentType('IMPORT');
            navigate('/tv/IMPORT');
          }}
        >
          📦 IMPORT
        </button>
        <button 
          className={currentType === 'DOMESTIC' ? 'active' : ''}
          onClick={() => {
            setCurrentType('DOMESTIC');
            navigate('/tv/DOMESTIC');
          }}
        >
          🏠 DOMESTIC
        </button>

        <button 
          className={currentType === 'OTHER' ? 'active' : ''}
          onClick={() => {
            setCurrentType('OTHER');
            navigate('/tv/OTHER');
          }}
        >
        🗂️ OTHER
        </button>
        
        <button onClick={() => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
          } else {
            document.exitFullscreen();
          }
        }}>
          ⛶ FULLSCREEN
        </button>
      </div>

      <TVDisplay type={currentType} />
    </div>
  );
}

export default TVApp;