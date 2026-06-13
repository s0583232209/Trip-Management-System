import jwt from "jsonwebtoken";
import log from "../loggers/file.logger.js";

export default async function verifyToken(req, res, next) {
  console.log("verifyToken - src/middlewares/auth.middleware.js");
  log.info(`verifyToken - path: ${req.path}`);
  if (req.path.includes("/auth/")) {
    log.info(`verifyToken - skipping auth routes`);
    return next();
  }
  
  const token = req.cookies.accessToken;
  if (!token) {
    log.warn(`verifyToken - no token provided for path: ${req.path}`);
    return res.status(401).json({ message: "No token provided", code: "NO_TOKEN" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        log.warn(`verifyToken - session timeout`);
        return res.status(401).json({ message: "Session timeout", code: "TOKEN_EXPIRED" });
      }
      log.error(`verifyToken - verification error: ${err.message}`);
      return res.status(403).json({ message: "Failed to authenticate", code: "INVALID_TOKEN" });
    }
    req.user = decoded;
    // console.log("decoded:", decoded);
    log.info(
      `verifyToken - successful for user: ${decoded.role} (id number: ${decoded.userId})`,
    );
    next();
  });
}
