const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true, // 1-1 relationship
    },
    method: {
      type: String,
      enum: ["Cash", "Card", "E-wallet"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Success", "Failed"],
      required: true,
    },
    paidAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);