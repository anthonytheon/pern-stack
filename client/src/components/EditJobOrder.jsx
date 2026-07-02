import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../config";

const EditJobOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    jo_number: "",
    jo_type: "",
    shipper_name: "",
    consignee_name: "",
    volume: "",
    shipping_line: "",
    vessel_name: "",
    port_of_loading: "",
    port_of_discharge: "",
    person_in_charge: "",
    aju_number: "",
    eta: "",
    etd: "",
    goods: "",
    loading_date: "",
    closing_date: "",
    sppb_date: "",
    dooring_date: "",
    extra_note: "",
    containers: []
  });

  const [containerInput, setContainerInput] = useState("");

  useEffect(() => {
    fetchJobOrder();
  }, [id]);

  const fetchJobOrder = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/job_orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setFormData({
        ...data,
        eta: data.eta ? data.eta.split("T")[0] : "",
        etd: data.etd ? data.etd.split("T")[0] : "",
        loading_date: data.loading_date ? data.loading_date.split("T")[0] : "",
        closing_date: data.closing_date ? data.closing_date.split("T")[0] : "",
        sppb_date: data.sppb_date ? data.sppb_date.split("T")[0] : "",
        dooring_date: data.dooring_date ? data.dooring_date.split("T")[0] : "",
        containers: data.containers ? data.containers.split(", ").filter(c => c) : []
      });
      setLoading(false);
    } catch (error) {
      setError("Failed to load job order");
      setLoading(false);
    }
  };

  const addContainer = () => {
    if (containerInput.trim() !== "") {
      setFormData({
        ...formData,
        containers: [...formData.containers, containerInput.trim()]
      });
      setContainerInput("");
    }
  };

  const removeContainer = (index) => {
    const newContainers = [...formData.containers];
    newContainers.splice(index, 1);
    setFormData({
      ...formData,
      containers: newContainers
    });
  };

  const onChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = sessionStorage.getItem("token");
      
      const response = await fetch(`${API_BASE_URL}/job_orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to update job order");
        return;
      }

      setSuccess("✅ Job Order updated successfully!");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error(error.message);
      setError("Cannot connect to server");
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="create-job-container">
      <div className="create-job-header">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back to Dashboard
        </button>
        <h1>Edit Job Order</h1>
      </div>

      {success && (
        <div className="success-popup">
          <span className="success-icon">✅</span>
          {success}
        </div>
      )}

      {error && (
        <div className="error-popup">
          <span className="error-icon">❌</span>
          {error}
        </div>
      )}

      <form onSubmit={onSubmitForm}>
        {/* JO TYPE SELECTION - Read only */}
        <div className="form-section">
          <label>JO Type</label>
          <select
            value={formData.jo_type}
            disabled
            style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
          >
            <option value="EXPORT">EXPORT</option>
            <option value="IMPORT">IMPORT</option>
            <option value="DOMESTIC">DOMESTIC</option>
          </select>
        </div>

        {formData.jo_type && (
          <>
            {/* SECTION 1: Basic Information */}
            <div className="form-section-container">
              <h3 className="section-title">📋 Basic Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>JO Number</label>
                  <input
                    type="text"
                    name="jo_number"
                    placeholder="JO Number"
                    value={formData.jo_number}
                    onChange={onChange}
                  />
                </div>

                <div className="form-group">
                  <label>Shipper Name</label>
                  <input
                    type="text"
                    name="shipper_name"
                    placeholder="Enter Shipper Name"
                    value={formData.shipper_name}
                    onChange={onChange}
                  />
                </div>

                <div className="form-group">
                  <label>Consignee Name</label>
                  <input
                    type="text"
                    name="consignee_name"
                    placeholder="Enter Consignee Name"
                    value={formData.consignee_name}
                    onChange={onChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Volume</label>
                  <input
                    type="text"
                    name="volume"
                    placeholder="e.g., 2x40, 1x20"
                    value={formData.volume}
                    onChange={onChange}
                  />
                </div>

                <div className="form-group">
                  <label>Shipping Line</label>
                  <input
                    type="text"
                    name="shipping_line"
                    placeholder="e.g., MAERSK, MSC"
                    value={formData.shipping_line}
                    onChange={onChange}
                  />
                </div>

                <div className="form-group">
                  <label>Vessel Name</label>
                  <input
                    type="text"
                    name="vessel_name"
                    placeholder="Enter Vessel Name"
                    value={formData.vessel_name}
                    onChange={onChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Port of Loading</label>
                  <input
                    type="text"
                    name="port_of_loading"
                    placeholder="e.g., Surabaya, Jakarta"
                    value={formData.port_of_loading}
                    onChange={onChange}
                  />
                </div>

                <div className="form-group">
                  <label>Port of Discharge</label>
                  <input
                    type="text"
                    name="port_of_discharge"
                    placeholder="e.g., Singapore, Bangkok"
                    value={formData.port_of_discharge}
                    onChange={onChange}
                  />
                </div>

                <div className="form-group">
                  <label>Person In Charge</label>
                  <input
                    type="text"
                    name="person_in_charge"
                    placeholder="Name of PIC"
                    value={formData.person_in_charge}
                    onChange={onChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>AJU Number</label>
                  <input
                    type="text"
                    name="aju_number"
                    placeholder="Enter AJU Number"
                    value={formData.aju_number}
                    onChange={onChange}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Dates */}
            <div className="form-section-container">
              <h3 className="section-title">📅 Dates</h3>
              <div className="form-row">
                {(formData.jo_type === "EXPORT" || formData.jo_type === "DOMESTIC") && (
                  <>
                    <div className="form-group">
                      <label>Stuffing Date</label>
                      <input
                        type="date"
                        name="loading_date"
                        value={formData.loading_date}
                        onChange={onChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Closing Date</label>
                      <input
                        type="date"
                        name="closing_date"
                        value={formData.closing_date}
                        onChange={onChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>ETD Date</label>
                      <input
                        type="date"
                        name="etd"
                        value={formData.etd}
                        onChange={onChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>ETA Date</label>
                      <input
                        type="date"
                        name="eta"
                        value={formData.eta}
                        onChange={onChange}
                      />
                    </div>
                  </>
                )}

                {formData.jo_type === "IMPORT" && (
                  <>
                    <div className="form-group">
                      <label>ETA Date</label>
                      <input
                        type="date"
                        name="eta"
                        value={formData.eta}
                        onChange={onChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>ETD Date</label>
                      <input
                        type="date"
                        name="etd"
                        value={formData.etd}
                        onChange={onChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>SPPB Date</label>
                      <input
                        type="date"
                        name="sppb_date"
                        value={formData.sppb_date}
                        onChange={onChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Dooring Date</label>
                      <input
                        type="date"
                        name="dooring_date"
                        value={formData.dooring_date}
                        onChange={onChange}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* SECTION 3: Containers */}
            <div className="form-section-container">
              <h3 className="section-title">📦 Containers</h3>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
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
                      onClick={addContainer}
                      style={{ width: "auto", padding: "10px 20px", backgroundColor: "#222" }}
                    >
                      Add Container
                    </button>
                  </div>

                  {formData.containers.length > 0 && (
                    <div>
                      <label style={{ display: "block", marginBottom: "10px", fontWeight: "600" }}>Added Containers:</label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {formData.containers.map((container, index) => (
                          <div key={index} style={{ 
                            display: "flex", 
                            alignItems: "center",
                            gap: "8px",
                            padding: "6px 12px",
                            backgroundColor: "#f5f5f5",
                            borderRadius: "8px",
                            border: "1px solid #e0e0e0"
                          }}>
                            <span>{container}</span>
                            <button
                              type="button"
                              onClick={() => removeContainer(index)}
                              style={{ 
                                width: "auto", 
                                padding: "2px 10px", 
                                backgroundColor: "#ff385c",
                                fontSize: "12px",
                                borderRadius: "6px"
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 4: Additional Information */}
            <div className="form-section-container">
              <h3 className="section-title">📝 Additional Information</h3>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Goods / Commodity</label>
                  <input
                    type="text"
                    name="goods"
                    placeholder="Describe the goods"
                    value={formData.goods}
                    onChange={onChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Extra Note</label>
                  <textarea
                    name="extra_note"
                    placeholder="Any additional notes..."
                    value={formData.extra_note}
                    onChange={onChange}
                    rows="3"
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", resize: "vertical" }}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="submit-btn">Update Job Order</button>
          </>
        )}
      </form>
    </div>
  );
};

export default EditJobOrder;