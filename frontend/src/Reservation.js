import React, { useState, useEffect } from "react";
import axios from "axios";

function Reservation() {
    const [form, setForm] = useState({
        name: "",
        phone: "",
        people: "",
        startTime: "",
        endTime: "",
        tableIds: []
    });

    const handleSubmit = async () => {
        try {
            const res = await axios.post("http://localhost:5000/reservations", form);
            alert("✅ Success: " + res.data.status);
        } catch (err) {
            console.error("❌ ERROR:", err.response?.data || err.message);
            alert(err.response?.data?.error || "Server error, check console");
        }
    };

    const [tables, setTables] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:5000/tables")
            .then(res => setTables(res.data));
    }, []);

    // ✅ STYLE
    const inputStyle = {
        width: "100%",
        padding: 10,
        marginTop: 5,
        borderRadius: 6,
        border: "1px solid #ccc"
    };

    return (
        <div style={{
            maxWidth: 600,
            margin: "0 auto",
            background: "white",
            padding: 30,
            borderRadius: 12,
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
        }}>
            <h2 style={{ marginBottom: 20 }}>📅 Table Reservation</h2>

            {/* NAME */}
            <div style={{ marginBottom: 15 }}>
                <label>Name</label>
                <input
                    style={inputStyle}
                    placeholder="Enter customer name"
                    onChange={e => setForm({ ...form, name: e.target.value })}
                />
            </div>

            {/* PHONE */}
            <div style={{ marginBottom: 15 }}>
                <label>Phone</label>
                <input
                    style={inputStyle}
                    placeholder="Enter phone number"
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                />
            </div>

            {/* PEOPLE */}
            <div style={{ marginBottom: 15 }}>
                <label>Number of people</label>
                <input
                    style={inputStyle}
                    type="number"
                    placeholder="e.g. 4"
                    onChange={e =>
                        setForm({ ...form, people: Number(e.target.value) })
                    }
                />
            </div>

            {/* TABLE */}
            <div style={{ marginBottom: 15 }}>

                <label>Select Tables</label>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fill,minmax(120px,1fr))",
                        gap: 10,
                        marginTop: 10
                    }}
                >

                    {tables.map(t => {

                        const selected =
                            form.tableIds?.includes(t._id);

                        const disabled =
                            t.status === "occupied";

                        return (

                            <div
                                key={t._id}

                                onClick={() => {

                                    if (disabled) return;

                                    let updated =
                                        form.tableIds || [];

                                    if (selected) {

                                        updated =
                                            updated.filter(
                                                id => id !== t._id
                                            );

                                    } else {

                                        updated = [
                                            ...updated,
                                            t._id
                                        ];
                                    }

                                    setForm({
                                        ...form,
                                        tableIds: updated
                                    });
                                }}

                                style={{

                                    padding: 15,

                                    borderRadius: 10,

                                    cursor:
                                        disabled
                                            ? "not-allowed"
                                            : "pointer",

                                    textAlign: "center",

                                    transition: "0.2s",

                                    border:
                                        selected
                                            ? "3px solid #2563eb"
                                            : "2px solid #ddd",

                                    background:
                                        disabled
                                            ? "#ffe5e5"
                                            : selected
                                                ? "#dbeafe"
                                                : "#ecfdf5",

                                    opacity:
                                        disabled ? 0.6 : 1
                                }}
                            >

                                <h3>
                                    Table {t.number}
                                </h3>

                                <p>
                                    {t.status}
                                </p>

                            </div>
                        );
                    })}
                </div>
            </div>

            {/* TIME */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                <div style={{ flex: 1 }}>
                    <label>Start Time</label>
                    <input
                        type="datetime-local"
                        style={inputStyle}
                        onChange={e =>
                            setForm({ ...form, startTime: e.target.value })
                        }
                    />
                </div>

                <div style={{ flex: 1 }}>
                    <label>End Time</label>
                    <input
                        type="datetime-local"
                        style={inputStyle}
                        onChange={e =>
                            setForm({ ...form, endTime: e.target.value })
                        }
                    />
                </div>
            </div>

            {/* BUTTON */}
            <button
                onClick={handleSubmit}
                style={{
                    width: "100%",
                    padding: 12,
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 16,
                    cursor: "pointer"
                }}
            >
                📌 Book Reservation
            </button>
        </div>
    );
}

export default Reservation;