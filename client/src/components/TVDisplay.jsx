// ============================================================
// TV DISPLAY - Simple Pagination with Sorting
// Shows ALL data, 15 rows per page, sortable columns
// ============================================================

import { useState, useEffect } from "react";
import { API_BASE_URL } from '../config';

const TVDisplay = ({ type }) => {
  const [jobOrders, setJobOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPlaying, setIsPlaying] = useState(true);
  const rowsPerPage = 15;
  
  // Sorting
  const [sortField, setSortField] = useState("loading_date");
  const [sortOrder, setSortOrder] = useState("ASC");

  // Fetch data
  const getJobOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("type", type);
      const url = `${API_BASE_URL}/job_orders${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);
      const jsonData = await response.json();
      setJobOrders(jsonData);
      setLoading(false);
    } catch (error) {
      console.error(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    getJobOrders();
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timeInterval);
  }, [type]);

  // Sort data
  const getSortedData = () => {
    const sorted = [...jobOrders];
    sorted.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      
      if (sortField === "eta" || sortField === "etd" || sortField === "loading_date" || sortField === "closing_date") {
        valA = valA ? new Date(valA) : new Date(0);
        valB = valB ? new Date(valB) : new Date(0);
      } else {
        valA = (valA || "").toLowerCase();
        valB = (valB || "").toLowerCase();
      }
      
      if (valA < valB) return sortOrder === "ASC" ? -1 : 1;
      if (valA > valB) return sortOrder === "ASC" ? 1 : -1;
      return 0;
    });
    return sorted;
  };

  const sortedData = getSortedData();
  const totalPages = Math.max(1, Math.ceil(sortedData.length / rowsPerPage));
  const startIndex = currentPage * rowsPerPage;
  const currentJobs = sortedData.slice(startIndex, startIndex + rowsPerPage);

  // Auto page rotation
  useEffect(() => {
    if (!isPlaying) return;
    if (totalPages <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [isPlaying, totalPages]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortField(field);
      setSortOrder("ASC");
    }
    setCurrentPage(0);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return "↕️";
    return sortOrder === "ASC" ? "↑" : "↓";
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  };

  // Headers based on type
  const getHeaders = () => {
    if (type === "EXPORT" || type === "DOMESTIC") {
      return [
        { key: "shipper_name", label: "SHIPPER NAME" },
        { key: "volume", label: "VOLUME" },
        { key: "person_in_charge", label: "PERSON IN CHARGE" },
        { key: "loading_date", label: "LOADING DATE" },
        { key: "closing_date", label: "CLOSING DATE" },
        { key: "etd", label: "ETD" },
        { key: "eta", label: "ETA" },
        { key: "vessel_name", label: "VESSEL" },
        { key: "shipping_line", label: "SHIPPING LINE" }
      ];
    }
    // IMPORT
    return [
      { key: "jo_number", label: "JO NUMBER" },
      { key: "consignee_name", label: "CONSIGNEE" },
      { key: "person_in_charge", label: "PERSON IN CHARGE" },
      { key: "volume", label: "VOLUME" },
      { key: "aju_number", label: "AJU" },
      { key: "shipping_line", label: "SHIPPING LINE" },
      { key: "eta", label: "ETA SURABAYA" }
    ];
  };

  const getRowData = (job) => {
    if (type === "EXPORT" || type === "DOMESTIC") {
      return [
        job.shipper_name || "-",
        job.volume || "-",
        job.person_in_charge || "-",
        formatDate(job.loading_date),
        formatDate(job.closing_date),
        formatDate(job.etd),
        formatDate(job.eta),
        job.vessel_name || "-",
        job.shipping_line || "-"
      ];
    }
    // IMPORT
    return [
      job.jo_number || "-",
      job.consignee_name || "-",
      job.person_in_charge || "-",
      job.volume || "-",
      job.aju_number || "-",
      job.shipping_line || "-",
      formatDate(job.eta)
    ];
  };

  if (loading) {
    return (
      <div className="tv-loading">
        <div className="tv-loading-spinner"></div>
        <div>LOADING...</div>
      </div>
    );
  }

  return (
    <div className="tv-container">
      {/* Header */}
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

      {/* Controls */}
      <div className="tv-play-controls">
        <button onClick={goToPrevPage} className="tv-nav-btn">◀ PREV</button>
        <button onClick={togglePlayPause} className={`tv-play-pause-btn ${isPlaying ? 'pause' : 'play'}`}>
          {isPlaying ? "⏸ PAUSE" : "▶ PLAY"}
        </button>
        <button onClick={goToNextPage} className="tv-nav-btn">NEXT ▶</button>
      </div>

      {/* Page Info */}
      <div className="tv-page-info">
        <span className="tv-page-badge">PAGE {currentPage + 1} OF {totalPages}</span>
        <span className="tv-record-count">{sortedData.length} TOTAL RECORDS</span>
      </div>

      {/* Progress Bar */}
      {isPlaying && (
        <div className="tv-progress-container">
          <div className="tv-progress-bar"></div>
        </div>
      )}

      {/* Table */}
      <div className="tv-table-wrapper">
        <table className="tv-table">
          <thead>
            <tr>
              {getHeaders().map((header) => (
                <th key={header.key} onClick={() => handleSort(header.key)} style={{ cursor: "pointer" }}>
                  {header.label} <span className="tv-sort-icon">{getSortIcon(header.key)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentJobs.map((job) => (
              <tr key={job.job_order_id}>
                {getRowData(job).map((data, idx) => (
                  <td key={idx}>{data}</td>
                ))}
              </tr>
            ))}
            {/* Fill empty rows */}
            {Array.from({ length: rowsPerPage - currentJobs.length }).map((_, idx) => (
              <tr key={`empty-${idx}`} className="tv-row-empty">
                {getHeaders().map((_, hidx) => (
                  <td key={hidx}>—</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="tv-footer">
        <div className="tv-footer-text">
          <span>{isPlaying ? "▶ AUTO PAGING" : "⏸ MANUAL"}</span>
          <span className="tv-footer-bold">{isPlaying ? "NEXT PAGE IN 10s" : "PAUSED"}</span>
          <span>⬆️ CLICK HEADERS TO SORT</span>
        </div>
      </div>
    </div>
  );
};

export default TVDisplay;