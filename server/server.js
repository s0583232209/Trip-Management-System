import express from "express";
import { createServer } from "http";
import { initSocket } from "./src/config/socket.js";
import { configDotenv } from "dotenv";
import cors from "cors";
import authRouter from "./src/routes/auth.routes.js";
import verifyToken from "./src/middlewares/auth.middleware.js";
import tripsRouter from "./src/routes/trips.routes.js";
import filesRouter from "./src/routes/files.routes.js";
import emergenciesRouter from "./src/routes/emergencies.routes.js";
import logger from "./src/middlewares/logger.middleware.js";
import errorHandler from "./src/middlewares/errorHandler.middleware.js";
import usersRouter from "./src/routes/users.routes.js";
import classesRouter from "./src/routes/classes.routes.js";
import cookieParser from "cookie-parser";
configDotenv();

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "localhost";

// יוצרים httpServer שעוטף את Express
const httpServer = createServer(app);

// socket.io יושב על אותו httpServer — לא שרת נפרד
initSocket(httpServer);

// מייצאים את io כדי שה-controller יוכל להשתמש בו
export { io } from "./src/config/socket.js";

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use("/api", verifyToken);
app.use("/api", logger);
// app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/classes", classesRouter);
app.use("/api/trips/:id/files", filesRouter);
app.use("/api/trips/:id/emergencies", emergenciesRouter);
app.use("/api/trips", tripsRouter);
app.use(errorHandler);

httpServer.listen(PORT, HOST, () => {
  console.log(`Server started on http://${HOST}:${PORT}`);
});
export default app;
