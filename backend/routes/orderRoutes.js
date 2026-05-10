const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Table = require("../models/Table");
const MenuItem = require("../models/MenuItem");
const Reservation = require("../models/Reservation");

// GET ALL ORDERS
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

// CREATE ORDER
router.post("/", async (req, res) => {
  try {
    const { tableId, items } = req.body;

    if (!tableId || !items || items.length === 0) {
      return res.status(400).json({ error: "Missing data" });
    }

    console.log("📥 Create order - tableId:", tableId);

    // CHECK RESERVATION SOON
    const upcoming = await Reservation.findOne({
      tableId,
      status: "confirmed",
      startTime: {
        $lte: new Date(Date.now() + 60 * 60000) // 1 tiếng nữa
      }
    });

    if (upcoming) {
      return res.status(400).json({
        error: "Table is reserved soon"
      });
    }

    // tính tổng tiền
    const totalPrice = items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    const newOrder = new Order({
      tableId,
      items,
      totalPrice,
      status: "pending"
    });

    const savedOrder = await newOrder.save();

    // UPDATE TABLE -> occupied
    const updatedTable = await Table.findByIdAndUpdate(
      tableId,
      { status: "occupied" },
      { new: true }
    );

    if (!updatedTable) {
      console.log("❌ Table NOT FOUND:", tableId);
    } else {
      console.log("✅ Table updated to OCCUPIED:", updatedTable.number);
    }

    // REALTIME
    const io = req.app.get("io");
    io.emit("newOrder", savedOrder);

    res.json(savedOrder);

  } catch (err) {
    console.error("❌ CREATE ORDER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE ORDER STATUS
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const validStatus = ["pending", "preparing", "ready", "served", "paid"];
    const statusFlow = {
      pending: ["preparing"],
      preparing: ["ready"],
      ready: ["served"],
      served: ["paid"],
      paid: []
    };
    if (!validStatus.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // nếu paid -> bàn available
    if (status === "paid") {
      const updatedTable = await Table.findByIdAndUpdate(
        order.tableId,
        { status: "available" },
        { new: true }
      );

      if (!updatedTable) {
        console.log("❌ Table NOT FOUND when paying:", order.tableId);
      } else {
        console.log("💰 Table freed:", updatedTable.number);
      }
    }

    // update order status
    const allowedNext =
      statusFlow[order.status];

    if (!allowedNext.includes(status)) {

      return res.status(400).json({
        error: `Cannot change from ${order.status} to ${status}`
      });
    }

    // update status
    order.status = status;

    // chỉ sync item khi preparing hoặc ready
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

    const updatedOrder = await Order.findById(order._id)
      .populate("tableId")
      .populate("items.menuItemId");

    // REALTIME
    const io = req.app.get("io");
    io.emit("updateOrder", updatedOrder);

    res.json(updatedOrder);

  } catch (err) {
    console.error("❌ UPDATE STATUS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE ITEM STATUS
router.put("/:orderId/items/:itemId", async (req, res) => {
  try {
    const { status } = req.body;

    const validStatus = [
      "pending",
      "preparing",
      "ready"
    ];
    const statusFlow = {
      pending: ["preparing"],
      preparing: ["ready"],
      ready: ["served"],
      served: ["paid"],
      paid: []
    };
    if (!validStatus.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const item = order.items.id(req.params.itemId);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // update item
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

    // REALTIME
    const io = req.app.get("io");
    io.emit("updateOrder", order);

    res.json(order);

  } catch (err) {
    console.error("❌ UPDATE ITEM ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// DELETE ORDER
// =======================
router.delete("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // 🔥 trả bàn về available
    const updatedTable = await Table.findByIdAndUpdate(
      order.tableId,
      { status: "available" },
      { new: true }
    );

    if (!updatedTable) {
      console.log("❌ Table NOT FOUND when deleting:", order.tableId);
    } else {
      console.log("🗑 Table freed after delete:", updatedTable.number);
    }

    await order.deleteOne();

    // 🔥 REALTIME
    const io = req.app.get("io");
    io.emit("deleteOrder", req.params.id);

    res.json({ message: "Order deleted" });

  } catch (err) {
    console.error("❌ DELETE ORDER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;