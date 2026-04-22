const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Available", "Occupied", "Reserved"],
      default: "Available",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Table", tableSchema);