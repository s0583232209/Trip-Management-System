//this is BL layer
// services/auth.service.js

import {
  getUserRoles,
  getUserRolesOnTripDay,
} from "../repositories/users.repository.js";
import log from "../loggers/file.logger.js";
export const userHasRole = async (userId, allowedRoles) => {
  console.log("in has role of service");
  const roles = await getUserRoles(userId);
  console.log(roles);
  const roleNames = roles.map((role) => role.role_name);
  log.info(`roles for user id:${userId},  roles: ${roleNames}`);
  console.log(roleNames);
  if (roleNames.find((role) => role.includes("trip leader")))
    return tripLeaderAccess(userId);
  return allowedRoles.some((role) => roleNames.includes(role));
};
function tripLeaderAccess(userId) {
  const tripDate = getUserRolesOnTripDay(userId);
  return tripDate == new Date();
}
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { addUser, getUserById } from "../repositories/users.repository.js";

export function createAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
}

export function createRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

export function sendAuthResponse(res, body, status, accessToken, refreshToken) {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 1000 * 15,
  });
  if (refreshToken) {
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 1000 * 60 * 24 * 7,
    });
  }
  res.status(status).json(body);
}

export async function login(user) {
  const row = await getUserById(user.nationalId, user.institutionNumber);
  if (!row) throw new Error("User not found");
  const isMatch = await bcrypt.compare(user.password, row.hashedPassword);
  if (!isMatch) throw new Error("Incorrect password");
  console.log(user, row);
  const payload = {
    nationalId: user.nationalId,
    institutionNumber: user.institutionNumber,
    userId: row.userId,
    currentTime: new Date(),
    role: row.role,
  };
  return {
    user: {
      role: row.role,
      nationalId: user.nationalId,
      userId: row.userId,
      msg: "success",
    },
    accessToken: createAccessToken(payload),
    refreshToken: createRefreshToken(payload),
  };
}

export async function register(body) {
  const hashedPassword = await bcrypt.hash(
    body.password || body.nationalId,
    12,
  );
  const user = await addUser({ ...body, password: hashedPassword });
  delete user.password;
  console.log(user);
  const payload = {
    nationalId: user.nationalId,
    institutionNumber: user.institutionNumber,
    userId: user.userId,
    currentTime: new Date(),
    role: user.role,
  };
  return {
    user,
    accessToken: createAccessToken(payload),
    refreshToken: createRefreshToken(payload),
  };
}
