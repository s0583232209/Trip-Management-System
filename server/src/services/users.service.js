//this is BL layer
import bcrypt from "bcrypt";
import * as usersRepo from "../repositories/users.repository.js";

export async function getUserById(id) {
  console.log("in get by id from service");
  const user = await usersRepo.getById(id);
  if (!user) throw new Error("משתמש לא נמצא");
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
    const err = new Error("סיסמא נוכחית שגויה");
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
      const err = new Error("לא ניתן להשתמש בסיסמא שהשתמשת בה בעבר");
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
  const principal = await usersRepo.getById(body.principalId);
  const hashedPassword = await bcrypt.hash(`${body.nationalId}abc`, 12);
  body.password = hashedPassword;
  body.schoolId = principal.school_id;
  const user = await usersRepo.addUser(body);
  delete user.password;
  return user;
}
export async function getAllUsers(userId) {
  const users = await usersRepo.getAllUsers(userId);
  return users;
}

const ASSIGNABLE_ROLES = ["coordinator", "trip leader", "teacher"];

export async function deleteUser(id, requestingUserId) {
  if (String(id) === String(requestingUserId)) {
    const err = new Error("לא ניתן למחוק את המשתמש המחובר למערכת");
    err.status = 400;
    throw err;
  }

  let targetUser;
  try {
    targetUser = await usersRepo.getById(id);
  } catch {
    const err = new Error("משתמש לא נמצא");
    err.status = 404;
    throw err;
  }

  const roles = await usersRepo.getUserRoles(id);
  if (roles.some((r) => r.role_name === "principal")) {
    const err = new Error("לא ניתן למחוק משתמש בעל תפקיד מנהל");
    err.status = 400;
    throw err;
  }

  await usersRepo.deleteUser(id);
  return { id: Number(id), fullName: targetUser.full_name };
}

export async function addUserRole(id, role) {
  if (!ASSIGNABLE_ROLES.includes(role)) {
    const err = new Error("תפקיד לא חוקי");
    err.status = 400;
    throw err;
  }
  const roles = await usersRepo.getUserRoles(id);
  if (roles.some((r) => r.role_name === "principal")) {
    const err = new Error("לא ניתן לשנות את תפקיד המנהל");
    err.status = 400;
    throw err;
  }
  await usersRepo.addUserRole(id, role);
  return { id: Number(id), role };
}

export async function removeUserRole(id, role) {
  if (!ASSIGNABLE_ROLES.includes(role)) {
    const err = new Error("תפקיד לא חוקי");
    err.status = 400;
    throw err;
  }
  await usersRepo.removeUserRole(id, role);
  return { id: Number(id), role };
}

export async function updateUserRole(id, role) {
  if (!ASSIGNABLE_ROLES.includes(role)) {
    const err = new Error("תפקיד לא חוקי");
    err.status = 400;
    throw err;
  }

  let targetUser;
  try {
    targetUser = await usersRepo.getById(id);
  } catch {
    const err = new Error("משתמש לא נמצא");
    err.status = 404;
    throw err;
  }

  const roles = await usersRepo.getUserRoles(id);
  if (roles.some((r) => r.role_name === "principal")) {
    const err = new Error("לא ניתן לשנות את תפקיד המנהל");
    err.status = 400;
    throw err;
  }

  await usersRepo.updateUserRole(id, role);
  return { id: Number(id), fullName: targetUser.full_name, role };
}