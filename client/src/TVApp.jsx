// TVApp.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TVDisplay from "./components/TVDisplay";

function TVApp() {
  const { type } = useParams();
  const navigate = useNavigate();
  const [currentType, setCurrentType] = useState(type || "EXPORT");

  useEffect(() => {
    if (type && ["EXPORT", "IMPORT", "DOMESTIC"].includes(type)) {
      setCurrentType(type);
    }
  }, [type]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === '1') {
        setCurrentType('EXPORT');
        navigate('/tv/EXPORT');
      }
      if (e.key === '2') {
        setCurrentType('IMPORT');
        navigate('/tv/IMPORT');
      }
      if (e.key === '3') {
        setCurrentType('DOMESTIC');
        navigate('/tv/DOMESTIC');
      }
      if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);

  return (
    <div className="tv-app">  {/* Make sure this matches your CSS - tv-app or tv-mode? */}
      {/* Hidden Admin Bar at bottom */}
      <div className="tv-admin-bar">
        <button 
          className={currentType === 'EXPORT' ? 'active' : ''}
          onClick={() => {
            setCurrentType('EXPORT');
            navigate('/tv/EXPORT');
          }}
        >
          🚢 EXPORT
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