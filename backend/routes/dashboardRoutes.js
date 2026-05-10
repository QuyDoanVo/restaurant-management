const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Table = require("../models/Table");
const Reservation = require("../models/Reservation");

// DASHBOARD STATS
router.get("/", async (req, res) => {

  try {

    // TOTAL REVENUE
    const paidOrders = await Order.find({
      status: "paid"
    });

    const totalRevenue = paidOrders.reduce(
      (sum, order) => sum + order.totalPrice,
      0
    );

    // TOTAL ORDERS
    const totalOrders = await Order.countDocuments();

    // OCCUPIED TABLES
    const occupiedTables = await Table.countDocuments({
      status: "occupied"
    });

     
    // PENDING ORDERS
     
    const pendingOrders = await Order.countDocuments({
      status: {
        $in: ["pending", "preparing", "ready"]
      }
    });

     
    // RESERVATIONS TODAY
     
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const reservationsToday =
      await Reservation.countDocuments({
        createdAt: {
          $gte: today,
          $lt: tomorrow
        }
      });

     
    // REVENUE CHART
     
    const revenueChart = [];

    for (let i = 6; i >= 0; i--) {

      const start = new Date();
      start.setDate(start.getDate() - i);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      const dailyOrders = await Order.find({
        status: "paid",
        createdAt: {
          $gte: start,
          $lt: end
        }
      });

      const revenue = dailyOrders.reduce(
        (sum, order) => sum + order.totalPrice,
        0
      );

      revenueChart.push({
        day: start.toLocaleDateString(),
        revenue
      });
    }

     
    // ORDER STATUS CHART
     
    const statusChart = [];

    const statuses = [
      "pending",
      "preparing",
      "ready",
      "served",
      "paid"
    ];

    for (let status of statuses) {

      const count = await Order.countDocuments({
        status
      });

      statusChart.push({
        status,
        count
      });
    }

    res.json({
      totalRevenue,
      totalOrders,
      occupiedTables,
      reservationsToday,
      pendingOrders,
      revenueChart,
      statusChart
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
});

module.exports = router;