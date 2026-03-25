const express = require("express");
const cors = require("cors");
require('dotenv').config();
const logger = require('./utils/logger');

const authRoutes = require("./routes/auth");
const noteRoutes = require("./routes/notes");
const profileRoutes = require("./routes/profile");

const app = express();
app.use(cors({ origin: "http://localhost:3000" })); // your frontend dev port
app.use(express.json({ limit: '5mb' }));

app.use("/auth", authRoutes);
app.use("/note", noteRoutes);
app.use("/user", profileRoutes);


const PORT = process.env.PORT || 5000;
// Only start server if not in test mode
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log("Server running at http://localhost:5000");
  });
}

module.exports = app;

