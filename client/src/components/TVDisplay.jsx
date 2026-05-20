// ============================================================
// TV DISPLAY - Weekly Pagination by Date
// EXPORT/DOMESTIC: Group by Loading Date
// IMPORT: Group by ETA
// WITH PLAY/PAUSE BUTTONS
// ============================================================

import { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from '../config';

const TVDisplay = ({ type }) => {
  const [jobOrders, setJobOrders] = useState([]);
  const [weeklyGroups, setWeeklyGroups] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [showControls, setShowControls] = useState(false);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [isPlaying, setIsPlaying] = useState(true);
  
  const pageIntervalRef = useRef(null);

  // Get the date field based on JO type
  const getDateField = () => {
    if (type === "EXPORT" || type === "DOMESTIC") {
      return "loading_date";
    }
    if (type === "IMPORT") {
      return "eta";
    }
    return "loading_date";
  };

  // Get week range for a given date
  const getWeekRange = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const start = new Date(d);
    const diff = (day === 0 ? 6 : day - 1);
    start.setDate(d.getDate() - diff);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    
    return { start, end, label: `${start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - ${end.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}` };
  };

  // Group jobs by week
  const groupByWeek = (jobs, dateField) => {
    const groups = new Map();
    
    jobs.forEach(job => {
      const dateValue = job[dateField];
      if (!dateValue) return;
      
      const date = new Date(dateValue);
      const weekRange = getWeekRange(date);
      const weekKey = weekRange.start.toISOString();
      
      if (!groups.has(weekKey)) {
        groups.set(weekKey, {
          weekLabel: weekRange.label,
          startDate: weekRange.start,
          endDate: weekRange.end,
          jobs: []
        });
      }
      groups.get(weekKey).jobs.push(job);
    });
    
    const sortedGroups = Array.from(groups.values())
      .sort((a, b) => b.startDate - a.startDate);
    
    return sortedGroups;
  };

  // Apply search and year filter to jobs
  const filterJobs = (jobs) => {
    let result = [...jobs];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(job => {
        return (
          (job.jo_number && job.jo_number.toLowerCase().includes(term)) ||
          (job.shipper_name && job.shipper_name.toLowerCase().includes(term)) ||
          (job.consignee_name && job.consignee_name.toLowerCase().includes(term)) ||
          (job.aju_number && job.aju_number.toLowerCase().includes(term)) ||
          (job.volume && job.volume.toLowerCase().includes(term)) ||
          (job.vessel_name && job.vessel_name.toLowerCase().includes(term))
        );
      });
    }
    
    if (selectedYear) {
      const dateField = getDateField();
      result = result.filter(job => {
        const dateValue = job[dateField];
        return dateValue && new Date(dateValue).getFullYear().toString() === selectedYear;
      });
    }
    
    return result;
  };

  // Fetch job orders
  const getJobOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("type", type);
      
      const url = `${API_BASE_URL}/job_orders${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);
      let jsonData = await response.json();
      
      jsonData = filterJobs(jsonData);
      
      const dateField = getDateField();
      const grouped = groupByWeek(jsonData, dateField);
      setWeeklyGroups(grouped);
      
      const years = new Set();
      jsonData.forEach(job => {
        const dateField = getDateField();
        const dateValue = job[dateField];
        if (dateValue) years.add(new Date(dateValue).getFullYear());
      });
      setAvailableYears(Array.from(years).sort().reverse());
      
      setLoading(false);
    } catch (error) {
      console.error(error.message);
      setLoading(false);
    }
  };

  // Auto-rotate pages
  useEffect(() => {
    if (!isPlaying) return;
    if (weeklyGroups.length === 0) return;
    
    if (pageIntervalRef.current) clearInterval(pageIntervalRef.current);
    
    pageIntervalRef.current = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % weeklyGroups.length);
    }, 10000);
    
    return () => {
      if (pageIntervalRef.current) clearInterval(pageIntervalRef.current);
    };
  }, [isPlaying, weeklyGroups.length]);

  // Reset to first page when filters change
  useEffect(() => {
    getJobOrders();
    setCurrentPage(0);
    setIsPlaying(true);
  }, [type, searchTerm, selectedYear]);

  // Update time every second
  useEffect(() => {
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timeInterval);
  }, []);

  // Manual navigation
  const goToPreviousWeek = () => {
    if (weeklyGroups.length === 0) return;
    setCurrentPage((prev) => (prev - 1 + weeklyGroups.length) % weeklyGroups.length);
  };

  const goToNextWeek = () => {
    if (weeklyGroups.length === 0) return;
    setCurrentPage((prev) => (prev + 1) % weeklyGroups.length);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const currentGroup = weeklyGroups[currentPage];
  const currentJobs = currentGroup?.jobs || [];

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  };

  // EXPORT & DOMESTIC headers
  const getExportDomesticHeaders = () => {
    return [
      { key: "shipper_name", label: "SHIPPER NAME" },
      { key: "volume", label: "VOLUME" },
      { key: "loading_date", label: "LOADING DATE" },
      { key: "closing_date", label: "CLOSING DATE" },
      { key: "etd", label: "ETD FROM SBY" },
      { key: "eta", label: "ETA PORT OF DISCHARGE" },
      { key: "vessel_name", label: "VESSEL NAME" },
      { key: "shipping_line", label: "SHIPPING LINE" }
    ];
  };

  const getExportDomesticRowData = (job) => {
    return [
      job.shipper_name || "-",
      job.volume || "-",
      formatDisplayDate(job.loading_date),
      formatDisplayDate(job.closing_date),
      formatDisplayDate(job.etd),
      formatDisplayDate(job.eta),
      job.vessel_name || "-",
      job.shipping_line || "-"
    ];
  };

  // IMPORT headers
  const getImportHeaders = () => {
    return [
      { key: "jo_number", label: "JO NUMBER" },
      { key: "consignee_name", label: "CONSIGNEE NAME" },
      { key: "volume", label: "VOLUME" },
      { key: "aju_number", label: "AJU NUMBER" },
      { key: "shipping_line", label: "SHIPPING LINE" },
      { key: "eta", label: "ETA SURABAYA" }
    ];
  };

  const getImportRowData = (job) => {
    return [
      job.jo_number || "-",
      job.consignee_name || "-",
      job.volume || "-",
      job.aju_number || "-",
      job.shipping_line || "-",
      formatDisplayDate(job.eta)
    ];
  };

  const getHeaders = () => {
    if (type === "EXPORT" || type === "DOMESTIC") {
      return getExportDomesticHeaders();
    }
    if (type === "IMPORT") {
      return getImportHeaders();
    }
    return getExportDomesticHeaders();
  };

  const getRowData = (job) => {
    if (type === "EXPORT" || type === "DOMESTIC") {
      return getExportDomesticRowData(job);
    }
    if (type === "IMPORT") {
      return getImportRowData(job);
    }
    return getExportDomesticRowData(job);
  };

  if (loading) {
    return (
      <div className="tv-loading">
        <div className="tv-loading-spinner"></div>
        <div>LOADING SCHEDULE...</div>
      </div>
    );
  }

  if (weeklyGroups.length === 0) {
    return (
      <div className="tv-container">
        <div className="tv-header">
          <div className="tv-title">
            <h1>GST JOB ORDER SYSTEM</h1>
            <h2>{type} DASHBOARD</h2>
          </div>
          <div className="tv-datetime">
            <div className="tv-time">{currentTime.toLocaleTimeString('en-GB')}</div>
            <div className="tv-date">{currentTime.toLocaleDateString('en-GB', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</div>
          </div>
        </div>
        <div className="tv-no-data">
          <h2>No data found for {type}</h2>
          <p>Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="tv-container"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Header Section */}
      <div className="tv-header">
        <div className="tv-title">
          <h1>GST JOB ORDER SYSTEM</h1>
          <h2>{type} DASHBOARD</h2>
        </div>
        <div className="tv-datetime">
          <div className="tv-time">{currentTime.toLocaleTimeString('en-GB')}</div>
          <div className="tv-date">{currentTime.toLocaleDateString('en-GB', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</div>
        </div>
      </div>

      {/* Hidden Controls */}
      {showControls && (
        <div className="tv-controls-panel">
          <div className="tv-search">
            <input
              type="text"
              placeholder="🔍 Search by JO Number, Shipper, Consignee, AJU, Vessel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="tv-search-input"
            />
            {searchTerm && (
              <button className="tv-clear-btn" onClick={() => setSearchTerm("")}>✕</button>
            )}
          </div>
          
          <div className="tv-filter-group">
            <select
              className="tv-filter-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">All Years</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            <button className="tv-reset-btn" onClick={() => {
              setSearchTerm("");
              setSelectedYear("");
            }}>
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Play/Pause and Navigation Controls - Always visible at top */}
      <div className="tv-play-controls">
        <button onClick={goToPreviousWeek} className="tv-nav-btn" title="Previous Week">
          ◀ PREV WEEK
        </button>
        <button onClick={togglePlayPause} className={`tv-play-pause-btn ${isPlaying ? 'pause' : 'play'}`}>
          {isPlaying ? "⏸ PAUSE" : "▶ PLAY"}
        </button>
        <button onClick={goToNextWeek} className="tv-nav-btn" title="Next Week">
          NEXT WEEK ▶
        </button>
      </div>

      {/* Week Info Banner */}
      <div className="tv-week-banner">
        <span className="tv-week-label">📅 WEEK {currentPage + 1} OF {weeklyGroups.length}</span>
        <span className="tv-week-range">{currentGroup.weekLabel}</span>
        <span className="tv-record-count">{currentJobs.length} SHIPMENTS</span>
      </div>

      {/* Progress Bar (only when playing) */}
      {isPlaying && (
        <div className="tv-progress-container">
          <div className="tv-progress-bar"></div>
        </div>
      )}

      {/* Main Table */}
      <div className="tv-table-wrapper">
        <table className="tv-table">
          <thead>
            <tr>
              {getHeaders().map((header) => (
                <th key={header.key}>
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentJobs.map((job, idx) => (
              <tr key={job.job_order_id}>
                {getRowData(job).map((data, dataIdx) => (
                  <td key={dataIdx}>{data || "-"}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="tv-footer">
        <div className="tv-footer-text">
          <span>🚢 {isPlaying ? "AUTO-ROTATING" : "PAUSED"}</span>
          <span className="tv-footer-bold">{isPlaying ? "NEXT WEEK IN" : "MANUAL MODE"}</span>
          <span>📅 {type === "IMPORT" ? "ETA" : "LOADING DATE"} WEEKLY VIEW</span>
          <span>⬆️ HOVER FOR SEARCH</span>
        </div>
      </div>
    </div>
  );
};

export default TVDisplay;