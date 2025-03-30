const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const connectDB = require("./config/db");
const router = require("./routes");

const app = express();

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "https://localhost:3000",
      "https://my-mern-shop.vercel.app",
    ],

    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use((req, res, next) => {
  res.on("finish", function() {
    console.log(req.method, decodeURI(req.url), JSON.stringify(req.body), res.statusCode);
  });
  next();
})

app.use("/api", router);

const PORT = process.env.PORT || 8080;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy trên cổng ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Không thể kết nối MongoDB:", err.message);
    process.exit(1);
  });
