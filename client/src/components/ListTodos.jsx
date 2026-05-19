import { useEffect, useState } from "react";
import { API_BASE_URL } from '../config';

const ListTodos = ({ type }) => {
  // ============================================================
  // STATE VARIABLES - Data and UI state
  // ============================================================
  const [jobOrders, setJobOrders] = useState([]);        // Stores all job orders from database
  const [editingJob, setEditingJob] = useState(null);    // Job being edited (null = not editing)
  const [viewingJob, setViewingJob] = useState(null);    // Job being viewed in details modal
  const [loading, setLoading] = useState(false);         // Shows loading spinner while fetching
  const [showDeleteModal, setShowDeleteModal] = useState(false);  // Controls delete confirmation popup
  const [jobToDelete, setJobToDelete] = useState(null);  // Stores job ID before deletion
  
  // Container editing state
  const [containerInput, setContainerInput] = useState("");  // Temporary input for adding containers
  
  // ============================================================
  // SEARCH & FILTER STATE VARIABLES
  // ============================================================
  const [searchTerm, setSearchTerm] = useState("");           // Text user types to search
  const [searchField, setSearchField] = useState("all");      // Which field to search (all, ajus_number, etc)
  const [selectedYear, setSelectedYear] = useState("");       // Year filter for dates
  const [sortField, setSortField] = useState("eta");          // Which column to sort by
  const [sortOrder, setSortOrder] = useState("ASC");          // ASC (A-Z) or DESC (Z-A)
  const [availableYears, setAvailableYears] = useState([]);   // List of years for year dropdown

  // ============================================================
  // FETCH JOB ORDERS FROM BACKEND
  // ============================================================
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

  // ============================================================
  // FETCH UNIQUE YEARS FOR YEAR FILTER DROPDOWN
  // ============================================================
  const getYears = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/job_orders/years`);
      const years = await response.json();
      setAvailableYears(years);
    } catch (error) {
      console.error(error.message);
    }
  };

  // ============================================================
  // EFFECTS - Run when dependencies change
  // ============================================================
  useEffect(() => {
    getJobOrders();
    getYears();
  }, [type, searchTerm, searchField, selectedYear, sortField, sortOrder]);

  // ============================================================
  // DELETE FUNCTIONS
  // ============================================================
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
      setViewingJob(null);
      getJobOrders();
    } catch (error) {
      console.error(error.message);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setJobToDelete(null);
  };

  // ============================================================
  // EDIT FUNCTIONS
  // ============================================================
  const updateField = (e) => {
    setEditingJob({
      ...editingJob,
      [e.target.name]: e.target.value,
    });
  };

  const getContainersArray = (containersStr) => {
    if (!containersStr) return [];
    if (Array.isArray(containersStr)) return containersStr;
    return containersStr.split(', ').filter(c => c && c.trim() !== "");
  };

  const addContainerToEdit = () => {
    if (containerInput.trim() !== "") {
      const currentContainers = getContainersArray(editingJob.containers);
      setEditingJob({
        ...editingJob,
        containers: [...currentContainers, containerInput.trim()].join(', ')
      });
      setContainerInput("");
    }
  };

  const removeContainerFromEdit = (containerToRemove) => {
    const currentContainers = getContainersArray(editingJob.containers);
    const newContainers = currentContainers.filter(c => c !== containerToRemove);
    setEditingJob({
      ...editingJob,
      containers: newContainers.join(', ')
    });
  };

  const updateJobOrder = async () => {
    try {
      const containersArray = getContainersArray(editingJob.containers);
      const jobToUpdate = {
        ...editingJob,
        containers: containersArray
      };
      
      await fetch(`${API_BASE_URL}/job_orders/${editingJob.job_order_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobToUpdate),
      });
      setEditingJob(null);
      getJobOrders();
    } catch (error) {
      console.error(error.message);
    }
  };

  // ============================================================
  // DATE FORMATTING FUNCTIONS
  // ============================================================
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  };

  const formatDateFull = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // ============================================================
  // SORTING FUNCTIONS
  // ============================================================
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

  const getContainerList = () => {
    if (!editingJob?.containers) return [];
    if (Array.isArray(editingJob.containers)) return editingJob.containers;
    return editingJob.containers.split(', ').filter(c => c && c.trim() !== "");
  };

  // ============================================================
  // TABLE HEADERS RENDERER
  // ============================================================
  const renderHeaders = () => {
    // EXPORT Dashboard - NO action buttons
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
          <th onClick={() => handleSort("shipping_line")} style={{ cursor: "pointer" }}>
            Shipping Line {sortField === "shipping_line" && (sortOrder === "ASC" ? "↑" : "↓")}
          </th>
        </>
      );
    }
    
    // IMPORT Dashboard - NO action buttons
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
          <th onClick={() => handleSort("shipping_line")} style={{ cursor: "pointer" }}>
            Shipping Line {sortField === "shipping_line" && (sortOrder === "ASC" ? "↑" : "↓")}
          </th>
        </>
      );
    }
    
    // DOMESTIC Dashboard - NO action buttons
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
          <th onClick={() => handleSort("shipping_line")} style={{ cursor: "pointer" }}>
            Shipping Line {sortField === "shipping_line" && (sortOrder === "ASC" ? "↑" : "↓")}
          </th>
        </>
      );
    }
    
    // ALL Dashboard - HAS View Details + Edit + Delete buttons
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
        <th onClick={() => handleSort("shipping_line")} style={{ cursor: "pointer" }}>
          Shipping Line {sortField === "shipping_line" && (sortOrder === "ASC" ? "↑" : "↓")}
        </th>
        <th>View Details</th>
        
      </>
    );
  };

  // ============================================================
  // TABLE ROWS RENDERER
  // ============================================================
  const renderRowData = (job) => {
    // EXPORT Dashboard - NO buttons at all
    if (type === "EXPORT") {
      return (
        <>
          <td>{formatDate(job.loading_date)}</td>
          <td>{job.shipper_name}</td>
          <td>{job.volume}</td>
          <td>{job.port_of_loading}</td>
          <td>{job.aju_number}</td>
          <td>{job.shipping_line || "-"}</td>
        </>
      );
    }
    
    // IMPORT Dashboard - NO buttons at all
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
          <td>{job.shipping_line || "-"}</td>
        </>
      );
    }
    
    // DOMESTIC Dashboard - NO buttons at all
    if (type === "DOMESTIC") {
      return (
        <>
          <td>{formatDate(job.loading_date)}</td>
          <td>{job.shipper_name}</td>
          <td>{job.volume}</td>
          <td>{job.port_of_loading}</td>
          <td>{job.shipping_line || "-"}</td>
        </>
      );
    }
    
    // ALL Dashboard - HAS View Details + Edit + Delete buttons
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
        <td>{job.shipping_line || "-"}</td>
        <td className="action-cell">
          <button className="view-btn" onClick={() => setViewingJob(job)}>
            View Details
          </button>
        </td>
      </>
    );
  };

  // ============================================================
  // DETAILS MODAL COMPONENT - Popup with full job details
  // ============================================================
  const JobDetails = ({ job, onClose, onEdit, onDelete }) => {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="details-modal" onClick={(e) => e.stopPropagation()}>
          <div className="details-header">
            <h2>Job Order Details</h2>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
          
          <div className="details-content">
            <div className="details-section">
              <h3>Basic Information</h3>
              <div className="details-grid">
                <div className="details-item">
                  <label>JO Number:</label>
                  <span>{job.jo_number}</span>
                </div>
                <div className="details-item">
                  <label>JO Type:</label>
                  <span>{job.jo_type}</span>
                </div>
                <div className="details-item">
                  <label>Shipper Name:</label>
                  <span>{job.shipper_name || "-"}</span>
                </div>
                <div className="details-item">
                  <label>Consignee Name:</label>
                  <span>{job.consignee_name || "-"}</span>
                </div>
                <div className="details-item">
                  <label>Volume:</label>
                  <span>{job.volume || "-"}</span>
                </div>
                <div className="details-item">
                  <label>Shipping Line:</label>
                  <span>{job.shipping_line || "-"}</span>
                </div>
                <div className="details-item">
                  <label>Vessel Name:</label>
                  <span>{job.vessel_name || "-"}</span>
                </div>
                <div className="details-item">
                  <label>Port of Loading:</label>
                  <span>{job.port_of_loading || "-"}</span>
                </div>
                <div className="details-item">
                  <label>Port of Discharge:</label>
                  <span>{job.port_of_discharge || "-"}</span>
                </div>
                <div className="details-item">
                  <label>Person In Charge:</label>
                  <span>{job.person_in_charge || "-"}</span>
                </div>
                <div className="details-item">
                  <label>AJU Number:</label>
                  <span>{job.aju_number || "-"}</span>
                </div>
                <div className="details-item">
                  <label>Goods / Commodity:</label>
                  <span>{job.goods || "-"}</span>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h3>Dates</h3>
              <div className="details-grid">
                <div className="details-item">
                  <label>ETA:</label>
                  <span>{formatDateFull(job.eta)}</span>
                </div>
                <div className="details-item">
                  <label>ETD:</label>
                  <span>{formatDateFull(job.etd)}</span>
                </div>
                <div className="details-item">
                  <label>Loading Date:</label>
                  <span>{formatDateFull(job.loading_date)}</span>
                </div>
                <div className="details-item">
                  <label>Closing Date:</label>
                  <span>{formatDateFull(job.closing_date)}</span>
                </div>
                <div className="details-item">
                  <label>SPPB Date:</label>
                  <span>{formatDateFull(job.sppb_date)}</span>
                </div>
                <div className="details-item">
                  <label>Dooring Date:</label>
                  <span>{formatDateFull(job.dooring_date)}</span>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h3>Containers</h3>
              <div className="details-item">
                <label>Container Numbers:</label>
                <span>{job.containers || "-"}</span>
              </div>
            </div>

            <div className="details-section">
              <h3>Additional Notes</h3>
              <div className="details-item">
                <label>Extra Note:</label>
                <span>{job.extra_note || "-"}</span>
              </div>
            </div>
          </div>

          <div className="details-buttons">
            <button className="edit-details-btn" onClick={() => {
              onEdit(job);
              onClose();
            }}>
              Edit
            </button>
            <button className="delete-details-btn" onClick={() => {
              onDelete(job);
              onClose();
            }}>
              Delete
            </button>
            <button className="close-details-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <div className="list-todos-container">
      <h2 className="dashboard-title">{type} Dashboard</h2>

      {/* FILTER BAR - Only visible on ALL Dashboard */}
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
              <option value="container_number">Container Number</option>
            </select>
            <input
              type="text"
              className="search-input"
              placeholder={`Search by ${searchField === "all" ? "any field" : searchField === "container_number" ? "Container Number" : searchField.replace("_", " ")}...`}
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

      {/* MAIN TABLE */}
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

      {/* DETAILS MODAL POPUP - Only appears when View Details is clicked on ALL Dashboard */}
      {viewingJob && (
        <JobDetails 
          job={viewingJob}
          onClose={() => setViewingJob(null)}
          onEdit={(job) => {
            setEditingJob(job);
            setViewingJob(null);
          }}
          onDelete={(job) => {
            confirmDelete(job);
            setViewingJob(null);
          }}
        />
      )}

      {/* DELETE CONFIRMATION MODAL */}
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

      {/* EDIT FORM MODAL - Shows when user clicks Edit on ALL Dashboard */}
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
            name="shipping_line"
            value={editingJob.shipping_line || ""}
            onChange={updateField}
            placeholder="Shipping Line"
          />

          <input
            type="text"
            name="vessel_name"
            value={editingJob.vessel_name || ""}
            onChange={updateField}
            placeholder="Vessel Name"
          />

          <input
            type="text"
            name="port_of_loading"
            value={editingJob.port_of_loading || ""}
            onChange={updateField}
            placeholder="Port of Loading"
          />

          <input
            type="text"
            name="port_of_discharge"
            value={editingJob.port_of_discharge || ""}
            onChange={updateField}
            placeholder="Port of Discharge"
          />

          <input
            type="text"
            name="person_in_charge"
            value={editingJob.person_in_charge || ""}
            onChange={updateField}
            placeholder="Person In Charge"
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
            name="goods"
            value={editingJob.goods || ""}
            onChange={updateField}
            placeholder="Goods / Commodity"
          />

          <textarea
            name="extra_note"
            value={editingJob.extra_note || ""}
            onChange={updateField}
            placeholder="Extra Note"
          />

          <h3 style={{ marginTop: "10px", marginBottom: "10px" }}>Containers</h3>
          <div className="form-section">
            <div style={{ padding: "18px" }}>
              <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                <input
                  type="text"
                  placeholder="Enter Container Number (e.g., GESU1234567)"
                  value={containerInput}
                  onChange={(e) => setContainerInput(e.target.value)}
                  style={{ flex: 1, border: "1px solid #ddd", borderRadius: "8px", padding: "10px" }}
                />
                <button 
                  type="button"
                  onClick={addContainerToEdit}
                  style={{ width: "auto", padding: "10px 20px", backgroundColor: "#222" }}
                >
                  Add Container
                </button>
              </div>

              {getContainerList().length > 0 && (
                <div>
                  <label style={{ display: "block", marginBottom: "10px", fontWeight: "600" }}>Current Containers:</label>
                  {getContainerList().map((container, index) => (
                    <div key={index} style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      padding: "8px 12px",
                      backgroundColor: "#f5f5f5",
                      borderRadius: "8px",
                      marginBottom: "8px"
                    }}>
                      <span>{container}</span>
                      <button
                        type="button"
                        onClick={() => removeContainerFromEdit(container)}
                        style={{ 
                          width: "auto", 
                          padding: "4px 12px", 
                          backgroundColor: "#ff385c",
                          fontSize: "12px"
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

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