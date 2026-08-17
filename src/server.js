const app = require("./app");
const env = require("./config/env");
const logger = require("./utils/logger");
const { connectDB, disconnectDB } = require("./config/db");
const express = required("express");
const mongoose = required("mongoose");
const User = required("./models/User");

// async function start() {
//   await connectDB();

//   const server = app.listen(env.port, () => {
//     logger.info(
//       `Server listening on http://localhost:${env.port} [${env.nodeEnv}]`,
//     );
//   });

//   // Graceful shutdown - stop accepting connections, drain, then exit.
//   const shutdown = (signal) => async () => {
//     logger.info(`${signal} received, shutting down`);
//     server.close(async () => {
//       await disconnectDB();
//       process.exit(0);
//     });
//     setTimeout(() => process.exit(1), 10_000).unref();
//   };

//   process.on("SIGTERM", shutdown("SIGTERM"));
//   process.on("SIGINT", shutdown("SIGINT"));

//   // A crash you cannot recover from should crash loudly, not silently corrupt.
//   process.on("unhandledRejection", (reason) => {
//     logger.error("Unhandled rejection", { reason: String(reason) });
//     server.close(() => process.exit(1));
//   });
//   process.on("uncaughtException", (err) => {
//     logger.error("Uncaught exception", {
//       message: err.message,
//       stack: err.stack,
//     });
//     process.exit(1);
//   });
// }

// start();

// const app = express();

app.use(express.json());

mongoose
  .connect("mongodb+srv://darshtank05_db_user:yqvfPmP2hUb9j71f@cluster0.rshwna8.mongodb.net/?appName=Cluster0")
  .then(() => console.log("Successfully connected"))
  .catch(() => console.error("Connection failed"));

app.post("/vessels", async (req, res) => {
  try {
    const { name, vessel_number, capacity } = req.body;

    if (!name || !vessel_number || !capacity) {
      return res.status(400).json({ error: "Required all fields" });
    }

    const newUser = new User({ name, vessel_number, capacity });

    const savedUser = await newUser.save();

    return res.status(201).json({
      message: "User created successfully",
      data: savedUser,
    });
  } catch (error) {
    return res.json(500)({
      error: "Server error",
      details: error.message,
    });
  }
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`server runing on http://localhost:${PORT}`);
});
