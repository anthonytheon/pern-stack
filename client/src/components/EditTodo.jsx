import { useState } from "react";

const EditTodo = ({ job }) => {

  const [formData, setFormData] = useState({
    jo_number: job.jo_number || "",
    jo_type: job.jo_type || "",

    shipper_name: job.shipper_name || "",
    consignee_name: job.consignee_name || "",
    volume: job.volume || "",
    shipping_line: job.shipping_line || "",
    voyage_name: job.voyage_name || "",
    port_of_loading: job.port_of_loading || "",
    port_of_discharge: job.port_of_discharge || "",
    person_in_charge: job.person_in_charge || "",

    eta: job.eta ? job.eta.split("T")[0] : "",
    etd: job.etd ? job.etd.split("T")[0] : "",

    goods: job.goods || "",

    loading_date: job.loading_date
      ? job.loading_date.split("T")[0]
      : "",

    closing_date: job.closing_date
      ? job.closing_date.split("T")[0]
      : "",

    aju_number: job.aju_number || "",

    sppb_date: job.sppb_date
      ? job.sppb_date.split("T")[0]
      : "",

    dooring_date: job.dooring_date
      ? job.dooring_date.split("T")[0]
      : "",

    extra_note: job.extra_note || "",
  });

  const onChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const updateJobOrder = async () => {
    try {

      await fetch(
        `http://localhost:5000/job_orders/${job.job_order_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      window.location.reload();

    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <details>

      <summary>Edit</summary>

      <div className="edit-container">

        <input
          type="text"
          name="jo_number"
          value={formData.jo_number}
          onChange={onChange}
          placeholder="JO Number"
        />

        <input
          type="text"
          name="shipper_name"
          value={formData.shipper_name}
          onChange={onChange}
          placeholder="Shipper Name"
        />

        <input
          type="text"
          name="consignee_name"
          value={formData.consignee_name}
          onChange={onChange}
          placeholder="Consignee Name"
        />

        <input
          type="text"
          name="volume"
          value={formData.volume}
          onChange={onChange}
          placeholder="Volume"
        />

        <input
          type="text"
          name="shipping_line"
          value={formData.shipping_line}
          onChange={onChange}
          placeholder="Shipping Line"
        />

        <input
          type="text"
          name="voyage_name"
          value={formData.voyage_name}
          onChange={onChange}
          placeholder="Voyage Name"
        />

        <input
          type="text"
          name="port_of_loading"
          value={formData.port_of_loading}
          onChange={onChange}
          placeholder="POL"
        />

        <input
          type="text"
          name="port_of_discharge"
          value={formData.port_of_discharge}
          onChange={onChange}
          placeholder="POD"
        />

        <input
          type="text"
          name="person_in_charge"
          value={formData.person_in_charge}
          onChange={onChange}
          placeholder="PIC"
        />

        <input
          type="date"
          name="eta"
          value={formData.eta}
          onChange={onChange}
        />

        <input
          type="date"
          name="etd"
          value={formData.etd}
          onChange={onChange}
        />

        <input
          type="date"
          name="loading_date"
          value={formData.loading_date}
          onChange={onChange}
        />

        <input
          type="date"
          name="closing_date"
          value={formData.closing_date}
          onChange={onChange}
        />

        <input
          type="text"
          name="aju_number"
          value={formData.aju_number}
          onChange={onChange}
          placeholder="AJU Number"
        />

        <input
          type="date"
          name="sppb_date"
          value={formData.sppb_date}
          onChange={onChange}
        />

        <input
          type="date"
          name="dooring_date"
          value={formData.dooring_date}
          onChange={onChange}
        />

        <textarea
          name="goods"
          value={formData.goods}
          onChange={onChange}
          placeholder="Goods"
        />

        <textarea
          name="extra_note"
          value={formData.extra_note}
          onChange={onChange}
          placeholder="Extra Note"
        />

        <button onClick={updateJobOrder}>
          Save
        </button>

      </div>

    </details>
  );
};

export default EditTodo;