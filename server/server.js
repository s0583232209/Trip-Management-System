import express from "express";
import { configDotenv } from "dotenv";
// import authRouter from "./src/routes/auth.routes.js";
// import verifyToken from "./midllewares/verifyToken.middleware.js";
// import log from "./utils/logger.js";
import tripsRouter from "./src/routes/trips.routes.js";
import filesRouter from "./src/routes/files.routes.js";
import mediaRouter from "./src/routes/media.routes.js";
import emergencyRouter from "./src/routes/emergencies.routes.js";
configDotenv();

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "localhost";

app.use(express.json());
// app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/api/trips/:id/files", filesRouter);
app.use("/api/trips/:id/media", mediaRouter);
app.use("/api/trips/:id/emergency", emergencyRouter);
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
const luz = [1, 2, 3, 4, 5, 6, 7];
for (let i = 0; i < luz.length + 20; i++) {
  console.log(luz[Math.floor(Math.random() * luz.length)]);
}
