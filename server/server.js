import express from "express";
import cors from "cors";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";

import { connect } from "./db/connection.js";
import verifyToken from "./middleware/verifyToken.middleware.js";
import log from "./utils/logger.js";
import checkAccessPermissions from "./middleware/auth.middleware.js";

configDotenv();

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "localhost";


app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  log.info(`${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

app.get("/", (req, res) => res.json({ message: "Server is running" }));

app.use("/api", verifyToken);

app.use("/api/auth", authRouter);

app.use((err, req, res, next) => {
  log.error(`Unhandled error: ${err.message}, stack: ${err.stack}`);
  res
    .status(500)
    .json({ error: `Unhandled error: ${err.message}, stack: ${err.stack}` });
});


app.listen(PORT, HOST, () => {
  log.info(`Server started on http://${HOST}:${PORT}`);
});
export default app;
