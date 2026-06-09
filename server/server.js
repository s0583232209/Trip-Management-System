import express from "express";
import { configDotenv } from "dotenv";
import cors from "cors";
import authRouter from "./src/routes/auth.routes.js";
import verifyToken from "./src/middlewares/auth.middleware.js";
import tripsRouter from "./src/routes/trips.routes.js";
import filesRouter from "./src/routes/files.routes.js";
import mediaRouter from "./src/routes/media.routes.js";
import emergenciesRouter from "./src/routes/emergencies.routes.js";
import logger from "./src/middlewares/logger.middleware.js";
import usersRouter from "./src/routes/users.routes.js";
import cookieParser from "cookie-parser";
configDotenv();

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "localhost";

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use("/api", verifyToken);
app.use("/api", logger);
// app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/trips/:id/files", filesRouter);
app.use("/api/media", mediaRouter);
app.use("/api/trips/:id/emergencies", emergenciesRouter);
app.use("/api/trips", tripsRouter);
app.use((err, req, res, next) => {
  // log.error(`Unhandled error: ${err.message}, stack: ${err.stack}`);
  res
    .status(500)
    .json({ error: `Unhandled error: ${err.message}, stack: ${err.stack}` });
});

app.listen(PORT, HOST, () => {
  console.log(`Server started on http://${HOST}:${PORT}`);
});
export default app;
