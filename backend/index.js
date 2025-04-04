const express = require("express");
const cors = require("cors");
const authToken = require("../backend/middleware/authToken");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const connectDB = require("./config/db");
const router = require("./routes");
const http = require("http");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const userModel = require("./models/userModel");
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    // origin: ["http://localhost:3000"],
    origin: [
      process.env.FRONTEND_URL || "https://localhost:3000",
      "https://my-mern-shop.vercel.app",
    ],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication error"));
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    const user = await userModel.findById(decoded._id);

    if (!user) {
      console.log("User not found");
      return next(new Error("Authentication error"));
    }
    socket.user = user;
    next();
  } catch (err) {
    return next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.user.email);

  socket.on("sendMessage", (message) => {
    console.log("Message from user:", message);
    io.emit("receiveMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.user.email);
  });
});

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "https://localhost:3000",
      "https://my-mern-shop.vercel.app",
    ],

    // origin: ["http://localhost:3000"],

    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use("/api", router);

const PORT = process.env.PORT || 8080;
// const PORT = 8080;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server đang chạy trên cổng ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Không thể kết nối MongoDB:", err.message);
    process.exit(1);
  });
