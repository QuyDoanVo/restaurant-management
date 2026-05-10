const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const orderRoutes = require("./routes/orderRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// create server HTTP
const server = http.createServer(app);



// create socket server
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// allow using io in different files
app.set("io", io);

// 👉 connect socket
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// routes
app.use("/orders", orderRoutes);
app.use("/tables", require("./routes/tableRoutes"));
app.use("/menu", require("./routes/menuRoutes"));
app.use("/reservations", reservationRoutes);
app.use("/dashboard", dashboardRoutes);


// chạy server
server.listen(process.env.PORT, () => {
  console.log("Server running...");
});