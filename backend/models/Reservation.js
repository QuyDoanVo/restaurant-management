const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  name: String,
  phone: String,
  people: Number,

  startTime: Date,
  endTime: Date,

  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Table",
    default: null
  },

  status: {
    type: String,
    enum: ["waiting", "confirmed", "cancelled"],
    default: "waiting"
  }

}, { timestamps: true });

module.exports = mongoose.model("Reservation", reservationSchema);