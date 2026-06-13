import { userHasRole } from "../services/auth.service.js";
import log from "../loggers/file.logger.js"
export default function requireRole (...allowedRoles) {
  return async (req, res, next) => {
        
    try {
  log.info("in require role middleware")

  // console.log(req.user)
      const userId = req.user.userId;
      // console.log(userId)
      const allowed = await userHasRole(userId, allowedRoles);
      // console.log(allowed)
      if (!allowed) {
        return res.status(403).json({
          message: "Forbidden",
        });
      }

      next();
    } catch (error) {
      // console.log(error)
      // console.log("middleware error...................")
      return res.status(500).json({
        message: "Server error",
      });
    }
  };
};
