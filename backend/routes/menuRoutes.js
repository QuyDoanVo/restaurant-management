const express = require("express");
const router = express.Router();
const MenuItem = require("../models/MenuItem");

router.get("/", async (req, res) => {
  const items = await MenuItem.find();
  res.json(items);
});

module.exports = router;