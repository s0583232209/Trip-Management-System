//this is BL layer
// services/auth.service.js

import { getUserRoles } from "../dal/users.dal.js";

export const userHasRole = async (
  userId,
  allowedRoles
) => {

  const roles = await getUserRoles(userId);

  const roleNames = roles.map(
    role => role.role_name
  );

  return allowedRoles.some(
    role => roleNames.includes(role)
  );
};