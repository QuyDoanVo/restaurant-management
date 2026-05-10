const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  rating: Number,
  comment: String
}, { timestamps: true });

module.exports = mongoose.model("Feedback", feedbackSchema);