// models/order.model.js
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },
    name: String, // snapshot để tránh bị thay đổi menu
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
    },
    items: [orderItemSchema], // embedded
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Preparing", "Ready", "Served", "Paid"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);