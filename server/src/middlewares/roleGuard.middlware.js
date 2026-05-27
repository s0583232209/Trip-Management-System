// middleware/roleGuard.js

import { userHasRole }
from "../services/auth.service.js";

const requireRole = (...allowedRoles) => {

  return async (req, res, next) => {

    try {

      const userId = req.user.id;

      const allowed = await userHasRole(
        userId,
        allowedRoles
      );

      if (!allowed) {
        return res.status(403).json({
          message: "Forbidden"
        });
      }

      next();

    } catch (error) {

      return res.status(500).json({
        message: "Server error"
      });
    }
  };
};

export default requireRole;