const Payment = require("../../models/payment.model");

exports.processPayment = async (req, res) => {
  try {
    const payment = await Payment.create(req.body);
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};