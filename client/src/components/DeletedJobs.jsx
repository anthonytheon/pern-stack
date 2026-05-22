import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";

const DeletedJobs = () => {
  const [deletedJobs, setDeletedJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const getDeletedJobs = async () => {
    setLoading(true);

    try {
      const token = sessionStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/admin/deleted-job-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to load deleted jobs");
        return;
      }

      setDeletedJobs(data);
    } catch (error) {
      console.error(error.message);
      alert("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  const restoreJob = async (job) => {
    const confirmed = window.confirm(`Restore job order ${job.jo_number}?`);
    if (!confirmed) return;

    try {
      const token = sessionStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/admin/job-orders/${job.job_order_id}/restore`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to restore job order");
        return;
      }

      getDeletedJobs();
    } catch (error) {
      console.error(error.message);
      alert("Cannot connect to server");
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(dateString);

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    getDeletedJobs();
  }, []);

  return (
    <div className="list-todos-container">
      <h2 className="dashboard-title">Deleted Jobs</h2>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>JO Number</th>
              <th>JO Type</th>
              <th>Shipper</th>
              <th>Consignee</th>
              <th>Volume</th>
              <th>Deleted At</th>
              <th>Deleted By</th>
              <th>Restore</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center" }}>Loading...</td>
              </tr>
            ) : deletedJobs.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center" }}>No deleted jobs</td>
              </tr>
            ) : (
              deletedJobs.map((job) => (
                <tr key={job.job_order_id}>
                  <td>{job.jo_number}</td>
                  <td>{job.jo_type}</td>
                  <td>{job.shipper_name || "-"}</td>
                  <td>{job.consignee_name || "-"}</td>
                  <td>{job.volume || "-"}</td>
                  <td>{formatDateTime(job.deleted_at)}</td>
                  <td>{job.deleted_by_full_name || job.deleted_by_username || "-"}</td>
                  <td>
                    <button className="view-btn" onClick={() => restoreJob(job)}>
                      Restore
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeletedJobs;