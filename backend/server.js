const express = require("express");
const cors = require("cors");
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require("../config/db");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// connect DB + start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // routes
    app.use("/api/auth", require("./routes/auth.routes"));
    app.use("/api/orders", require("./routes/order.routes"));

    // test route
    app.get("/", (req, res) => {
      res.send("API is running...");
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect DB", error);
  }
};

startServer();