import winston from "winston";
import "winston-daily-rotate-file";

const { combine, timestamp, printf, errors } = winston.format;

// 1. הגדרת פונקציה שמפיקה חותמת זמן מדויקת לפי שעון ישראל (כולל שעון קיץ וחורף באופן אוטומטי)
const israelTimestamp = () => {
  console.log("israelTimestamp - src/loggers/file.logger.js");
  return new Intl.DateTimeFormat('he-IL', {
    timeZone: 'Asia/Jerusalem',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false // פורמט 24 שעות (ללא AM/PM)
  }).format(new Date());
};

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
});

const dailyRotateTransport = new winston.transports.DailyRotateFile({
  filename: "logs/application-%DATE%.log", // %DATE% יוחלף בהתאם ל-datePattern
  datePattern: "YYYY-MM-DD", // רוטציה בכל יום
  zippedArchive: true, // דחיסת קבצים ישנים (gzip)
  maxSize: "20m", // מגבלת גודל לקובץ בודד
  maxFiles: "30d", // מחיקה אוטומטית של לוגים בני יותר מ-30 יום
});

const logger = winston.createLogger({
  level: "info",
  // 2. העברת פונקציית שעון ישראל ישירות לתוך הגדרת ה-timestamp
  format: combine(
    timestamp({ format: israelTimestamp }), 
    errors({ stack: true }), 
    logFormat
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