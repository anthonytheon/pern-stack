import { useState } from "react";
import { API_BASE_URL } from '../config';

const InputTodo = () => {
  const [joType, setJoType] = useState("");

  const [formData, setFormData] = useState({
    jo_number: "",
    shipper_name: "",
    consignee_name: "",
    volume: "",
    shipping_line: "",
    vessel_name: "",  // CHANGED: from voyage_name to vessel_name
    port_of_loading: "",
    port_of_discharge: "",
    person_in_charge: "",
    aju_number: "",
    eta: "",
    etd: "",
    goods: "",  // Will be input text, not textarea
    loading_date: "",
    closing_date: "",
    sppb_date: "",
    dooring_date: "",
    extra_note: "",
    containers: []  // NEW: array for multiple containers
  });

  const [containerInput, setContainerInput] = useState(""); // Temporary input for container number

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

    try {
      const body = {
        jo_type: joType,
        ...formData,
      };

      await fetch(`${API_BASE_URL}/job_orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      window.location.reload();

    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <form onSubmit={onSubmitForm}>

      <h2>Create Job Order</h2>

      {/* JO TYPE */}

      <div className="form-section">

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

      {/* ONLY SHOW FORM AFTER TYPE SELECTED */}

      {joType && (
        <>

          {/* COMMON FIELDS */}

          <h3>Common Information</h3>

          <div className="form-section">

            <input
              type="text"
              name="jo_number"
              placeholder="JO Number"
              value={formData.jo_number}
              onChange={onChange}
            />

            <input
              type="text"
              name="shipper_name"
              placeholder="Shipper Name"
              value={formData.shipper_name}
              onChange={onChange}
            />

            <input
              type="text"
              name="consignee_name"
              placeholder="Consignee Name"
              value={formData.consignee_name}
              onChange={onChange}
            />

            <input
              type="text"
              name="volume"
              placeholder="Volume"
              value={formData.volume}
              onChange={onChange}
            />

            <input
              type="text"
              name="shipping_line"
              placeholder="Shipping Line"
              value={formData.shipping_line}
              onChange={onChange}
            />

            <input
              type="text"
              name="vessel_name"  // CHANGED: from voyage_name to vessel_name
              placeholder="Vessel Name"
              value={formData.vessel_name}
              onChange={onChange}
            />

            <input
              type="text"
              name="port_of_loading"
              placeholder="Port of Loading"
              value={formData.port_of_loading}
              onChange={onChange}
            />

            <input
              type="text"
              name="port_of_discharge"
              placeholder="Port of Discharge"
              value={formData.port_of_discharge}
              onChange={onChange}
            />

            <input
              type="text"
              name="person_in_charge"
              placeholder="Person In Charge"
              value={formData.person_in_charge}
              onChange={onChange}
            />

            <input
              type="text"
              name="aju_number"
              placeholder="AJU Number"
              value={formData.aju_number}
              onChange={onChange}
            />

          </div>

          {/* CONTAINERS SECTION - NEW */}

          <h3>Containers</h3>

          <div className="form-section">
            <div style={{ padding: "18px" }}>
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
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
                <div style={{ marginTop: "15px" }}>
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

          {/* DATE FIELDS */}

          <h3>Dates</h3>

          <div className="form-section">

            <label>ETA</label>
            <input
              type="date"
              name="eta"
              value={formData.eta}
              onChange={onChange}
            />

            <label>ETD</label>
            <input
              type="date"
              name="etd"
              value={formData.etd}
              onChange={onChange}
            />

            {/* EXPORT + DOMESTIC */}

            {(joType === "EXPORT" || joType === "DOMESTIC") && (
              <>
                <label>Loading Date</label>
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
              </>
            )}

            {/* IMPORT */}

            {joType === "IMPORT" && (
              <>
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

          {/* GOODS - CHANGED from textarea to input */}

          <h3>Additional Information</h3>

          <div className="form-section">

            <input
              type="text"
              name="goods"
              placeholder="Goods / Commodity"
              value={formData.goods}
              onChange={onChange}
            />

            <textarea
              name="extra_note"
              placeholder="Extra Note"
              value={formData.extra_note}
              onChange={onChange}
            />

          </div>

          <button type="submit">
            Create Job Order
          </button>

        </>
      )}

    </form>
  );
};

export default InputTodo;