import log from "../loggers/file.logger.js";

export default function errorHandler(err, req, res, next) {
  // תיעוד השגיאה בלוגר של השרת
  log.warn(
    `[Error Middleware] Path: ${req.path} | Message: ${err.message || err}`,
  );

  // הדפסת ה-Stack Trace לפיתוח (אופציונלי)
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  // בדיקה אם השגיאה מכילה סטטוס קוד מותאם אישית, אחרת ברירת המחדל היא 500
  const statusCode = err.statusCode || 500;

  // שליחת הודעת השגיאה בצורה אחידה ל-Frontend
  res.status(statusCode).json({
    message:
      err.message || typeof err === "string"
        ? err
        : "התרחשה שגיאה פנימית בשרת, אנא נסה שנית מאוחר יותר",
  });
}
