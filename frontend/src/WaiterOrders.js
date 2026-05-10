import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function WaiterOrders() {

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loadingId, setLoadingId] = useState(null);

  // =========================
  // FETCH ORDERS
  // =========================
  const fetchOrders = async () => {
    const res = await axios.get("http://localhost:5000/orders");
    setOrders(res.data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // =========================
  // REALTIME
  // =========================
  useEffect(() => {

    socket.on("newOrder", (order) => {
      setOrders(prev => [order, ...prev]);
    });

    socket.on("updateOrder", (updated) => {

      setOrders(prev => {

        const exists =
          prev.some(o => o._id === updated._id);

        if (!exists) {
          return [updated, ...prev];
        }

        return prev.map(o =>
          o._id === updated._id
            ? updated
            : o
        );
      });

    });

    socket.on("deleteOrder", (id) => {
      setOrders(prev =>
        prev.filter(o => o._id !== id)
      );
    });

    return () => {
      socket.off("newOrder");
      socket.off("updateOrder");
      socket.off("deleteOrder");
    };

  }, []);

  // =========================
  // UPDATE STATUS
  // =========================
  const updateStatus = async (
    id,
    status
  ) => {

    try {

      // confirm paid
      if (status === "paid") {

        const ok = window.confirm(
          "Confirm payment?"
        );

        if (!ok) return;
      }

      setLoadingId(id);

      await axios.put(
        `http://localhost:5000/orders/${id}/status`,
        { status }
      );

    } catch (err) {

      alert(
        err.response?.data?.error
      );

    } finally {

      setLoadingId(null);
    }
  };

  // =========================
  // DELETE ORDER
  // =========================
  const deleteOrder = async (id) => {

    const confirmDelete = window.confirm("Delete this order?");

    if (!confirmDelete) return;

    await axios.delete(`http://localhost:5000/orders/${id}`);
  };

  // =========================
  // FILTER
  // =========================
  const statusPriority = {
    pending: 1,
    preparing: 2,
    ready: 3,
    served: 4,
    paid: 5
  };

  const filteredOrders = orders
    .filter(order => {

      const tableNumber =
        order.tableId?.number?.toString() || "";

      const matchSearch =
        tableNumber.includes(search);

      const matchFilter =
        filter === "all" ||
        order.status === filter;

      return matchSearch && matchFilter;
    })

    .sort((a, b) => {

      // paid xuống cuối
      if (a.status === "paid" &&
        b.status !== "paid") {
        return 1;
      }

      if (b.status === "paid" &&
        a.status !== "paid") {
        return -1;
      }

      // sort theo status
      if (
        statusPriority[a.status] !==
        statusPriority[b.status]
      ) {
        return (
          statusPriority[a.status] -
          statusPriority[b.status]
        );
      }

      // mới nhất lên đầu
      return (
        new Date(b.createdAt) -
        new Date(a.createdAt)
      );
    });

  // =========================
  // STATUS COLOR
  // =========================
  const getStatusColor = (status) => {

    switch (status) {
      case "pending":
        return "#f59e0b";

      case "preparing":
        return "#3b82f6";

      case "ready":
        return "#10b981";

      case "served":
        return "#8b5cf6";

      case "paid":
        return "#22c55e";

      default:
        return "#64748b";
    }
  };

  return (
    <div>

      <h1 style={{ marginBottom: 20 }}>
        📋 Order Management
      </h1>

      {/* SEARCH + FILTER */}
      <div style={{
        display: "flex",
        gap: 10,
        marginBottom: 20
      }}>

        <input
          placeholder="Search table..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc"
          }}
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: 10,
            borderRadius: 8
          }}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="served">Served</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {/* ORDERS */}
      {filteredOrders.map(order => (

        <div
          key={order._id}
          style={{

            background:
              Date.now() -
                new Date(order.createdAt)
                > 1000 * 60 * 30
                ? "#ffe5e5"
                : "white",

            padding: 20,
            borderRadius: 12,
            marginBottom: 20,
            boxShadow:
              "0 2px 8px rgba(0,0,0,0.1)"
          }}
        >

          <div style={{
            display: "flex",
            justifyContent: "space-between"
          }}>

            <div>
              <h2>
                Table {order.tableId?.number}
              </h2>

              <p>
                Total: {order.totalPrice} VND
              </p>

              <p>
                Created:
                {" "}
                {new Date(order.createdAt)
                  .toLocaleString()}
              </p>

            </div>

            <div>
              <span style={{
                background: getStatusColor(order.status),
                color: "white",
                padding: "6px 12px",
                borderRadius: 20
              }}>
                {order.status}
              </span>
            </div>

          </div>

          <hr />

          {/* ITEMS */}
          {order.items.map(item => (

            <div
              key={item._id}
              style={{
                padding: 8,
                borderBottom: "1px solid #eee"
              }}
            >
              {item.name} x {item.quantity}
            </div>

          ))}

          {/* ACTIONS */}
          <div style={{
            marginTop: 15,
            display: "flex",
            gap: 10
          }}>

            {order.status === "ready" && (
              <button
                onClick={() => {
                  console.log("CLICK SERVED");
                  updateStatus(order._id, "served");
                }}
              >
                Served
              </button>
            )}

            {order.status === "served" && (
              <button
                disabled={loadingId === order._id}
                onClick={() =>
                  updateStatus(order._id, "paid")
                }
              >
                {
                  loadingId === order._id
                    ? "Updating..."
                    : "Paid"
                }
              </button>
            )}

            {order.status !== "paid" && (

              <button
                onClick={() =>
                  deleteOrder(order._id)
                }
              >
                Delete
              </button>

            )}

          </div>

        </div>

      ))}

    </div>
  );
}

export default WaiterOrders;