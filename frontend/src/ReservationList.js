import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/reservations";

function ReservationList() {
    const [list, setList] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    // FETCH DATA
    const fetchData = async () => {
        try {
            const res = await axios.get(API_URL);
            setList(res.data);
        } catch (err) {
            console.error(err);
            alert(
                err.response?.data?.error ||
                "Failed to load reservations"
            );
        }
    };

    // DELETE
    const deleteReservation = async (id) => {
        const confirmDelete =
            window.confirm("Delete this reservation?");

        if (!confirmDelete) return;

        try {
            await axios.delete(`${API_URL}/${id}`);
            fetchData();
        } catch (err) {
            console.error(err);
            alert(
                err.response?.data?.error ||
                "Delete failed"
            );
        }
    };

    // UPDATE STATUS
    const updateStatus = async (id, status) => {
        try {
            await axios.put(`${API_URL}/${id}`, {
                status
            });

            fetchData();
        } catch (err) {
            console.error(err);
            alert(
                err.response?.data?.error ||
                "Update failed"
            );
        }
    };

    // STATUS COLOR
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

    // CARD STYLE
    const cardStyle = {
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
        boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
        border: "1px solid #eee",
        background: "white"
    };

    // SORT
    const sortedList = [...list].sort((a, b) => {
        // waiting top
        if (
            a.status === "waiting" &&
            b.status !== "waiting"
        ) {
            return -1;
        }

        if (
            a.status !== "waiting" &&
            b.status === "waiting"
        ) {
            return 1;
        }

        // newest first
        return (
            new Date(b.createdAt) -
            new Date(a.createdAt)
        );
    });

    // RENDER ITEM
    const renderItem = (r) => (
        <div key={r._id} style={cardStyle}>
            {/* HEADER */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10
                }}
            >
                <div>
                    <h3 style={{ margin: 0 }}>
                        {r.name}
                    </h3>

                    <p
                        style={{
                            margin: 0,
                            color: "#666"
                        }}
                    >
                        📞 {r.phone}
                    </p>
                </div>

                <select
                    value={r.status}
                    onChange={(e) =>
                        updateStatus(
                            r._id,
                            e.target.value
                        )
                    }
                    style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "none",
                        color: "white",
                        background: getStatusColor(
                            r.status
                        ),
                        fontWeight: "bold",
                        cursor: "pointer"
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
            </div>

            {/* PEOPLE */}
            <p style={{ margin: "8px 0" }}>
                👥 <b>People:</b> {r.people}
            </p>

            {/* TIME */}
            <p style={{ margin: "8px 0" }}>
                🕒 <b>Time:</b>{" "}
                {new Date(
                    r.startTime
                ).toLocaleString()}{" "}
                →{" "}
                {new Date(
                    r.endTime
                ).toLocaleString()}
            </p>

            {/* TABLES */}
            <p style={{ margin: "8px 0" }}>
                🪑 <b>Tables:</b>{" "}
                {r.tableIds?.length > 0
                    ? r.tableIds
                          .map(
                              (t) =>
                                  `Table ${t.number}`
                          )
                          .join(", ")
                    : "None"}
            </p>

            {/* CREATED */}
            <p
                style={{
                    margin: "8px 0",
                    color: "#777",
                    fontSize: 14
                }}
            >
                Created:{" "}
                {new Date(
                    r.createdAt
                ).toLocaleString()}
            </p>

            {/* DELETE BUTTON */}
            <button
                onClick={() =>
                    deleteReservation(r._id)
                }
                style={{
                    marginTop: 10,
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: "bold"
                }}
            >
                ❌ Delete
            </button>
        </div>
    );

    return (
        <div
            style={{
                padding: 20,
                maxWidth: 1000,
                margin: "0 auto"
            }}
        >
            <h1 style={{ marginBottom: 20 }}>
                📅 Reservation List
            </h1>

            {sortedList.length === 0 ? (
                <div
                    style={{
                        background: "white",
                        padding: 30,
                        borderRadius: 16,
                        textAlign: "center",
                        color: "#777"
                    }}
                >
                    No reservations
                </div>
            ) : (
                sortedList.map(renderItem)
            )}
        </div>
    );
}

export default ReservationList;