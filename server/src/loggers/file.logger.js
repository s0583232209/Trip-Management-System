import winston from "winston";
import "winston-daily-rotate-file";

const { combine, timestamp, printf, errors } = winston.format;

const israelTimestamp = () => {
  return new Intl.DateTimeFormat("he-IL", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
};

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
});

const dailyRotateTransport = new winston.transports.DailyRotateFile({
  filename: "logs/application-%DATE%.log", 
  datePattern: "YYYY-MM-DD", 
  zippedArchive: true, 
  maxSize: "20m",
  maxFiles: "30d", 
});

const logger = winston.createLogger({
  level: "info",
  format: combine(
    timestamp({ format: israelTimestamp }),
    errors({ stack: true }),
    logFormat,
  ),
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
