import React, { useEffect, useState } from "react";
import axios from "axios";

function CreateOrder() {
  const [tables, setTables] = useState([]);
  const [menu, setMenu] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTables();
    fetchMenu();
  }, []);

  const fetchTables = async () => {
    const res = await axios.get("http://localhost:5000/tables");
    setTables(res.data);
  };

  const fetchMenu = async () => {
    const res = await axios.get("http://localhost:5000/menu");
    setMenu(res.data);
  };

  // ➕ add item
  const addItem = (menuItem) => {
    const existing = items.find(i => i.menuItemId === menuItem._id);

    if (existing) {
      setItems(items.map(i =>
        i.menuItemId === menuItem._id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
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

  // ❌ remove item
  const removeItem = (id) => {
    setItems(items.filter(i => i.menuItemId !== id));
  };

  // ➖ decrease
  const decreaseItem = (id) => {
    setItems(items
      .map(i =>
        i.menuItemId === id
          ? { ...i, quantity: i.quantity - 1 }
          : i
      )
      .filter(i => i.quantity > 0)
    );
  };

  // create order
  const createOrder = async () => {

    // chưa chọn bàn
    if (!selectedTable) {

      setError("Please select a table");

      return;
    }

    // chưa có món
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

      console.log(
        "Created order:",
        res.data
      );

      alert("Order created!");

      setItems([]);

    } catch (err) {

      console.error(err);

      alert("Error creating order");
    }
  };

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div style={{ padding: 20 }}>

      <h1>🧾 Create Order</h1>

      {/* TABLE SELECT */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontWeight: "bold" }}>Select Table:</label>
        <select
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
          style={{ marginLeft: 10, padding: 5 }}
        >
          <option value="">-- Select Table --</option>
          {tables.map(t => (
            <option key={t._id} value={t._id}>
              Table {t.number} ({t.status})
            </option>
          ))}
        </select>
      </div>

      {/* MAIN LAYOUT */}
      <div style={{ display: "flex", gap: 20 }}>

        {/* MENU */}
        <div style={{ flex: 1 }}>
          <h3>🍔 Menu</h3>

          {menu.map(m => (
            <div key={m._id} style={{
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: 12,
              marginBottom: 10,
              background: "#fff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <b>{m.name}</b>
                <p style={{ margin: 0 }}>{m.price} VND</p>
              </div>

              <button
                onClick={() => addItem(m)}
                style={{
                  padding: "6px 10px",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: 5
                }}
              >
                ➕ Add
              </button>
            </div>
          ))}
        </div>

        {/* ORDER */}
        <div style={{ flex: 1 }}>
          <h3>🧾 Current Order</h3>

          {items.length === 0 && (
            <p style={{ color: "gray" }}>No items selected</p>
          )}

          {items.map(i => (
            <div key={i.menuItemId} style={{
              borderBottom: "1px solid #eee",
              padding: 10,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <b>{i.name}</b>
                <div>{i.price} x {i.quantity}</div>
              </div>

              <div>
                <button onClick={() => decreaseItem(i.menuItemId)}>➖</button>
                <button onClick={() => addItem({
                  _id: i.menuItemId,
                  name: i.name,
                  price: i.price
                })}>➕</button>
                <button onClick={() => removeItem(i.menuItemId)}>❌</button>
              </div>
            </div>
          ))}

          {/* TOTAL */}
          <h2 style={{ marginTop: 20 }}>
            Total: {total.toLocaleString()} VND
          </h2>

          {/* BUTTON */}
          {error && (

            <p style={{
              color: "red",
              marginTop: 10,
              marginBottom: 10,
              fontWeight: "bold"
            }}>
              {error}
            </p>

          )}

          <button
            onClick={createOrder}
            style={{
              width: "100%",
              marginTop: 10,
              padding: 12,
              background: "green",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              cursor: "pointer"
            }}
          >
            Create Order
          </button>

        </div>

      </div>
    </div>
  );
}

export default CreateOrder;