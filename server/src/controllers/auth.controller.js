//this is API layer
import jwt from "jsonwebtoken";
import * as authService from "../services/auth.service.js";
import log from "../loggers/file.logger.js";

export async function register(req, res, next) {
  console.log("register - src/controllers/auth.controller.js");
  log.info("in cotroller - sign up");
  console.log("in sign up");
  try {
    req.body.role = "principal";
    const { user, accessToken, refreshToken } = await authService.register(
      req.body,
    );
    log.info(`register successful for national id: ${req.body.nationalId}`);
    authService.sendAuthResponse(res, user, 200, accessToken, refreshToken);
  } catch (err) {
    log.warn(`register error: ${err.message}`);
    let message;
    if (err.message?.includes("institution_number")) {
      message = "סמל מוסד זה כבר רשום במערכת";
    } else if (
      err.message?.includes("national_id") ||
      err.message?.includes("Duplicate entry")
    ) {
      message = "משתמש עם פרטים אלו כבר קיים במערכת";
    } else {
      message = "הרישום נכשל, נסה שנית מאוחר יותר";
    }
    err.status = 400;
    err.message = message;
    next(err);
  }
}

export function refreshToken(req, res, next) {
  console.log("refreshToken - src/controllers/auth.controller.js");
  const token = req.cookies.refreshToken;
  if (!token) {
    const error = new Error("No refresh token provided");
    error.status = 401;
    return next(error);
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const accessToken = authService.createAccessToken({
      nationalId: decoded.nationalId,
      institutionNumber: decoded.institutionNumber,
      userId: decoded.userId,
      currentTime: new Date(),
      role: decoded.role,
      roles: decoded.roles,
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 1000 * 15,
    });
    res.status(200).json({ message: "Token refreshed" });
  } catch (err) {
    log.warn(`refreshToken error: ${err.message}`);
    err.status = err.name === "TokenExpiredError" ? 401 : 403;
    err.message = "Session expired, please log in again";
    next(err);
  }
}

export function logout(req, res) {
  console.log("logout - src/controllers/auth.controller.js");
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  log.info(`user ${req.body.userId} logged out`);
  res.status(200).json({ message: "Logged out" });
}
export async function login(req, res, next) {
  console.log("login - src/controllers/auth.controller.js");
  try {
    const { user, accessToken, refreshToken } = await authService.login(
      req.body,
    );
    log.info(
      `login successful for national id: ${req.body.nationalId} form institution: ${req.body.institutionNumber}`,
    );
    console.log(user, "this is user fomr auth cotroller");
    authService.sendAuthResponse(res, user, 200, accessToken, refreshToken);
  } catch (err) {
    log.warn(`login error: ${err.message}`);
    err.status = 401;
    err.message = "תעודת זהות, סמל מוסד או סיסמה שגויים";
    next(err);
  }
}
