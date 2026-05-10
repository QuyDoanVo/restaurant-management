const express = require("express");
const router = express.Router();
const Table = require("../models/Table");

// GET ALL TABLES
router.get("/", async (req, res) => {
  try {
    const tables = await Table.find();
    res.json(tables);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;