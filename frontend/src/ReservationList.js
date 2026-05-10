import React, { useEffect, useState } from "react";
import axios from "axios";

function ReservationList() {
    const [list, setList] = useState([]);

    const fetchData = async () => {
        const res = await axios.get("http://localhost:5000/reservations");
        setList(res.data);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const deleteReservation = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/reservations/${id}`);
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Delete failed");
        }
    };

    const cardStyle = {
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
        border: "1px solid #eee",
        background: "white"
    };

    const renderItem = (r) => (
        <div key={r._id} style={cardStyle}>
            <p style={{ margin: 0 }}>
                <b>{r.name}</b> ({r.phone})
            </p>

            <p style={{ margin: "6px 0" }}>
                👥 People: {r.people}
            </p>

            <p style={{ margin: "6px 0" }}>
                🕒 {new Date(r.startTime).toLocaleString()} →{" "}
                {new Date(r.endTime).toLocaleString()}
            </p>

            <p style={{ margin: "6px 0" }}>
                📌 Status: <b>{r.status}</b>
            </p>

            <p style={{ margin: "6px 0" }}>
                🪑 Table: {r.tableId ? `Table ${r.tableId.number}` : "None"}
            </p>

            <button
                onClick={() => deleteReservation(r._id)}
                style={{
                    marginTop: 8,
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    padding: "6px 10px",
                    borderRadius: 6,
                    cursor: "pointer"
                }}
            >
                ❌ Delete
            </button>
        </div>
    );

    return (
        <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            
            {/* ✅ CONFIRMED */}
            <div>
                <h2>✅ Confirmed</h2>
                <div style={{ background: "white", padding: 12, borderRadius: 12 }}>
                    {list
                        .filter(r => r.status === "confirmed")
                        .map(renderItem)}
                </div>
            </div>

            {/* ⏳ WAITING */}
            <div>
                <h2>⏳ Waiting List</h2>
                <div style={{ background: "#fff7ed", padding: 12, borderRadius: 12 }}>
                    {list
                        .filter(r => r.status === "waiting")
                        .map(renderItem)}
                </div>
            </div>

        </div>
    );
}

export default ReservationList;