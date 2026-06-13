import loggerRepo from "../repositories/logger.repository.js";
export default async function loggerServic(details){
  console.log("loggerServic - src/services/logger.service.js");
await loggerRepo(details)
}