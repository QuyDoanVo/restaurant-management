const mongoose = require("mongoose");

const ingredientSchema = new mongoose.Schema({
  name: String,
  unit: String
});

module.exports = mongoose.model("Ingredient", ingredientSchema);