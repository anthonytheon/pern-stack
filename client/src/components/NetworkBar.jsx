import { useState, useEffect } from "react";

const NetworkBar = () => {
  const [address, setAddress] = useState("");

  useEffect(() => {
    const hostname = window.location.hostname;
    const port = window.location.port;
    const fullAddress = port ? `${hostname}:${port}` : hostname;
    setAddress(fullAddress);
  }, []);

  const copyAddress = () => {
    navigator.clipboard.writeText(`http://${address}`);
    alert("Address copied!");
  };

  return (
    <div style={{
      backgroundColor: "#f7f7f7",
      borderRadius: "12px",
      padding: "12px 16px",
      marginBottom: "20px",
      textAlign: "center",
      fontSize: "14px",
      border: "1px solid #e5e5e5"
    }}>
      <strong style={{ 
        color: "#222222", 
        backgroundColor: "white", 
        padding: "4px 12px", 
        borderRadius: "8px",
        fontFamily: "monospace",
        margin: "0 8px"
      }}>
        http://{address}
      </strong>
    </div>
  );
};

export default NetworkBar;