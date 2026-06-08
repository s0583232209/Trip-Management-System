//this is BL layer
import bcrypt from "bcrypt";
import * as usersRepo from "../repositories/users.repository.js";

export async function getUserById(id) {
  console.log("in get by id from service");
  const user = await usersRepo.getById(id);
  if (!user) throw new Error("User not found");
  return user;
}

export async function updateProfile(id, details) {
  await usersRepo.updateProfile(id, details);
  const user = await usersRepo.getById(id);
  delete user.password;
  return user;
}

export async function changePassword(
  id,
  { currentPassword, newUsername, newPassword },
) {
  const { hashedPassword } = await usersRepo.getPasswordByUserId(id);
  const isMatch = await bcrypt.compare(currentPassword, hashedPassword);
  if (!isMatch) {
    const err = new Error("Incorrect current password");
    err.status = 400;
    throw err;
  }

  //if (newUsername) await usersRepo.updateUsername(id, newUsername); // check if it is needed

  if (newPassword) {
    const allPasswords = await usersRepo.getAllPasswordsByUserId(id);
    const comparisons = await Promise.all(
      allPasswords.map(({ hashedPassword: h }) =>
        bcrypt.compare(newPassword, h),
      ),
    );
    if (comparisons.some((m) => m)) {
      const err = new Error(
        "New password cannot be a previously used password",
      );
      err.status = 400;
      throw err;
    }
    const hashed = await bcrypt.hash(newPassword, 12);
    await usersRepo.updatePassword(id, hashed);
  }

  const user = await usersRepo.getById(id);
  delete user.password;
  return user;
}
export async function addUser(body) {
  const hashedPassword = await bcrypt.hash(`${body.nationalId}abc`, 12);
  console.log(
    hashedPassword,
    body.nationalId,
    "this is from add user in users.service",
  );
  console.log(body);
  body.password = hashedPassword;
  console.log(body);
  const user = await usersRepo.addUser(body);
  delete user.password;
  return user;
}
export async function getAllUsers(userId) {
  const users = await usersRepo.getAllUsers(userId);
  return users;
}