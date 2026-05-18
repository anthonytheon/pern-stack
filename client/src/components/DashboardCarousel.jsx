// ============================================================
// DASHBOARD CAROUSEL - Auto-rotating dashboard slideshow
// ============================================================

import { useState, useEffect } from "react";
import ListTodos from "./ListTodos";
import InputTodo from "./InputTodo";

const DashboardCarousel = () => {
  // Available dashboard views
  const dashboards = [
    { id: "ALL", name: "All Dashboard", icon: "📊" },
    { id: "EXPORT", name: "Export Dashboard", icon: "🚢" },
    { id: "IMPORT", name: "Import Dashboard", icon: "📦" },
    { id: "DOMESTIC", name: "Domestic Dashboard", icon: "🏠" }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [fadeState, setFadeState] = useState("fade-in");

  // Auto-rotate every 8 seconds
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      // Start fade out
      setFadeState("fade-out");
      
      // Change slide after fade out completes
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % dashboards.length);
        setFadeState("fade-in");
      }, 300);
      
    }, 8000); // Change dashboard every 8 seconds

    return () => clearInterval(interval);
  }, [isPlaying, dashboards.length]);

  // Manual navigation
  const goToPrevious = () => {
    setFadeState("fade-out");
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + dashboards.length) % dashboards.length);
      setFadeState("fade-in");
    }, 300);
  };

  const goToNext = () => {
    setFadeState("fade-out");
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % dashboards.length);
      setFadeState("fade-in");
    }, 300);
  };

  const goToDashboard = (index) => {
    if (index === currentIndex) return;
    setFadeState("fade-out");
    setTimeout(() => {
      setCurrentIndex(index);
      setFadeState("fade-in");
    }, 300);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const currentDashboard = dashboards[currentIndex];

  return (
    <div className="carousel-container">
      {/* Carousel Header with Controls */}
      <div className="carousel-header">
        <div className="carousel-title">
          <span className="carousel-icon">{currentDashboard.icon}</span>
          <h2>{currentDashboard.name}</h2>
        </div>
        
        <div className="carousel-controls">
          {/* Play/Pause Button */}
          <button 
            className={`carousel-control-btn ${isPlaying ? 'pause-btn' : 'play-btn'}`}
            onClick={togglePlayPause}
            title={isPlaying ? "Pause slideshow" : "Play slideshow"}
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>

          {/* Navigation Buttons */}
          <button 
            className="carousel-nav-btn"
            onClick={goToPrevious}
            title="Previous dashboard"
          >
            ◀
          </button>
          <button 
            className="carousel-nav-btn"
            onClick={goToNext}
            title="Next dashboard"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Dashboard Indicators */}
      <div className="carousel-indicators">
        {dashboards.map((dashboard, index) => (
          <button
            key={dashboard.id}
            className={`indicator-dot ${index === currentIndex ? "active" : ""}`}
            onClick={() => goToDashboard(index)}
            title={dashboard.name}
          >
            <span className="indicator-icon">{dashboard.icon}</span>
            <span className="indicator-label">{dashboard.name}</span>
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      {isPlaying && (
        <div className="progress-bar-container">
          <div className="progress-bar" key={currentIndex}>
            <div className="progress-fill"></div>
          </div>
        </div>
      )}

      {/* Dashboard Content with Fade Transition */}
      <div className={`carousel-content ${fadeState}`}>
        {currentDashboard.id === "ALL" && (
          <div className="dashboard-wrapper">
            <InputTodo />
            <ListTodos type="ALL" />
          </div>
        )}
        {currentDashboard.id === "EXPORT" && (
          <div className="dashboard-wrapper">
            <ListTodos type="EXPORT" />
          </div>
        )}
        {currentDashboard.id === "IMPORT" && (
          <div className="dashboard-wrapper">
            <ListTodos type="IMPORT" />
          </div>
        )}
        {currentDashboard.id === "DOMESTIC" && (
          <div className="dashboard-wrapper">
            <ListTodos type="DOMESTIC" />
          </div>
        )}
      </div>

      {/* Auto-rotate status */}
      <div className="carousel-footer">
        <span className="auto-rotate-status">
          {isPlaying ? "🔄 Auto-rotating every 8 seconds" : "⏸ Auto-rotation paused"}
        </span>
        <span className="dashboard-count">
          {currentIndex + 1} / {dashboards.length}
        </span>
      </div>
    </div>
  );
};

export default DashboardCarousel;