const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Table = require("../models/Table");
const MenuItem = require("../models/MenuItem");
const Reservation = require("../models/Reservation");

// =======================
// GET ALL ORDERS
// =======================
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("tableId")
      .populate("items.menuItemId");

    res.json(orders);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// CREATE ORDER
// =======================
router.post("/", async (req, res) => {
  try {
    const { tableId, items } = req.body;

    if (!tableId || !items || items.length === 0) {
      return res.status(400).json({
        error: "Missing data"
      });
    }

    console.log("📥 Create order - tableId:", tableId);

    // CHECK RESERVATION SOON
    const upcoming = await Reservation.findOne({
      tableId,
      status: "confirmed",
      startTime: {
        $lte: new Date(Date.now() + 60 * 60000)
      }
    });

    if (upcoming) {
      return res.status(400).json({
        error: "Table is reserved soon"
      });
    }

    // TOTAL PRICE
    const totalPrice = items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    // CREATE ORDER
    const newOrder = new Order({
      tableId,
      items,
      totalPrice,
      status: "pending"
    });

    const savedOrder = await newOrder.save();

    // UPDATE TABLE -> OCCUPIED
    const updatedTable = await Table.findByIdAndUpdate(
      tableId,
      {
        status: "occupied"
      },
      { new: true }
    );

    if (!updatedTable) {
      console.log("❌ Table NOT FOUND:", tableId);
    } else {
      console.log(
        "✅ Table updated to OCCUPIED:",
        updatedTable.number
      );
    }

    // REALTIME
    const io = req.app.get("io");

    io.emit("updateTable", updatedTable);
    io.emit("newOrder", savedOrder);

    res.json(savedOrder);

  } catch (err) {
    console.error("❌ CREATE ORDER ERROR:", err);

    res.status(500).json({
      error: err.message
    });
  }
});

// =======================
// UPDATE ORDER STATUS
// =======================
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const validStatus = [
      "pending",
      "preparing",
      "ready",
      "served",
      "paid"
    ];

    const statusFlow = {
      pending: ["preparing"],
      preparing: ["ready"],
      ready: ["served"],
      served: ["paid"],
      paid: []
    };

    if (!validStatus.includes(status)) {
      return res.status(400).json({
        error: "Invalid status"
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        error: "Order not found"
      });
    }

    // CHECK STATUS FLOW
    const allowedNext = statusFlow[order.status];

    if (!allowedNext.includes(status)) {
      return res.status(400).json({
        error: `Cannot change from ${order.status} to ${status}`
      });
    }

    // UPDATE ORDER STATUS
    order.status = status;

    // SYNC ITEMS STATUS
    if (
      status === "preparing" ||
      status === "ready"
    ) {
      order.items = order.items.map(item => ({
        ...item.toObject(),
        status
      }));
    }

    await order.save();

    // IF PAID -> TABLE AVAILABLE
    let updatedTable = null;

    if (status === "paid") {
      updatedTable = await Table.findByIdAndUpdate(
        order.tableId,
        {
          status: "available"
        },
        { new: true }
      );
    }

    // GET UPDATED ORDER
    const updatedOrder = await Order.findById(order._id)
      .populate("tableId")
      .populate("items.menuItemId");

    // REALTIME
    const io = req.app.get("io");

    if (updatedTable) {
      io.emit("updateTable", updatedTable);
    }

    io.emit("updateOrder", updatedOrder);

    res.json(updatedOrder);

  } catch (err) {
    console.error("❌ UPDATE STATUS ERROR:", err);

    res.status(500).json({
      error: err.message
    });
  }
});

// =======================
// UPDATE ITEM STATUS
// =======================
router.put("/:orderId/items/:itemId", async (req, res) => {
  try {
    const { status } = req.body;

    const validStatus = [
      "pending",
      "preparing",
      "ready"
    ];

    if (!validStatus.includes(status)) {
      return res.status(400).json({
        error: "Invalid status"
      });
    }

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        error: "Order not found"
      });
    }

    const item = order.items.id(req.params.itemId);

    if (!item) {
      return res.status(404).json({
        error: "Item not found"
      });
    }

    // UPDATE ITEM STATUS
    item.status = status;

    // AUTO UPDATE ORDER STATUS
    const allStatus = order.items.map(i => i.status);

    if (allStatus.every(s => s === "ready")) {
      order.status = "ready";

    } else if (
      allStatus.every(s => s === "pending")
    ) {
      order.status = "pending";

    } else {
      order.status = "preparing";
    }

    await order.save();

    // GET UPDATED ORDER
    const updatedOrder = await Order.findById(order._id)
      .populate("tableId")
      .populate("items.menuItemId");

    // REALTIME
    const io = req.app.get("io");

    io.emit("updateOrder", updatedOrder);

    res.json(updatedOrder);

  } catch (err) {
    console.error("❌ UPDATE ITEM ERROR:", err);

    res.status(500).json({
      error: err.message
    });
  }
});

// =======================
// DELETE ORDER
// =======================
router.delete("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        error: "Order not found"
      });
    }

    // FREE TABLE
    const updatedTable = await Table.findByIdAndUpdate(
      order.tableId,
      {
        status: "available"
      },
      { new: true }
    );

    if (!updatedTable) {
      console.log(
        "❌ Table NOT FOUND when deleting:",
        order.tableId
      );
    } else {
      console.log(
        "🗑 Table freed after delete:",
        updatedTable.number
      );
    }

    // DELETE ORDER
    await order.deleteOne();

    // REALTIME
    const io = req.app.get("io");

    io.emit("updateTable", updatedTable);
    io.emit("deleteOrder", req.params.id);

    res.json({
      message: "Order deleted"
    });

  } catch (err) {
    console.error("❌ DELETE ORDER ERROR:", err);

    res.status(500).json({
      error: err.message
    });
  }
});

module.exports = router;