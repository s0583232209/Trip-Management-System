//this is BL layer
import * as schoolsRepo from "../repositories/schools.repository.js";
import * as usersRepo from "../repositories/users.repository.js";

export async function getSchoolForUser(userId) {
  console.log("getSchoolForUser - src/services/schools.service.js");
  const user = await usersRepo.getById(userId);
  const school = await schoolsRepo.getById(user.school_id);
  return school;
}

export async function updateSchoolForUser(userId, body) {
  console.log("updateSchoolForUser - src/services/schools.service.js");
  const user = await usersRepo.getById(userId);
  await schoolsRepo.updateSchool(user.school_id, body, userId);
  const school = await schoolsRepo.getById(user.school_id);
  return school;
}
