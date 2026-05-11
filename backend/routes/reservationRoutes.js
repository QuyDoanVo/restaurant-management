const express = require("express");
const router = express.Router();

const Reservation = require("../models/Reservation");
const Table = require("../models/Table");


// CREATE RESERVATION

router.post("/", async (req, res) => {
  try {

    const {
      name,
      phone,
      people,
      startTime,
      endTime,
      tableIds
    } = req.body;

    // REQUIRED DATA
    if (
      !name ||
      !phone ||
      !people ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        error: "Missing data"
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    // CHECK TIME VALID
    if (start >= end) {
      return res.status(400).json({
        error:
          "Start time must be before end time"
      });
    }

    // CHECK TABLE SELECTED
    if (
      !tableIds ||
      tableIds.length === 0
    ) {
      return res.status(400).json({
        error:
          "Please select at least 1 table"
      });
    }

    // FIND TABLES
    const selectedTables =
      await Table.find({
        _id: { $in: tableIds }
      });

    if (
      selectedTables.length !==
      tableIds.length
    ) {
      return res.status(404).json({
        error:
          "Some tables not found"
      });
    }

    // TOTAL CAPACITY
    const totalCapacity =
      selectedTables.reduce(
        (sum, table) =>
          sum + table.capacity,
        0
      );

    if (totalCapacity < people) {
      return res.status(400).json({
        error:
          "Selected tables do not have enough seats"
      });
    }

    // CHECK < 2 HOURS
    const diffMs = start - now;

    const diffHours =
      diffMs / (1000 * 60 * 60);

    const needCheckOccupied =
      diffHours < 2;

    // CHECK OCCUPIED
    if (needCheckOccupied) {

      const occupiedTable =
        selectedTables.find(
          table =>
            table.status ===
            "occupied"
        );

      if (occupiedTable) {
        return res.status(400).json({
          error:
            "Table " + occupiedTable.number + " is currently occupied"
        });
      }
    }

    // CHECK CONFLICT
    const conflict =
      await Reservation.findOne({

        tableIds: {
          $in: tableIds
        },

        status: "confirmed",

        startTime: {
          $lt: end
        },

        endTime: {
          $gt: start
        }

      });

    let reservation;

    // WAITING
    if (conflict) {

      reservation =
        new Reservation({

          name,

          phone,

          people,

          tableIds,

          startTime: start,

          endTime: end,

          status: "waiting"

        });

      console.log(
        "⏳ Added to waiting list"
      );
    }

    // CONFIRMED
    else {

      reservation =
        new Reservation({

          name,

          phone,

          people,

          tableIds,

          startTime: start,

          endTime: end,

          status: "confirmed"

        });

      console.log(
        "✅ Reservation confirmed"
      );
    }

    const saved =
      await reservation.save();

    const populated =
      await Reservation.findById(
        saved._id
      ).populate("tableIds");

    res.json(populated);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }
});


// UPDATE RESERVATION STATUS
router.put("/:id", async (req, res) => {
  try {

    const { status } = req.body;

    const validStatus = [
      "confirmed",
      "waiting",
      "completed",
      "cancelled"
    ];

    if (!validStatus.includes(status)) {
      return res.status(400).json({
        error: "Invalid status"
      });
    }

    // FIND CURRENT RESERVATION
    const reservation =
      await Reservation.findById(
        req.params.id
      );

    if (!reservation) {
      return res.status(404).json({
        error: "Reservation not found"
      });
    }

    // CHECK CONFLICT
    // WHEN CHANGE -> CONFIRMED

    if (status === "confirmed") {

      const conflict =
        await Reservation.findOne({

          _id: {
            $ne: reservation._id
          },

          tableIds: {
            $in: reservation.tableIds
          },

          status: "confirmed",

          startTime: {
            $lt: reservation.endTime
          },

          endTime: {
            $gt: reservation.startTime
          }

        });

      if (conflict) {

        return res.status(400).json({
          error:
            "Cannot confirm because tables are already reserved at this time"
        });

      }
    }

    // UPDATE STATUS
    reservation.status = status;

    await reservation.save();

    const populated =
      await Reservation.findById(
        reservation._id
      ).populate("tableIds");

    res.json(populated);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }
});


// GET ALL RESERVATIONS

router.get("/", async (req, res) => {
  try {

    const reservations =
      await Reservation.find()

        .populate("tableIds")

        .sort({
          startTime: 1
        });

    res.json(reservations);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
});


// DELETE RESERVATION

router.delete("/:id", async (req, res) => {
  try {

    const reservation =
      await Reservation.findById(
        req.params.id
      );

    if (!reservation) {
      return res.status(404).json({
        error:
          "Reservation not found"
      });
    }

    await reservation.deleteOne();

    res.json({
      message:
        "Reservation deleted"
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
});

module.exports = router;
