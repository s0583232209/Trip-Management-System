import winston from "winston";
import "winston-daily-rotate-file";
const { combine, timestamp, printf, errors } = winston.format;
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
});
const dailyRotateTransport = new winston.transports.DailyRotateFile({
  filename: "logs/application-%DATE%.log", // %DATE% is replaced based on datePattern
  datePattern: "YYYY-MM-DD", // Rotates every day
  zippedArchive: true, // Compress older files (gzip)
  maxSize: "20m", // Cap file size (e.g., 20 Megabytes)
  maxFiles: "30d", // Automatically delete logs older than 14 days
});
const logger = winston.createLogger({
  level: "info",
  format: combine(timestamp(), errors({ stack: true }), logFormat),
  transports: [
    dailyRotateTransport,
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new winston.transports.Console(),
  ],
});
export default logger;
