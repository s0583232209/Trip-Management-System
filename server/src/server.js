import express from "express";
import { configDotenv } from "dotenv";
import authRouter from "./routes/auth.routes.js";
import verifyToken from "./midllewares/verifyToken.middleware.js";
import log from "./utils/logger.js";

configDotenv();

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "localhost";

app.use(express.json());
// app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

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
