import loggerRepo from "../repositories/logger.repository.js";
export default async function loggerServic(details){
await loggerRepo(details)
}