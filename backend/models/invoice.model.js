const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true, // 1-1
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);