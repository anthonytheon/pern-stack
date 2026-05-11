import { useState } from "react";

// HARDCODED API URL - CHANGE THIS IF YOUR IP CHANGES
const API_BASE_URL = 'http://192.168.100.36:5000';

const InputTodo = () => {
  const [joType, setJoType] = useState("");

  const [formData, setFormData] = useState({
    jo_number: "",
    shipper_name: "",
    consignee_name: "",
    volume: "",
    shipping_line: "",
    voyage_name: "",
    port_of_loading: "",
    port_of_discharge: "",
    person_in_charge: "",
    eta: "",
    etd: "",
    goods: "",
    loading_date: "",
    closing_date: "",
    aju_number: "",
    sppb_date: "",
    dooring_date: "",
    extra_note: "",
  });

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

      // CHANGED: localhost to API_BASE_URL
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
              name="voyage_name"
              placeholder="Voyage Name"
              value={formData.voyage_name}
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

          {/* IMPORT ONLY */}

          {joType === "IMPORT" && (
            <>
              <h3>Import Information</h3>

              <div className="form-section">

                <input
                  type="text"
                  name="aju_number"
                  placeholder="AJU Number"
                  value={formData.aju_number}
                  onChange={onChange}
                />

              </div>
            </>
          )}

          {/* TEXT */}

          <h3>Additional Information</h3>

          <div className="form-section">

            <textarea
              name="goods"
              placeholder="Goods"
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