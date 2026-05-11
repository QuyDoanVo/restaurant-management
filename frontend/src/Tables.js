import React, { useEffect, useState } from "react";
import axios from "axios";

function Tables() {
  const [tables, setTables] = useState([]);

  const fetchTables = async () => {
    const res = await axios.get("http://localhost:5000/tables");
    setTables(res.data);
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "#22c55e"; // xanh lá
      case "occupied":
        return "#ef4444"; // đỏ
      default:
        return "#f59e0b"; // vàng (reserved / pending / unknown)
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Tables</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 15,
        }}
      >
        {tables.map((t) => (
          <div
            key={t._id}
            style={{
              padding: 20,
              borderRadius: 12,
              textAlign: "center",
              color: "white",
              background: getStatusColor(t.status),
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              transition: "0.2s",
              cursor: "pointer",
            }}
          >
            <h3 style={{ margin: 0 }}>Table {t.number}</h3>
            <p style={{ marginTop: 8, textTransform: "capitalize" }}>
              {t.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Tables;