const Order = require("../models/order.model");

exports.createOrder = async (req, res) => {
  try {
    const { tableId, items } = req.body;

    const totalPrice = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      tableId,
      items,
      totalPrice,
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrders = async (req, res) => {
  const orders = await Order.find().populate("tableId");
  res.json(orders);
};

exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  res.json(order);
};