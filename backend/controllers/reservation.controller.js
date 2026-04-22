const Reservation = require("../../models/reservation.model");

exports.createReservation = async (req, res) => {
  try {
    const reservation = await Reservation.create(req.body);
    res.status(201).json(reservation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};