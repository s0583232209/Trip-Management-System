const ISRAEL_TIME_ZONE = "Asia/Jerusalem";
export function getTodayInIsrael() {
  return new Date().toLocaleDateString("en-CA", { timeZone: ISRAEL_TIME_ZONE });
}
