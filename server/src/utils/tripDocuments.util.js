// רשימת המסמכים הקבועים שחובה להעלות לכל טיול, לפי קוד מסמך (file_code)
// תואמת ל-REQUIRED_DOCS ב-client/src/pages/trips/documents/TripsLeadersKit.jsx
export const REQUIRED_TRIP_DOCS = [
  { fileCode: 1, title: "מינוי אחראי טיול" },
  { fileCode: 2, title: "אישור יציאה לטיול ממנהל מוסד" },
  { fileCode: 3, title: "אישורי הורים" },
  { fileCode: 4, title: "רשימת תלמידים" },
  { fileCode: 5, title: "רשימת תלמידים עם מגבלות רפואיות" },
  { fileCode: 6, title: "טופס הפניה לטיפול רפואי לתלמיד שנפגע במהלך טיול" },
  { fileCode: 7, title: "רשימת תלמידים שנפגעו במהלך טיול" },
  { fileCode: 8, title: "טופס ביטוח למתנדב" },
  { fileCode: 9, title: "רשימת מלווים וטלפונים חיוניים בטיול" },
  { fileCode: 10, title: "הנחיות למורה אחראי כיתה" },
  { fileCode: 11, title: "טופס תיאום טיולים מאושר" },
];

// מחלץ מתוך route_geojson את עצירות האטרקציה ומחזיר עבורן את רשימת
// המסמכים הנדרשים (אישור רשמי לכל אטרקציה), עם file_code = 200 + אינדקס,
// תואם למיפוי ב-TripsLeadersKit.jsx
export function getAttractionDocs(routeGeoJson) {
  if (!routeGeoJson) return [];
  try {
    const parsed =
      typeof routeGeoJson === "string" ? JSON.parse(routeGeoJson) : routeGeoJson;
    const stops = Array.isArray(parsed?.stops) ? parsed.stops : [];
    return stops
      .filter((s) => s.type === "אטרקציה")
      .map((s, i) => ({ fileCode: 200 + i, title: `אישור רשמי — ${s.name}` }));
  } catch {
    return [];
  }
}
