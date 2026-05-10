const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem"
  },
  name: String,
  quantity: Number,
  price: Number,
  status: {
    type: String,
    enum: ["pending", "preparing", "ready", "served"],
    default: "pending"
  }
});

const orderSchema = new mongoose.Schema({
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Table"
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: ["pending", "preparing", "ready", "served", "paid"],
    default: "pending"
  },
  totalPrice: Number
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);