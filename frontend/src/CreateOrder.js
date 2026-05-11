import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
const socket =
  io("http://localhost:5000");

function CreateOrder() {

  const [tables, setTables] = useState([]);
  const [menu, setMenu] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {

    fetchTables();
    fetchMenu();

    socket.on(
      "updateTable",
      (updatedTable) => {

        setTables(prev =>
          prev.map(t =>
            t._id === updatedTable._id
              ? updatedTable
              : t
          )
        );
      }
    );

    return () => {
      socket.off("updateTable");
    };

  }, []);

  const fetchTables = async () => {
    const res = await axios.get("http://localhost:5000/tables");
    setTables(res.data);
  };

  const fetchMenu = async () => {
    const res = await axios.get("http://localhost:5000/menu");
    setMenu(res.data);
  };

  // ======================
  // ADD ITEM
  // ======================
  const addItem = (menuItem) => {

    const existing =
      items.find(
        i => i.menuItemId === menuItem._id
      );

    if (existing) {

      setItems(
        items.map(i =>
          i.menuItemId === menuItem._id
            ? {
              ...i,
              quantity: i.quantity + 1
            }
            : i
        )
      );

    } else {

      setItems([
        ...items,
        {
          menuItemId: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1
        }
      ]);
    }
  };

  // ======================
  // REMOVE ITEM
  // ======================
  const removeItem = (id) => {

    setItems(
      items.filter(
        i => i.menuItemId !== id
      )
    );
  };

  // ======================
  // DECREASE ITEM
  // ======================
  const decreaseItem = (id) => {

    setItems(
      items
        .map(i =>
          i.menuItemId === id
            ? {
              ...i,
              quantity: i.quantity - 1
            }
            : i
        )
        .filter(i => i.quantity > 0)
    );
  };

  // ======================
  // CREATE ORDER
  // ======================
  const createOrder = async () => {

    if (!selectedTable) {

      setError("Please select a table");
      return;
    }

    if (items.length === 0) {

      setError("Please add at least 1 item");
      return;
    }

    try {

      setError("");

      const res = await axios.post(
        "http://localhost:5000/orders",
        {
          tableId: selectedTable,
          items
        }
      );

      console.log(res.data);

      alert("✅ Order created!");

      setItems([]);

    } catch (err) {

      console.error(err);

      alert("❌ Error creating order");
    }
  };

  // ======================
  // TOTAL
  // ======================
  const total = items.reduce(
    (s, i) =>
      s + i.price * i.quantity,
    0
  );

  // ======================
  // FILTER MENU
  // ======================
  const filteredMenu = menu.filter(m =>
    m.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (

    <div style={{
      background: "#f5f7fb",
      minHeight: "100vh",
      padding: 30
    }}>

      {/* HEADER */}
      <div style={{
        marginBottom: 25
      }}>
        <h1 style={{
          margin: 0,
          fontSize: 32
        }}>
          Create customer orders
        </h1>


      </div>

      {/* MAIN */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 400px",
        gap: 25,
        alignItems: "start"
      }}>

        {/* LEFT */}
        <div>

          {/* TABLES */}
          <div style={{
            background: "white",
            padding: 20,
            borderRadius: 16,
            marginBottom: 20,
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.05)"
          }}>

            <h2 style={{
              marginTop: 0
            }}>
              Select Table
            </h2>

            <div style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill,minmax(120px,1fr))",
              gap: 12
            }}>

              {tables.map(t => (

                <div
                  key={t._id}
                  onClick={() =>
                    t.status !== "occupied" &&
                    setSelectedTable(t._id)
                  }
                  style={{

                    padding: 16,

                    border:
                      selectedTable === t._id
                        ? "3px solid #2563eb"
                        : "2px solid #ddd",

                    borderRadius: 12,

                    cursor:
                      t.status === "occupied"
                        ? "not-allowed"
                        : "pointer",

                    background:
                      t.status === "occupied"
                        ? "#ffe5e5"
                        : "#ecfdf5",

                    textAlign: "center",

                    opacity:
                      t.status === "occupied"
                        ? 0.6
                        : 1
                  }}
                >

                  <h3 style={{
                    margin: 0,
                    marginBottom: 8
                  }}>
                    Table {t.number}
                  </h3>

                  <p style={{
                    margin: "4px 0",
                    fontSize: 14,
                    color: "#555"
                  }}>
                    👥 Capacity: {t.capacity}
                  </p>

                  <p style={{
                    marginTop: 8,
                    color:
                      t.status === "occupied"
                        ? "red"
                        : "green",
                    fontWeight: "bold",
                    textTransform: "capitalize"
                  }}>
                    {t.status}
                  </p>

                </div>
              ))}

            </div>
          </div>

          {/* MENU */}
          <div style={{
            background: "white",
            padding: 20,
            borderRadius: 16,
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.05)"
          }}>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20
            }}>

              <h2 style={{
                margin: 0
              }}>
                Menu
              </h2>

              <input
                placeholder="Search menu..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                style={{
                  padding: 10,
                  width: 220,
                  borderRadius: 10,
                  border: "1px solid #ccc"
                }}
              />

            </div>

            {/* MENU GRID */}
            <div style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill,minmax(220px,1fr))",
              gap: 18,
              maxHeight: "65vh",
              overflowY: "auto",
              paddingRight: 5
            }}>

              {filteredMenu.map(m => (

                <div
                  key={m._id}
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    overflow: "hidden",
                    border: "1px solid #eee",
                    boxShadow:
                      "0 2px 8px rgba(0,0,0,0.05)"
                  }}
                >

                  {/* IMAGE */}
                  <div style={{
                    height: 140,
                    background:
                      "Orange",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 50
                  }}>

                  </div>

                  {/* CONTENT */}
                  <div style={{
                    padding: 15
                  }}>

                    <h3 style={{
                      marginTop: 0,
                      marginBottom: 10
                    }}>
                      {m.name}
                    </h3>

                    <p style={{
                      color: "#2563eb",
                      fontWeight: "bold",
                      fontSize: 18
                    }}>
                      {m.price.toLocaleString()} VND
                    </p>

                    <button
                      onClick={() => addItem(m)}
                      style={{
                        width: "100%",
                        padding: 12,
                        background: "#2563eb",
                        color: "white",
                        border: "none",
                        borderRadius: 10,
                        cursor: "pointer",
                        fontWeight: "bold"
                      }}
                    >
                      ➕ Add to Order
                    </button>

                  </div>

                </div>
              ))}

            </div>

          </div>

        </div>

        {/* RIGHT */}
        <div style={{
          position: "sticky",
          top: 20
        }}>

          <div style={{
            background: "white",
            padding: 20,
            borderRadius: 16,
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.05)"
          }}>

            <h2 style={{
              marginTop: 0
            }}>
              Current Order
            </h2>

            {selectedTable && (

              <div style={{
                marginBottom: 20,
                padding: 12,
                background: "#eff6ff",
                borderRadius: 10
              }}>
                Selected Table:
                {" "}
                <b>
                  {
                    tables.find(
                      t => t._id === selectedTable
                    )?.number
                  }
                </b>
              </div>

            )}

            {/* ITEMS */}
            <div style={{
              maxHeight: "50vh",
              overflowY: "auto",
              marginBottom: 20
            }}>

              {items.length === 0 && (

                <p style={{
                  color: "gray"
                }}>
                  No items selected
                </p>

              )}

              {items.map(i => (

                <div
                  key={i.menuItemId}
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom:
                      "1px solid #eee"
                  }}
                >

                  <div>

                    <b>{i.name}</b>

                    <p style={{
                      margin: 0,
                      color: "gray"
                    }}>
                      {i.price.toLocaleString()}
                      {" "}
                      x
                      {" "}
                      {i.quantity}
                    </p>

                  </div>

                  {/* ACTIONS */}
                  <div style={{
                    display: "flex",
                    gap: 8
                  }}>

                    <button
                      onClick={() =>
                        decreaseItem(
                          i.menuItemId
                        )
                      }
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        border: "none",
                        cursor: "pointer"
                      }}
                    >
                      ➖
                    </button>

                    <button
                      onClick={() =>
                        addItem({
                          _id: i.menuItemId,
                          name: i.name,
                          price: i.price
                        })
                      }
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        border: "none",
                        cursor: "pointer"
                      }}
                    >
                      ➕
                    </button>

                    <button
                      onClick={() =>
                        removeItem(
                          i.menuItemId
                        )
                      }
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        border: "none",
                        background: "#ef4444",
                        color: "white",
                        cursor: "pointer"
                      }}
                    >
                      ✕
                    </button>

                  </div>

                </div>
              ))}

            </div>

            {/* TOTAL */}
            <div style={{
              borderTop: "2px solid #eee",
              paddingTop: 20
            }}>

              <h2>
                Total:
                {" "}
                {total.toLocaleString()}
                {" "}
                VND
              </h2>

              {error && (

                <p style={{
                  color: "red",
                  fontWeight: "bold"
                }}>
                  {error}
                </p>

              )}

              <button
                onClick={createOrder}
                style={{
                  width: "100%",
                  padding: 15,
                  background: "#16a34a",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: "bold",
                  cursor: "pointer",
                  marginTop: 10
                }}
              >
                Create Order
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default CreateOrder;