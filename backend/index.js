const express = require("express");
const cors = require("cors");
const messageModel = require("../backend/models/messageModel");
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
const adminId = "67e7d4d4239e88be03f4c93e";
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
      return next(new Error("Authentication error"));
    }
    socket.user = user;
    next();
  } catch (err) {
    return next(new Error("Authentication error"));
  }
});

const onlineUsers = {};
io.on("connection", (socket) => {
  const user = socket.user;
  onlineUsers[user._id.toString()] = socket.id;

  socket.on("sendMessage", async (data) => {
    const payload = {
      from: data.from,
      to: data.to,
      message: data.message,
    };
    const newMessage = new messageModel({
      sender: data.from,
      receiver: data.to,
      content: data.message,
    });

    await newMessage.save();
    const isAdmin = data.from === adminId;

    if (isAdmin) {
      const userSocketId = onlineUsers[data.to];
      if (userSocketId) {
        io.to(userSocketId).emit("receiveMessage", payload);
        console.log("Admin sent to user:", data.to, userSocketId);
      }
    } else {
      const adminSocketId = onlineUsers[adminId];
      const userSend = await userModel.findById(data.from);
      payload.emailUser = userSend.email;
      if (adminSocketId) {
        io.to(adminSocketId).emit("receiveMessage", payload);
        console.log("User sent to admin:", adminSocketId);
      }
    }
  });

  socket.on("disconnect", () => {
    delete onlineUsers[user._id.toString()];
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
