import { userHasRole } from "../services/auth.service.js";
import log from "../loggers/file.logger.js";
export default function requireRole(...allowedRoles) {
  return async (req, res, next) => {
    try {
      log.info("in require role middleware");
      const userId = req.user.userId;
      const allowed = await userHasRole(userId, allowedRoles);
      if (!allowed) {
        return res.status(403).json({
          message: "Forbidden",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        message: "Server error",
      });
    }
  };
}
