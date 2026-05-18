// ============================================================
// TV DISPLAY - Airport Departure Screen Style
// Full screen, large fonts, auto-pagination WITH SORTING & FILTERING
// ============================================================

import { useState, useEffect } from "react";

const TVDisplay = ({ type }) => {
  const [jobOrders, setJobOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [rowsPerPage] = useState(15);
  
  // Sorting & Filtering states
  const [sortField, setSortField] = useState("eta");
  const [sortOrder, setSortOrder] = useState("ASC");
  const [searchTerm, setSearchTerm] = useState("");
  const [showControls, setShowControls] = useState(false);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");

  const API_BASE_URL = 'http://192.168.100.36:5000';

  // Fetch job orders
  const getJobOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("type", type);
      
      const url = `${API_BASE_URL}/job_orders${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);
      const jsonData = await response.json();
      setJobOrders(jsonData);
      
      // Extract unique years for filter
      const years = new Set();
      jsonData.forEach(job => {
        if (job.eta) years.add(new Date(job.eta).getFullYear());
        if (job.etd) years.add(new Date(job.etd).getFullYear());
      });
      setAvailableYears(Array.from(years).sort().reverse());
      
      setLoading(false);
    } catch (error) {
      console.error(error.message);
      setLoading(false);
    }
  };

  // Apply sorting and filtering
  useEffect(() => {
    let result = [...jobOrders];
    
    // Apply search filter
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
    
    // Apply year filter
    if (selectedYear) {
      result = result.filter(job => {
        const etaYear = job.eta ? new Date(job.eta).getFullYear().toString() : "";
        const etdYear = job.etd ? new Date(job.etd).getFullYear().toString() : "";
        return etaYear === selectedYear || etdYear === selectedYear;
      });
    }
    
    // Apply sorting
    result.sort((a, b) => {
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
    
    setFilteredOrders(result);
    setCurrentPage(0);
  }, [jobOrders, searchTerm, selectedYear, sortField, sortOrder]);

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / rowsPerPage));
  const startIndex = currentPage * rowsPerPage;
  const currentJobs = filteredOrders.slice(startIndex, startIndex + rowsPerPage);

  // Auto-rotate pages every 10 seconds
  useEffect(() => {
    getJobOrders();
    
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timeInterval);
  }, [type]);

  // Handle page rotation
  useEffect(() => {
    if (filteredOrders.length === 0) return;
    
    const pageInterval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 10000);
    
    return () => clearInterval(pageInterval);
  }, [filteredOrders.length, totalPages]);

  // Reset page when type changes
  useEffect(() => {
    setCurrentPage(0);
    setSearchTerm("");
    setSelectedYear("");
    setSortField("eta");
    setSortOrder("ASC");
  }, [type]);

  // Handle sort click
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortField(field);
      setSortOrder("ASC");
    }
  };

  // Format date for display
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortField !== field) return "↕️";
    return sortOrder === "ASC" ? "↑" : "↓";
  };

  // ============================================================
  // EXPORT & DOMESTIC - Column Order:
  // Shipper Name -> Volume -> Loading Date -> Closing Date -> 
  // ETD from SBY -> ETA Port of Discharge -> Vessel Name -> Shipping Line
  // ============================================================
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

  // ============================================================
  // IMPORT - Column Order:
  // JO Number -> Consignee Name -> Volume -> AJU Number -> 
  // Shipping Line -> ETA Surabaya
  // ============================================================
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

  // Get headers and row data based on type
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

      {/* Hidden Controls - Appears on hover */}
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
              setSortField("eta");
              setSortOrder("ASC");
            }}>
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Page Info */}
      <div className="tv-page-info">
        <span className="tv-page-badge">PAGE {currentPage + 1} OF {totalPages}</span>
        <span className="tv-record-count">{filteredOrders.length} RECORDS FOUND</span>
      </div>

      {/* Main Table */}
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
            {currentJobs.map((job, idx) => (
              <tr key={job.job_order_id}>
                {getRowData(job).map((data, dataIdx) => (
                  <td key={dataIdx}>{data || "-"}</td>
                ))}
              </tr>
            ))}
            {/* Fill empty rows */}
            {Array.from({ length: rowsPerPage - currentJobs.length }).map((_, idx) => (
              <tr key={`empty-${idx}`} className="tv-row-empty">
                {getHeaders().map((_, headerIdx) => (
                  <td key={headerIdx}>—</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer with progress bar */}
      <div className="tv-footer">
        <div className="tv-progress-container">
          <div className="tv-progress-bar"></div>
        </div>
        <div className="tv-footer-text">
          <span>🚢 NEXT PAGE IN</span>
          <span className="tv-footer-bold">10 SECONDS</span>
          <span>📦 AUTO REFRESH</span>
          <span>⬆️ CLICK COLUMN HEADERS TO SORT</span>
        </div>
      </div>
    </div>
  );
};

export default TVDisplay;