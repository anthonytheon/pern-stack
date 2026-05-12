// HARDCODED API URL - CHANGE THIS IF YOUR IP CHANGES
const API_BASE_URL = 'http://192.168.100.36:5000';

import { useEffect, useState } from "react";

const ListTodos = ({ type }) => {
  const [jobOrders, setJobOrders] = useState([]);
  const [editingJob, setEditingJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  
  // Search/filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [selectedYear, setSelectedYear] = useState("");
  const [sortField, setSortField] = useState("eta");
  const [sortOrder, setSortOrder] = useState("ASC");
  const [availableYears, setAvailableYears] = useState([]);

  const getJobOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (type && type !== "ALL") {
        params.append("type", type);
      }
      
      if (searchTerm) {
        params.append("search", searchTerm);
        params.append("searchField", searchField);
      }
      
      if (selectedYear) {
        params.append("year", selectedYear);
      }
      
      if (sortField) {
        params.append("sort", sortField);
        params.append("order", sortOrder);
      }
      
      const url = `${API_BASE_URL}/job_orders${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);
      const jsonData = await response.json();
      setJobOrders(jsonData);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getYears = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/job_orders/years`);
      const years = await response.json();
      setAvailableYears(years);
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    getJobOrders();
    getYears();
  }, [type, searchTerm, searchField, selectedYear, sortField, sortOrder]);

  const confirmDelete = (job) => {
    setJobToDelete(job);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!jobToDelete) return;
    
    try {
      await fetch(`${API_BASE_URL}/job_orders/${jobToDelete.job_order_id}`, {
        method: "DELETE",
      });
      setShowDeleteModal(false);
      setJobToDelete(null);
      getJobOrders();
    } catch (error) {
      console.error(error.message);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setJobToDelete(null);
  };

  const updateField = (e) => {
    setEditingJob({
      ...editingJob,
      [e.target.name]: e.target.value,
    });
  };

  const updateJobOrder = async () => {
    try {
      await fetch(`${API_BASE_URL}/job_orders/${editingJob.job_order_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingJob),
      });
      setEditingJob(null);
      getJobOrders();
    } catch (error) {
      console.error(error.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortField(field);
      setSortOrder("ASC");
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSearchField("all");
    setSelectedYear("");
    setSortField("eta");
    setSortOrder("ASC");
  };

  const renderHeaders = () => {
    // EXPORT Dashboard
    if (type === "EXPORT") {
      return (
        <>
          <th onClick={() => handleSort("loading_date")} style={{ cursor: "pointer" }}>
            Loading Date {sortField === "loading_date" && (sortOrder === "ASC" ? "↑" : "↓")}
          </th>
          <th onClick={() => handleSort("shipper_name")} style={{ cursor: "pointer" }}>
            Shipper Name {sortField === "shipper_name" && (sortOrder === "ASC" ? "↑" : "↓")}
          </th>
          <th onClick={() => handleSort("volume")} style={{ cursor: "pointer" }}>
            Volume {sortField === "volume" && (sortOrder === "ASC" ? "↑" : "↓")}
          </th>
          <th onClick={() => handleSort("port_of_loading")} style={{ cursor: "pointer" }}>
            Port of Loading {sortField === "port_of_loading" && (sortOrder === "ASC" ? "↑" : "↓")}
          </th>
          <th onClick={() => handleSort("aju_number")} style={{ cursor: "pointer" }}>
            AJU Number {sortField === "aju_number" && (sortOrder === "ASC" ? "↑" : "↓")}
          </th>
        </>
      );
    }
    
    // IMPORT Dashboard
    if (type === "IMPORT") {
      return (
        <>
          <th onClick={() => handleSort("consignee_name")} style={{ cursor: "pointer" }}>
            Consignee Name {sortField === "consignee_name" && (sortOrder === "ASC" ? "↑" : "↓")}
          </th>
          <th onClick={() => handleSort("aju_number")} style={{ cursor: "pointer" }}>
            AJU Number {sortField === "aju_number" && (sortOrder === "ASC" ? "↑" : "↓")}
          </th>
          <th onClick={() => handleSort("volume")} style={{ cursor: "pointer" }}>
            Volume {sortField === "volume" && (sortOrder === "ASC" ? "↑" : "↓")}
          </th>
          <th onClick={() => handleSort("port_of_discharge")} style={{ cursor: "pointer" }}>
            Port of Discharge {sortField === "port_of_discharge" && (sortOrder === "ASC" ? "↑" : "↓")}
          </th>
          <th onClick={() => handleSort("etd")} style={{ cursor: "pointer" }}>
            ETD {sortField === "etd" && (sortOrder === "ASC" ? "↑" : "↓")}
          </th>
          <th onClick={() => handleSort("eta")} style={{ cursor: "pointer" }}>
            ETA {sortField === "eta" && (sortOrder === "ASC" ? "↑" : "↓")}
          </th>
          <th onClick={() => handleSort("sppb_date")} style={{ cursor: "pointer" }}>
            SPPB Date {sortField === "sppb_date" && (sortOrder === "ASC" ? "↑" : "↓")}
          </th>
          <th onClick={() => handleSort("dooring_date")} style={{ cursor: "pointer" }}>
            Dooring Date {sortField === "dooring_date" && (sortOrder === "ASC" ? "↑" : "↓")}
          </th>
        </>
      );
    }
    
    // DOMESTIC Dashboard
    if (type === "DOMESTIC") {
      return (
        <>
          <th onClick={() => handleSort("loading_date")} style={{ cursor: "pointer" }}>
            Loading Date {sortField === "loading_date" && (sortOrder === "ASC" ? "↑" : "↓")}
          </th>
          <th onClick={() => handleSort("shipper_name")} style={{ cursor: "pointer" }}>
            Shipper Name {sortField === "shipper_name" && (sortOrder === "ASC" ? "↑" : "↓")}
          </th>
          <th onClick={() => handleSort("volume")} style={{ cursor: "pointer" }}>
            Volume {sortField === "volume" && (sortOrder === "ASC" ? "↑" : "↓")}
          </th>
          <th onClick={() => handleSort("port_of_loading")} style={{ cursor: "pointer" }}>
            Port of Loading {sortField === "port_of_loading" && (sortOrder === "ASC" ? "↑" : "↓")}
          </th>
        </>
      );
    }
    
    // ALL Dashboard - NO SPPB Date and NO Dooring Date
    return (
      <>
        <th onClick={() => handleSort("jo_number")} style={{ cursor: "pointer" }}>
          JO Number {sortField === "jo_number" && (sortOrder === "ASC" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("jo_type")} style={{ cursor: "pointer" }}>
          Type {sortField === "jo_type" && (sortOrder === "ASC" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("loading_date")} style={{ cursor: "pointer" }}>
          Loading Date {sortField === "loading_date" && (sortOrder === "ASC" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("shipper_name")} style={{ cursor: "pointer" }}>
          Shipper Name {sortField === "shipper_name" && (sortOrder === "ASC" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("aju_number")} style={{ cursor: "pointer" }}>
          AJU Number {sortField === "aju_number" && (sortOrder === "ASC" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("volume")} style={{ cursor: "pointer" }}>
          Volume {sortField === "volume" && (sortOrder === "ASC" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("port_of_loading")} style={{ cursor: "pointer" }}>
          Port of Loading {sortField === "port_of_loading" && (sortOrder === "ASC" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("consignee_name")} style={{ cursor: "pointer" }}>
          Consignee Name {sortField === "consignee_name" && (sortOrder === "ASC" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("port_of_discharge")} style={{ cursor: "pointer" }}>
          Port of Discharge {sortField === "port_of_discharge" && (sortOrder === "ASC" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("etd")} style={{ cursor: "pointer" }}>
          ETD {sortField === "etd" && (sortOrder === "ASC" ? "↑" : "↓")}
        </th>
        <th onClick={() => handleSort("eta")} style={{ cursor: "pointer" }}>
          ETA {sortField === "eta" && (sortOrder === "ASC" ? "↑" : "↓")}
        </th>
        <th>Edit</th>
        <th>Delete</th>
      </>
    );
  };

  const renderRowData = (job) => {
    // EXPORT Dashboard
    if (type === "EXPORT") {
      return (
        <>
          <td>{formatDate(job.loading_date)}</td>
          <td>{job.shipper_name}</td>
          <td>{job.volume}</td>
          <td>{job.port_of_loading}</td>
          <td>{job.aju_number}</td>
        </>
      );
    }
    
    // IMPORT Dashboard
    if (type === "IMPORT") {
      return (
        <>
          <td>{job.consignee_name}</td>
          <td>{job.aju_number}</td>
          <td>{job.volume}</td>
          <td>{job.port_of_discharge}</td>
          <td>{formatDate(job.etd)}</td>
          <td>{formatDate(job.eta)}</td>
          <td>{formatDate(job.sppb_date)}</td>
          <td>{formatDate(job.dooring_date)}</td>
        </>
      );
    }
    
    // DOMESTIC Dashboard
    if (type === "DOMESTIC") {
      return (
        <>
          <td>{formatDate(job.loading_date)}</td>
          <td>{job.shipper_name}</td>
          <td>{job.volume}</td>
          <td>{job.port_of_loading}</td>
        </>
      );
    }
    
    // ALL Dashboard - NO SPPB Date and NO Dooring Date
    return (
      <>
        <td>{job.jo_number}</td>
        <td>{job.jo_type}</td>
        <td>{formatDate(job.loading_date)}</td>
        <td>{job.shipper_name}</td>
        <td>{job.aju_number}</td>
        <td>{job.volume}</td>
        <td>{job.port_of_loading}</td>
        <td>{job.consignee_name}</td>
        <td>{job.port_of_discharge}</td>
        <td>{formatDate(job.etd)}</td>
        <td>{formatDate(job.eta)}</td>
        <td className="action-cell">
          <button className="edit-btn" onClick={() => setEditingJob(job)}>
            Edit
          </button>
        </td>
        <td className="action-cell">
          <button className="delete-btn" onClick={() => confirmDelete(job)}>
            Delete
          </button>
        </td>
      </>
    );
  };

  return (
    <div className="list-todos-container">
      <h2 className="dashboard-title">{type} Dashboard</h2>

      {type === "ALL" && (
        <div className="filter-bar">
          <div className="search-group">
            <select 
              className="filter-select"
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
            >
              <option value="all">All Fields</option>
              <option value="aju_number">AJU Number</option>
              <option value="jo_number">JO Number</option>
              <option value="shipper_name">Shipper Name</option>
              <option value="consignee_name">Consignee Name</option>
              <option value="volume">Volume</option>
            </select>
            <input
              type="text"
              className="search-input"
              placeholder={`Search by ${searchField === "all" ? "any field" : searchField.replace("_", " ")}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-btn" onClick={() => setSearchTerm("")}>
                ✕
              </button>
            )}
          </div>

          <div className="filter-group">
            <select
              className="filter-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">All Years</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            {selectedYear && (
              <button className="clear-btn" onClick={() => setSelectedYear("")}>
                Clear Year
              </button>
            )}
          </div>

          <div className="filter-group">
            <button className="reset-btn" onClick={resetFilters}>
              Reset All Filters
            </button>
          </div>

          <div className="results-count">
            {loading ? "Loading..." : `Found: ${jobOrders.length} result(s)`}
          </div>
        </div>
      )}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {renderHeaders()}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="100%" className="no-results">
                  Loading...
                </td>
              </tr>
            ) : (
              jobOrders.map((job) => (
                <tr key={job.job_order_id}>
                  {renderRowData(job)}
                </tr>
              ))
            )}
            {!loading && jobOrders.length === 0 && (
              <tr>
                <td colSpan="100%" className="no-results">
                  No job orders found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* DELETE CONFIRMATION MODAL - FIXED */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="#ff385c" strokeWidth="1.5"/>
                <path d="M12 8V12M12 16H12.01" stroke="#ff385c" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="modal-title">Delete Job Order</h3>
            <p className="modal-message">
              Are you sure you want to delete <strong>{jobToDelete?.jo_number}</strong>?
            </p>
            <p className="modal-warning">
              This action cannot be undone.
            </p>
            <div className="modal-buttons">
              <button className="modal-cancel-btn" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="modal-delete-btn" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {editingJob && (
        <div className="edit-form">
          <h2>Edit Job Order</h2>

          <input
            type="text"
            name="jo_number"
            value={editingJob.jo_number || ""}
            onChange={updateField}
            placeholder="JO Number"
          />

          <input
            type="text"
            name="shipper_name"
            value={editingJob.shipper_name || ""}
            onChange={updateField}
            placeholder="Shipper Name"
          />

          <input
            type="text"
            name="consignee_name"
            value={editingJob.consignee_name || ""}
            onChange={updateField}
            placeholder="Consignee Name"
          />

          <input
            type="text"
            name="volume"
            value={editingJob.volume || ""}
            onChange={updateField}
            placeholder="Volume"
          />

          <input
            type="text"
            name="aju_number"
            value={editingJob.aju_number || ""}
            onChange={updateField}
            placeholder="AJU Number"
          />

          <input
            type="date"
            name="loading_date"
            value={editingJob.loading_date || ""}
            onChange={updateField}
            placeholder="Loading Date"
          />

          <input
            type="date"
            name="eta"
            value={editingJob.eta || ""}
            onChange={updateField}
            placeholder="ETA"
          />

          <input
            type="date"
            name="etd"
            value={editingJob.etd || ""}
            onChange={updateField}
            placeholder="ETD"
          />

          <input
            type="date"
            name="sppb_date"
            value={editingJob.sppb_date || ""}
            onChange={updateField}
            placeholder="SPPB Date"
          />

          <input
            type="date"
            name="dooring_date"
            value={editingJob.dooring_date || ""}
            onChange={updateField}
            placeholder="Dooring Date"
          />

          <input
            type="text"
            name="port_of_discharge"
            value={editingJob.port_of_discharge || ""}
            onChange={updateField}
            placeholder="Port of Discharge"
          />

          <textarea
            name="goods"
            value={editingJob.goods || ""}
            onChange={updateField}
            placeholder="Goods"
          />

          <textarea
            name="extra_note"
            value={editingJob.extra_note || ""}
            onChange={updateField}
            placeholder="Extra Note"
          />

          <button className="save-btn" onClick={updateJobOrder}>
            Save Changes
          </button>
          
          <button className="cancel-btn" onClick={() => setEditingJob(null)}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default ListTodos;