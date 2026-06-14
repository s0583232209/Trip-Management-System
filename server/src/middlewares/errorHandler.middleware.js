import log from "../loggers/file.logger.js";

export default function errorHandler(err, req, res, next) {
  log.warn(
    `[Error Middleware] Path: ${req.path} | Message: ${err.message || err}`,
  );
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  const statusCode = err.status || err.statusCode || 500;

  res.status(statusCode).json({
    message:
      err.message || (typeof err === "string"
        ? err
        : "התרחשה שגיאה פנימית בשרת, אנא נסה שנית מאוחר יותר"),
  });
}
