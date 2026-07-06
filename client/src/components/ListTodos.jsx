import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

const ListTodos = ({ type }) => {
  const navigate = useNavigate();
  const [jobOrders, setJobOrders] = useState([]);
  const [viewingJob, setViewingJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [selectedYear, setSelectedYear] = useState("");
  const [sortField, setSortField] = useState("eta");
  const [sortOrder, setSortOrder] = useState("ASC");
  const [availableYears, setAvailableYears] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const getJobOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (type && type !== "ALL") params.append("type", type);
      if (searchTerm) {
        params.append("search", searchTerm);
        params.append("searchField", searchField);
      }
      if (selectedYear) params.append("year", selectedYear);
      if (sortField) {
        params.append("sort", sortField);
        params.append("order", sortOrder);
      }

      const url = `${API_BASE_URL}/job_orders${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);
      const jsonData = await response.json();
      setJobOrders(jsonData);
      setCurrentPage(1);
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

  const totalPages = Math.ceil(jobOrders.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentJobs = jobOrders.slice(startIndex, startIndex + rowsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const confirmDelete = (job) => {
    setJobToDelete(job);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!jobToDelete) return;
    try {
      const token = sessionStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/job_orders/${jobToDelete.job_order_id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to delete job order");
        return;
      }

      setShowDeleteModal(false);
      setJobToDelete(null);
      setViewingJob(null);
      getJobOrders();
    } catch (error) {
      console.error(error.message);
      alert("Cannot connect to server");
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setJobToDelete(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  };

  const formatDateFull = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
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
    setCurrentPage(1);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return "↑";
    return sortOrder === "ASC" ? "↑" : "↓";
  };

  const renderHeaders = () => {
    if (type === "FREIGHT") {
      return (
        <tr>
          <th onClick={() => handleSort("jo_number")}>JO Number {getSortIcon("jo_number")}</th>
          <th onClick={() => handleSort("loading_date")}>Stuffing Date {getSortIcon("loading_date")}</th>
          <th onClick={() => handleSort("shipper_name")}>Shipper Name {getSortIcon("shipper_name")}</th>
          <th onClick={() => handleSort("consignee_name")}>Consignee Name {getSortIcon("consignee_name")}</th>
          <th onClick={() => handleSort("volume")}>Volume {getSortIcon("volume")}</th>
          <th onClick={() => handleSort("port_of_discharge")}>Port of Discharge {getSortIcon("port_of_discharge")}</th>
          <th onClick={() => handleSort("aju_number")}>AJU Number {getSortIcon("aju_number")}</th>
          <th onClick={() => handleSort("shipping_line")}>Shipping Line {getSortIcon("shipping_line")}</th>
          <th>View Details</th>
        </tr>
      );
    }

    if (type === "EXPORT") {
      return (
        <tr>
          <th onClick={() => handleSort("jo_number")}>JO Number {getSortIcon("jo_number")}</th>
          <th onClick={() => handleSort("loading_date")}>Stuffing Date {getSortIcon("loading_date")}</th>
          <th onClick={() => handleSort("shipper_name")}>Shipper Name {getSortIcon("shipper_name")}</th>
          <th onClick={() => handleSort("consignee_name")}>Consignee Name {getSortIcon("consignee_name")}</th>
          <th onClick={() => handleSort("volume")}>Volume {getSortIcon("volume")}</th>
          <th onClick={() => handleSort("port_of_discharge")}>Port of Discharge {getSortIcon("port_of_discharge")}</th>
          <th onClick={() => handleSort("aju_number")}>AJU Number {getSortIcon("aju_number")}</th>
          <th onClick={() => handleSort("shipping_line")}>Shipping Line {getSortIcon("shipping_line")}</th>
          <th>View Details</th>
        </tr>
      );
    }

    if (type === "IMPORT") {
      return (
        <tr>
          <th onClick={() => handleSort("jo_number")}>JO Number {getSortIcon("jo_number")}</th>
          <th onClick={() => handleSort("consignee_name")}>Consignee Name {getSortIcon("consignee_name")}</th>
          <th onClick={() => handleSort("aju_number")}>AJU Number {getSortIcon("aju_number")}</th>
          <th onClick={() => handleSort("volume")}>Volume {getSortIcon("volume")}</th>
          <th onClick={() => handleSort("port_of_loading")}>Port of Loading {getSortIcon("port_of_loading")}</th>
          <th onClick={() => handleSort("etd")}>ETD {getSortIcon("etd")}</th>
          <th onClick={() => handleSort("eta")}>ETA {getSortIcon("eta")}</th>
          <th onClick={() => handleSort("sppb_date")}>SPPB Date {getSortIcon("sppb_date")}</th>
          <th onClick={() => handleSort("dooring_date")}>Dooring Date {getSortIcon("dooring_date")}</th>
          <th onClick={() => handleSort("shipping_line")}>Shipping Line {getSortIcon("shipping_line")}</th>
          <th>View Details</th>
        </tr>
      );
    }

    if (type === "DOMESTIC") {
      return (
        <tr>
          <th onClick={() => handleSort("jo_number")}>JO Number {getSortIcon("jo_number")}</th>
          <th onClick={() => handleSort("loading_date")}>Stuffing Date {getSortIcon("loading_date")}</th>
          <th onClick={() => handleSort("shipper_name")}>Shipper Name {getSortIcon("shipper_name")}</th>
          <th onClick={() => handleSort("consignee_name")}>Consignee Name {getSortIcon("consignee_name")}</th>
          <th onClick={() => handleSort("volume")}>Volume {getSortIcon("volume")}</th>
          <th onClick={() => handleSort("port_of_discharge")}>Port of Discharge {getSortIcon("port_of_discharge")}</th>
          <th onClick={() => handleSort("shipping_line")}>Shipping Line {getSortIcon("shipping_line")}</th>
          <th>View Details</th>
        </tr>
      );
    }

    if (type === "OTHER") {
      return (
        <tr>
          <th onClick={() => handleSort("jo_number")}>JO Number {getSortIcon("jo_number")}</th>
          <th onClick={() => handleSort("loading_date")}>Stuffing Date {getSortIcon("loading_date")}</th>
          <th onClick={() => handleSort("shipper_name")}>Shipper Name {getSortIcon("shipper_name")}</th>
          <th onClick={() => handleSort("consignee_name")}>Consignee Name {getSortIcon("consignee_name")}</th>
          <th onClick={() => handleSort("volume")}>Volume {getSortIcon("volume")}</th>
          <th onClick={() => handleSort("port_of_discharge")}>Port of Discharge {getSortIcon("port_of_discharge")}</th>
          <th onClick={() => handleSort("aju_number")}>AJU Number {getSortIcon("aju_number")}</th>
          <th onClick={() => handleSort("shipping_line")}>Shipping Line {getSortIcon("shipping_line")}</th>
          <th>View Details</th>
        </tr>
      );
    }

    // ALL Dashboard
    return (
      <tr>
        <th onClick={() => handleSort("jo_number")}>JO Number {getSortIcon("jo_number")}</th>
        <th onClick={() => handleSort("loading_date")}>Stuffing Date {getSortIcon("loading_date")}</th>
        <th onClick={() => handleSort("shipper_name")}>Shipper Name {getSortIcon("shipper_name")}</th>
        <th onClick={() => handleSort("consignee_name")}>Consignee Name {getSortIcon("consignee_name")}</th>
        <th onClick={() => handleSort("aju_number")}>AJU Number {getSortIcon("aju_number")}</th>
        <th onClick={() => handleSort("volume")}>Volume {getSortIcon("volume")}</th>
        <th onClick={() => handleSort("port_of_loading")}>Port of Loading {getSortIcon("port_of_loading")}</th>
        <th onClick={() => handleSort("port_of_discharge")}>Port of Discharge {getSortIcon("port_of_discharge")}</th>
        <th onClick={() => handleSort("etd")}>ETD {getSortIcon("etd")}</th>
        <th onClick={() => handleSort("eta")}>ETA {getSortIcon("eta")}</th>
        <th onClick={() => handleSort("shipping_line")}>Shipping Line {getSortIcon("shipping_line")}</th>
        <th>View Details</th>
      </tr>
    );
  };

  const renderRowData = (job) => {
    if (type === "FREIGHT") {
      return (
        <tr key={job.job_order_id}>
          <td className="wrap-cell" title={job.jo_number}>{job.jo_number}</td>
          <td>{formatDate(job.loading_date)}</td>
          <td>{job.shipper_name}</td>
          <td>{job.consignee_name}</td>
          <td>{job.volume}</td>
          <td>{job.port_of_discharge}</td>
          <td className="wrap-cell" title={job.aju_number}>{job.aju_number}</td>
          <td>{job.shipping_line || "-"}</td>
          <td><button className="view-btn" onClick={() => setViewingJob(job)}>View Details</button></td>
        </tr>
      );
    }
    if (type === "EXPORT") {
      return (
        <tr key={job.job_order_id}>
          <td className="wrap-cell" title={job.jo_number}>{job.jo_number}</td>
          <td>{formatDate(job.loading_date)}</td>
          <td>{job.shipper_name}</td>
          <td>{job.consignee_name}</td>
          <td>{job.volume}</td>
          <td>{job.port_of_discharge}</td>
          <td className="wrap-cell" title={job.aju_number}>{job.aju_number}</td>
          <td>{job.shipping_line || "-"}</td>
          <td><button className="view-btn" onClick={() => setViewingJob(job)}>View Details</button></td>
        </tr>
      );
    }

    if (type === "IMPORT") {
      return (
        <tr key={job.job_order_id}>
          <td className="wrap-cell" title={job.jo_number}>{job.jo_number}</td>
          <td>{job.consignee_name}</td>
          <td className="wrap-cell" title={job.aju_number}>{job.aju_number}</td>
          <td>{job.volume}</td>
          <td>{job.port_of_loading}</td>
          <td>{formatDate(job.etd)}</td>
          <td>{formatDate(job.eta)}</td>
          <td>{formatDate(job.sppb_date)}</td>
          <td>{formatDate(job.dooring_date)}</td>
          <td>{job.shipping_line || "-"}</td>
          <td><button className="view-btn" onClick={() => setViewingJob(job)}>View Details</button></td>
        </tr>
      );
    }

    if (type === "DOMESTIC") {
      return (
        <tr key={job.job_order_id}>
          <td className="wrap-cell" title={job.jo_number}>{job.jo_number}</td>
          <td>{formatDate(job.loading_date)}</td>
          <td>{job.shipper_name}</td>
          <td>{job.consignee_name}</td>
          <td>{job.volume}</td>
          <td>{job.port_of_loading}</td>
          <td>{job.shipping_line || "-"}</td>
          <td><button className="view-btn" onClick={() => setViewingJob(job)}>View Details</button></td>
        </tr>
      );
    }

    if (type === "OTHER") {
      return (
        <tr key={job.job_order_id}>
          <td className="wrap-cell" title={job.jo_number}>{job.jo_number}</td>
          <td>{formatDate(job.loading_date)}</td>
          <td>{job.shipper_name}</td>
          <td>{job.consignee_name}</td>
          <td>{job.volume}</td>
          <td>{job.port_of_discharge}</td>
          <td className="wrap-cell" title={job.aju_number}>{job.aju_number}</td>
          <td>{job.shipping_line || "-"}</td>
          <td><button className="view-btn" onClick={() => setViewingJob(job)}>View Details</button></td>
        </tr>
      );
    }

    // ALL Dashboard
    return (
      <tr key={job.job_order_id}>
        <td className="wrap-cell" title={job.jo_number}>{job.jo_number}</td>
        <td>{formatDate(job.loading_date)}</td>
        <td>{job.shipper_name}</td>
        <td>{job.consignee_name}</td>
        <td className="wrap-cell" title={job.aju_number}>{job.aju_number}</td>
        <td>{job.volume}</td>
        <td>{job.port_of_loading}</td>
        <td>{job.port_of_discharge}</td>
        <td>{formatDate(job.etd)}</td>
        <td>{formatDate(job.eta)}</td>
        <td>{job.shipping_line || "-"}</td>
        <td><button className="view-btn" onClick={() => setViewingJob(job)}>View Details</button></td>
      </tr>
    );
  };

  const JobDetails = ({ job, onClose }) => {
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
                <div className="details-item"><label>JO Number:</label><span>{job.jo_number}</span></div>
                <div className="details-item"><label>JO Type:</label><span>{job.jo_type}</span></div>
                <div className="details-item"><label>Shipper Name:</label><span>{job.shipper_name || "-"}</span></div>
                <div className="details-item"><label>Consignee Name:</label><span>{job.consignee_name || "-"}</span></div>
                <div className="details-item"><label>Volume:</label><span>{job.volume || "-"}</span></div>
                <div className="details-item"><label>Shipping Line:</label><span>{job.shipping_line || "-"}</span></div>
                <div className="details-item"><label>Vessel Name:</label><span>{job.vessel_name || "-"}</span></div>
                <div className="details-item"><label>Port of Loading:</label><span>{job.port_of_loading || "-"}</span></div>
                <div className="details-item"><label>Port of Discharge:</label><span>{job.port_of_discharge || "-"}</span></div>
                <div className="details-item"><label>Person In Charge:</label><span>{job.person_in_charge || "-"}</span></div>
                <div className="details-item"><label>AJU Number:</label><span>{job.aju_number || "-"}</span></div>
                <div className="details-item"><label>Goods:</label><span>{job.goods || "-"}</span></div>
              </div>
            </div>
            <div className="details-section">
              <h3>Dates</h3>
              <div className="details-grid">
                {(job.jo_type === "EXPORT" || job.jo_type === "DOMESTIC" || job.jo_type === "FREIGHT" || job.jo_type === "OTHER") && (
                  <>
                    <div className="details-item"><label>Stuffing Date:</label><span>{formatDateFull(job.loading_date)}</span></div>
                    <div className="details-item"><label>Closing Date:</label><span>{formatDateFull(job.closing_date)}</span></div>
                    <div className="details-item"><label>ETD Date:</label><span>{formatDateFull(job.etd)}</span></div>
                    <div className="details-item"><label>ETA Date:</label><span>{formatDateFull(job.eta)}</span></div>
                  </>
                )}
                {job.jo_type === "IMPORT" && (
                  <>
                    <div className="details-item"><label>ETA Date:</label><span>{formatDateFull(job.eta)}</span></div>
                    <div className="details-item"><label>ETD Date:</label><span>{formatDateFull(job.etd)}</span></div>
                    <div className="details-item"><label>SPPB Date:</label><span>{formatDateFull(job.sppb_date)}</span></div>
                    <div className="details-item"><label>Dooring Date:</label><span>{formatDateFull(job.dooring_date)}</span></div>
                  </>
                )}
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
              navigate(`/edit/${job.job_order_id}`);
              onClose();
            }}>
              Edit
            </button>
            <button className="delete-details-btn" onClick={() => {
              confirmDelete(job);
              onClose();
            }}>
              Delete
            </button>
            <button className="close-details-btn" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="list-todos-container">
      <h2 className="dashboard-title">{type} Dashboard</h2>

      {type === "ALL" && (
        <div className="filter-bar">
          <div className="search-group">
            <select className="filter-select" value={searchField} onChange={(e) => setSearchField(e.target.value)}>
              <option value="all">All Fields</option>
              <option value="aju_number">AJU Number</option>
              <option value="jo_number">JO Number</option>
              <option value="shipper_name">Shipper Name</option>
              <option value="consignee_name">Consignee Name</option>
              <option value="volume">Volume</option>
              <option value="container_number">Container Number</option>
            </select>
            <input type="text" className="search-input" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            {searchTerm && <button className="clear-btn" onClick={() => setSearchTerm("")}>✕</button>}
          </div>
          <div className="filter-group">
            <select className="filter-select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              <option value="">All Years</option>
              {availableYears.map((year) => (<option key={year} value={year}>{year}</option>))}
            </select>
            <button className="reset-btn" onClick={resetFilters}>Reset</button>
          </div>
          <div className="results-count">{loading ? "Loading..." : `${jobOrders.length} results`}</div>
        </div>
      )}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>{renderHeaders()}</thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="20" style={{ textAlign: "center" }}>Loading...</td></tr>
            ) : (
              currentJobs.map((job) => renderRowData(job))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Showing {startIndex + 1}-
            {Math.min(startIndex + rowsPerPage, jobOrders.length)} of{" "}
            {jobOrders.length} results
          </div>

          <div className="pagination-controls">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Previous
            </button>

            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`pagination-btn ${
                  currentPage === page ? "active" : ""
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>

          <div className="rows-per-page">
            <span>Rows:</span>
            <select value={rowsPerPage} onChange={handleRowsPerPageChange}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      )}

      {viewingJob && (
        <JobDetails
          job={viewingJob}
          onClose={() => setViewingJob(null)}
        />
      )}

      {showDeleteModal && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#ff385c" strokeWidth="1.5" />
                <path d="M12 8V12M12 16H12.01" stroke="#ff385c" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="modal-title">Delete Job Order</h3>
            <p className="modal-message">Are you sure you want to delete <strong>{jobToDelete?.jo_number}</strong>?</p>
            <p className="modal-warning">This action cannot be undone.</p>
            <div className="modal-buttons">
              <button className="modal-cancel-btn" onClick={cancelDelete}>Cancel</button>
              <button className="modal-delete-btn" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListTodos;