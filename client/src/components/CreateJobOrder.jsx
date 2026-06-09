import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

const CreateJobOrder = () => {
  const navigate = useNavigate();
  const [joType, setJoType] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    jo_number: "",
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

  const generateJoNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000);
    return `JO-${year}${month}${day}-${random}`;
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
    setErrorMessage("");
    setSuccessMessage("");

    try {
      let joNumber = formData.jo_number;
      if (!joNumber || joNumber.trim() === "") {
        joNumber = generateJoNumber();
      }

      const token = sessionStorage.getItem("token");
      
      const body = {
        jo_type: joType,
        ...formData,
        jo_number: joNumber,
      };

      const response = await fetch(`${API_BASE_URL}/job_orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data.error || "Failed to create job order");
        return;
      }

      setSuccessMessage(`✅ Job Order ${joNumber} was successfully created!`);
      
      setJoType("");
      setFormData({
        jo_number: "",
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
      setContainerInput("");

      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (error) {
      console.error(error.message);
      setErrorMessage("Cannot connect to server");
    }
  };

  return (
    <div className="create-job-container">
      <div className="create-job-header">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back to Dashboard
        </button>
        <h1>Create New Job Order</h1>
      </div>

      {successMessage && (
        <div className="success-popup">
          <span className="success-icon">✅</span>
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="error-popup">
          <span className="error-icon">❌</span>
          {errorMessage}
        </div>
      )}

      <form onSubmit={onSubmitForm}>
        <div className="form-section">
          <label>JO Type *</label>
          <select
            value={joType}
            onChange={(e) => setJoType(e.target.value)}
            required
          >
            <option value="">Select JO Type</option>
            <option value="EXPORT">EXPORT</option>
            <option value="IMPORT">IMPORT</option>
            <option value="DOMESTIC">DOMESTIC</option>
          </select>
        </div>

        {joType && (
          <>
            <h3>Common Information</h3>
            <div className="form-section">
              <label>JO Number (optional - auto-generated if empty)</label>
              <input
                type="text"
                name="jo_number"
                placeholder="Leave empty to auto-generate"
                value={formData.jo_number}
                onChange={onChange}
              />

              <label>Shipper Name</label>
              <input
                type="text"
                name="shipper_name"
                placeholder="Enter Shipper Name"
                value={formData.shipper_name}
                onChange={onChange}
              />

              <label>Consignee Name</label>
              <input
                type="text"
                name="consignee_name"
                placeholder="Enter Consignee Name"
                value={formData.consignee_name}
                onChange={onChange}
              />

              <label>Volume</label>
              <input
                type="text"
                name="volume"
                placeholder="e.g., 2x40, 1x20"
                value={formData.volume}
                onChange={onChange}
              />

              <label>Shipping Line</label>
              <input
                type="text"
                name="shipping_line"
                placeholder="e.g., MAERSK, MSC"
                value={formData.shipping_line}
                onChange={onChange}
              />

              <label>Vessel Name</label>
              <input
                type="text"
                name="vessel_name"
                placeholder="Enter Vessel Name"
                value={formData.vessel_name}
                onChange={onChange}
              />

              <label>Port of Loading</label>
              <input
                type="text"
                name="port_of_loading"
                placeholder="e.g., Surabaya, Jakarta"
                value={formData.port_of_loading}
                onChange={onChange}
              />

              <label>Port of Discharge</label>
              <input
                type="text"
                name="port_of_discharge"
                placeholder="e.g., Singapore, Bangkok"
                value={formData.port_of_discharge}
                onChange={onChange}
              />

              <label>Person In Charge</label>
              <input
                type="text"
                name="person_in_charge"
                placeholder="Name of PIC"
                value={formData.person_in_charge}
                onChange={onChange}
              />

              <label>AJU Number</label>
              <input
                type="text"
                name="aju_number"
                placeholder="Enter AJU Number"
                value={formData.aju_number}
                onChange={onChange}
              />
            </div>

            <h3>Containers</h3>
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
                    onClick={addContainer}
                    style={{ width: "auto", padding: "10px 20px", backgroundColor: "#222" }}
                  >
                    Add Container
                  </button>
                </div>

                {formData.containers.length > 0 && (
                  <div>
                    <label style={{ display: "block", marginBottom: "10px", fontWeight: "600" }}>Added Containers:</label>
                    {formData.containers.map((container, index) => (
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
                          onClick={() => removeContainer(index)}
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

            <h3>Dates</h3>
            <div className="form-section">
              {(joType === "EXPORT" || joType === "DOMESTIC") && (
                <>
                  <label>Stuffing Date</label>
                  <input
                    type="date"
                    name="loading_date"
                    value={formData.loading_date}
                    onChange={onChange}
                  />

                  <label>Closing Date</label>
                  <input
                    type="date"
                    name="closing_date"
                    value={formData.closing_date}
                    onChange={onChange}
                  />

                  <label>ETD Date</label>
                  <input
                    type="date"
                    name="etd"
                    value={formData.etd}
                    onChange={onChange}
                  />

                  <label>ETA Date</label>
                  <input
                    type="date"
                    name="eta"
                    value={formData.eta}
                    onChange={onChange}
                  />
                </>
              )}

              {joType === "IMPORT" && (
                <>
                  <label>ETA Date</label>
                  <input
                    type="date"
                    name="eta"
                    value={formData.eta}
                    onChange={onChange}
                  />

                  <label>ETD Date</label>
                  <input
                    type="date"
                    name="etd"
                    value={formData.etd}
                    onChange={onChange}
                  />

                  <label>SPPB Date</label>
                  <input
                    type="date"
                    name="sppb_date"
                    value={formData.sppb_date}
                    onChange={onChange}
                  />

                  <label>Dooring Date</label>
                  <input
                    type="date"
                    name="dooring_date"
                    value={formData.dooring_date}
                    onChange={onChange}
                  />
                </>
              )}
            </div>

            <h3>Additional Information</h3>
            <div className="form-section">
              <label>Goods / Commodity</label>
              <input
                type="text"
                name="goods"
                placeholder="Describe the goods"
                value={formData.goods}
                onChange={onChange}
              />

              <label>Extra Note</label>
              <textarea
                name="extra_note"
                placeholder="Any additional notes..."
                value={formData.extra_note}
                onChange={onChange}
              />
            </div>

            <button type="submit">Create Job Order</button>
          </>
        )}
      </form>
    </div>
  );
};

export default CreateJobOrder;