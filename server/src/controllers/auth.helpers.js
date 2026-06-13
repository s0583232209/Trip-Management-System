import jwt from "jsonwebtoken";
import { addToken } from "../repositories/auth.repository.js";
import bcrypt from "bcrypt";
import log from "../loggers/file.logger.js";

export async function tokenHandler(user, access) {
  console.log("tokenHandler - src/controllers/auth.helpers.js");
  const secretKey = access
    ? process.env.JWT_SECRET
    : process.env.JWT_REFRESH_SECRET;
  const token = jwt.sign(user, secretKey, { expiresIn: access ? "15m" : "7d" });
  if (access) return token;
  log.info(`tokenHandler - user: ${user?.email}, userId: ${user?.userId}`);
  if (await addToken(await bcrypt.hash(token, 12), user.userId)) return token;
  throw "error adding refresh token to the data base";
}

export async function handleResponse(res, body, status, token, refreshToken) {
  console.log("handleResponse - src/controllers/auth.helpers.js");
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 1000 * 5,
  });
  if (refreshToken)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 1000 * 60 * 24 * 7,
    });
  res.status(status).send(body);
}
