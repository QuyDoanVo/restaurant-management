const express = require("express");
const router = express.Router();

const Reservation = require("../models/Reservation");
const Table = require("../models/Table");

// =======================
// CREATE RESERVATION
// =======================
router.post("/", async (req, res) => {
  try {
    const { name, phone, people, startTime, endTime, tableId } = req.body;

    if (!name || !phone || !people || !startTime || !endTime) {
      return res.status(400).json({ error: "Missing data" });
    }

    let chosenTable = null;

    // =======================
    // Nếu user CHỌN bàn
    // =======================
    if (tableId) {
      const conflict = await Reservation.findOne({
        tableId,
        status: "confirmed",
        $or: [
          {
            startTime: { $lt: endTime },
            endTime: { $gt: startTime }
          }
        ]
      });

      if (!conflict) {
        chosenTable = await Table.findById(tableId);
      } else {
        return res.status(400).json({
          error: "Table already reserved at this time"
        });
      }
    }

    // =======================
    // Nếu chưa có → auto tìm
    // =======================
    if (!chosenTable) {
      const tables = await Table.find({ capacity: { $gte: people } });

      for (let table of tables) {
        const conflict = await Reservation.findOne({
          tableId: table._id,
          status: "confirmed",
          $or: [
            {
              startTime: { $lt: endTime },
              endTime: { $gt: startTime }
            }
          ]
        });

        if (!conflict) {
          chosenTable = table;
          break;
        }
      }
    }

    let reservation;

    if (chosenTable) {
      reservation = new Reservation({
        name,
        phone,
        people,
        startTime,
        endTime,
        tableId: chosenTable._id,
        status: "confirmed"
      });

      console.log("✅ Reservation confirmed");
    } else {
      reservation = new Reservation({
        name,
        phone,
        people,
        startTime,
        endTime,
        status: "waiting"
      });

      console.log("⏳ Added to waiting list");
    }

    const saved = await reservation.save();

    res.json(saved);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// GET ALL RESERVATIONS
// =======================
router.get("/", async (req, res) => {
  try {
    const list = await Reservation.find().populate("tableId");
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// DELETE RESERVATION
// =======================
router.delete("/:id", async (req, res) => {
  try {
    console.log("🗑 Deleting:", req.params.id);

    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      console.log("❌ Not found");
      return res.status(404).json({ error: "Reservation not found" });
    }

    await reservation.deleteOne();

    console.log("✅ Deleted");

    res.json({ message: "Reservation deleted" });

  } catch (err) {
    console.error("❌ DELETE ERROR:", err); // 👈 QUAN TRỌNG
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;