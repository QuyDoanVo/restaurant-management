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

    // ✅ STATUS COLOR
    const getStatusColor = (status) => {
        switch (status) {
            case "confirmed":
                return "#16a34a";

            case "waiting":
                return "#f59e0b";

            case "cancelled":
                return "#ef4444";

            case "completed":
                return "#2563eb";

            default:
                return "gray";
        }
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

            {/* STATUS DROPDOWN */}
            <p style={{ margin: "6px 0" }}>
                📌 Status:{" "}
                <select
                    value={r.status}
                    onChange={async (e) => {
                        await axios.put(
                            `http://localhost:5000/reservations/${r._id}`,
                            {
                                status: e.target.value
                            }
                        );

                        fetchData();
                    }}
                    style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        marginLeft: 6,
                        color: "white",
                        border: "none",
                        background: getStatusColor(r.status)
                    }}
                >
                    <option value="confirmed">
                        Confirmed
                    </option>

                    <option value="waiting">
                        Waiting
                    </option>

                    <option value="completed">
                        Completed
                    </option>

                    <option value="cancelled">
                        Cancelled
                    </option>
                </select>
            </p>

            {/* MULTIPLE TABLES */}
            <p style={{ margin: "6px 0" }}>
                🪑 Tables:{" "}
                {
                    r.tableIds?.length > 0
                        ? r.tableIds
                              .map((t) => `Table ${t.number}`)
                              .join(", ")
                        : "None"
                }
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
        <div style={{ padding: 20 }}>
            <h2>Reservation List</h2>

            <div
                style={{
                    background: "white",
                    padding: 12,
                    borderRadius: 12
                }}
            >
                {list.map(renderItem)}
            </div>
        </div>
    );
}

export default ReservationList;