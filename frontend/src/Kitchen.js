import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function Kitchen() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    socket.on("newOrder", (order) => {
      setOrders(prev => [order, ...prev]);
    });

    socket.on("updateOrder", (updated) => {
      setOrders(prev =>
        prev.map(o => (o._id === updated._id ? updated : o))
      );
    });

    socket.on("deleteOrder", (id) => {
      setOrders(prev => prev.filter(o => o._id !== id));
    });

    return () => {
      socket.off("newOrder");
      socket.off("updateOrder");
      socket.off("deleteOrder");
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/orders");
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateItem = async (orderId, itemId, status) => {
    try {
      await axios.put(
        `http://localhost:5000/orders/${orderId}/items/${itemId}`,
        { status }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const deleteOrder = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/orders/${id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ready":
        return "green";
      case "preparing":
        return "orange";
      default:
        return "gray";
    }
  };

  const statusPriority = {
    pending: 1,
    preparing: 2,
    ready: 3,
    served: 4,
    paid: 5
  };

  const sortedOrders = [...orders].sort((a, b) => {

    if (
      statusPriority[a.status] !==
      statusPriority[b.status]
    ) {

      return (
        statusPriority[a.status] -
        statusPriority[b.status]
      );
    }

    return (
      new Date(b.createdAt) -
      new Date(a.createdAt)
    );
  });

  return (
    <div style={{ padding: 20, background: "#f1f5f9", minHeight: "100vh" }}>
      <h1>🍳 Kitchen Dashboard</h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: 15
      }}>
        {sortedOrders.map(order => (
          <div
            key={order._id}
            style={{
              background: "white",
              padding: 15,
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}
          >

            {/* HEADER */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <h3>Order #{order._id.slice(-5)}</h3>
              <p>
                {new Date(order.createdAt)
                  .toLocaleString()}
              </p>

              <span style={{
                color: getStatusColor(order.status),
                fontWeight: "bold"
              }}>
                {order.status}
              </span>
            </div>

            {/* DELETE ORDER */}
            <button
              onClick={() => deleteOrder(order._id)}
              style={{
                marginBottom: 10,
                background: "#ef4444",
                color: "white",
                border: "none",
                padding: "5px 10px",
                borderRadius: 6,
                cursor: "pointer"
              }}
            >
              ❌ Delete Order
            </button>

            {/* ITEMS */}
            {order.items.map(item => (
              <div
                key={item._id}
                style={{
                  padding: 10,
                  borderBottom: "1px solid #eee"
                }}
              >
                <div style={{ fontWeight: "bold" }}>
                  {item.name}
                </div>

                <div style={{
                  color: getStatusColor(item.status),
                  fontSize: 13,
                  marginBottom: 5
                }}>
                  {item.status}
                </div>

                {/* ACTIONS */}
                <div>
                  <button
                    disabled={item.status !== "pending"}
                    onClick={() =>
                      updateItem(order._id, item._id, "preparing")
                    }
                    style={{
                      marginRight: 5,
                      padding: "4px 8px",
                      border: "none",
                      borderRadius: 5,
                      background: item.status === "pending" ? "#f59e0b" : "#ccc",
                      color: "white",
                      cursor: "pointer"
                    }}
                  >
                    Preparing
                  </button>

                  <button
                    disabled={item.status !== "preparing"}
                    onClick={() =>
                      updateItem(order._id, item._id, "ready")
                    }
                    style={{
                      padding: "4px 8px",
                      border: "none",
                      borderRadius: 5,
                      background: item.status === "preparing" ? "#22c55e" : "#ccc",
                      color: "white",
                      cursor: "pointer"
                    }}
                  >
                    Ready
                  </button>
                </div>
              </div>
            ))}

          </div>
        ))}
      </div>
    </div>
  );
}

export default Kitchen;