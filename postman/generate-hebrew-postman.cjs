const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const outDir = __dirname;

const ok2xx =
  'pm.test("תגובה תקינה 2xx", function () { pm.expect(pm.response.code).to.be.within(200, 299); });';
const okStub =
  'pm.test("נקודת הקצה הופעלה", function () { pm.expect(pm.response.code).to.be.within(200, 299); });';
const okUpload =
  'pm.test("בקשת העלאת קובץ מוכנה לייבוא; יש לבחור קובץ מקומי לפני הרצה", function () { pm.expect(pm.response.code).to.be.oneOf([201, 400, 500]); });';

function rawJson(obj) {
  return {
    mode: "raw",
    raw: JSON.stringify(obj, null, 2),
    options: { raw: { language: "json" } },
  };
}

function jsonHeaders() {
  return [{ key: "Content-Type", value: "application/json" }];
}

function script(type, lines) {
  return { listen: type, script: { type: "text/javascript", exec: lines } };
}

function test(lines) {
  return script("test", lines);
}

function reqUrl(pathname) {
  return {
    raw: `{{baseUrl}}${pathname}`,
    host: ["{{baseUrl}}"],
    path: pathname.replace(/^\//, "").split("/"),
  };
}

function item(name, method, pathname, body, events = [], header = jsonHeaders()) {
  const request = { method, header, url: reqUrl(pathname) };
  if (body !== undefined) request.body = body;
  return { name, event: events, request, response: [] };
}

function formItem(name, method, pathname, formdata, events = []) {
  return {
    name,
    event: events,
    request: {
      method,
      header: [],
      body: { mode: "formdata", formdata },
      url: reqUrl(pathname),
    },
    response: [],
  };
}

function setVar(varName, expr) {
  return test([
    ok2xx,
    "const json = pm.response.json();",
    `pm.collectionVariables.set("${varName}", ${expr});`,
  ]);
}

function collectionPre() {
  return script("prerequest", [
    'pm.collectionVariables.set("today", new Date().toISOString().slice(0, 10));',
    "const d = new Date();",
    'd.setDate(d.getDate() + 14); pm.collectionVariables.set("futureDate1", d.toISOString().slice(0, 10));',
    'd.setDate(d.getDate() + 7); pm.collectionVariables.set("futureDate2", d.toISOString().slice(0, 10));',
    'd.setDate(d.getDate() + 7); pm.collectionVariables.set("futureDate3", d.toISOString().slice(0, 10));',
    'd.setDate(d.getDate() + 7); pm.collectionVariables.set("futureDate4", d.toISOString().slice(0, 10));',
  ]);
}

function tripBody(index, leaderVar, school, dateVar) {
  return {
    title: school.tripTitles[index - 1],
    tripLeaderId: `{{${leaderVar}}}`,
    tripLeaderClassId: `{{class${((index - 1) % 3) + 1}Id}}`,
    classIds: ["{{class1Id}}", "{{class2Id}}", "{{class3Id}}"],
    tripDate: `{{${dateVar}}}`,
    status: 1,
    routeGeoJson: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { name: `מסלול ${school.tripTitles[index - 1]}` },
          geometry: {
            type: "LineString",
            coordinates: [
              [35.2137 + index / 1000, 31.7683],
              [35.225 + index / 1000, 31.778],
            ],
          },
        },
      ],
    },
  };
}

function scenario(index, school, institution, principalNational, prefix) {
  const password = `${prefix}Pass123!`;
  const leaderNational = `${principalNational + 4}`;
  const principal = {
    fullName: school.principal,
    nationalId: `${principalNational}`,
    userEmail: school.principalEmail,
    userPhoneNumber: school.principalPhone,
    password,
    role: "principal",
    name: school.name,
    institutionNumber: institution,
    city: school.city,
    street: school.street,
    houseNumber: school.houseNumber,
    postalCode: school.postalCode,
    email: school.email,
  };

  const users = [
    ["coordinator", `${principalNational + 1}`, school.coordinator, "coordinatorId", school.coordinatorEmail, school.coordinatorPhone],
    ["teacher", `${principalNational + 2}`, school.teacher1, "teacher1Id", school.teacher1Email, school.teacher1Phone],
    ["teacher", `${principalNational + 3}`, school.teacher2, "teacher2Id", school.teacher2Email, school.teacher2Phone],
    ["trip leader", leaderNational, school.leader, "leaderId", school.leaderEmail, school.leaderPhone],
  ];

  const items = [];
  items.push(item("01 יצירת חשבון בית ספרי ומנהל מוסד", "POST", "/api/auth/register", rawJson(principal), [setVar("principalId", "json.userId || json.id")]));
  items.push(item("02 התחברות מנהל מוסד", "POST", "/api/auth/login", rawJson({ nationalId: `${principalNational}`, institutionNumber: institution, password }), [setVar("principalId", "json.userId")]));

  users.forEach(([role, nationalId, fullName, varName, userEmail, userPhoneNumber], userIndex) => {
    items.push(item(`03.${userIndex + 1} הוספת משתמש - ${fullName}`, "POST", "/api/users", rawJson({ fullName, nationalId, userEmail, userPhoneNumber, role }), [setVar(varName, "json.userId")]));
  });

  items.push(item("04 קבלת כל משתמשי בית הספר", "GET", "/api/users", undefined, [test([ok2xx])], []));

  school.classes.forEach(([className, grade, varName], classIndex) => {
    items.push(item(`05.${classIndex + 1} הוספת כיתה ${className}`, "POST", "/api/classes", rawJson({ className, grade }), [setVar(varName, "json.id")]));
  });

  items.push(item("06 קבלת כל הכיתות", "GET", "/api/classes", undefined, [test([ok2xx])], []));

  ["today", "futureDate1", "futureDate2", "futureDate3", "futureDate4"].forEach((dateVar, tripIndex) => {
    items.push(item(`07.${tripIndex + 1} יצירת טיול - ${school.tripTitles[tripIndex]}`, "POST", "/api/trips", rawJson(tripBody(tripIndex + 1, tripIndex % 2 === 0 ? "leaderId" : "teacher1Id", school, dateVar)), [setVar(`trip${tripIndex + 1}Id`, "json.insertId || json.id")]));
  });

  items.push(item("08 קבלת כל הטיולים", "GET", "/api/trips", undefined, [test([ok2xx])], []));
  items.push(item("09 קבלת פרטי טיול ראשון", "GET", "/api/trips/{{trip1Id}}", undefined, [test([ok2xx])], []));
  items.push(item("10 עדכון פרטי טיול שני", "PUT", "/api/trips/{{trip2Id}}", rawJson({ title: `${school.tripTitles[1]} - מסלול מעודכן`, tripDate: "{{futureDate1}}", tripLeaderNationalId: "{{teacher1Id}}", routeGeoJson: { type: "FeatureCollection", features: [] } }), [test([ok2xx])]));
  items.push(item("11 שיבוץ צוות פנימי לטיול ראשון", "POST", "/api/trips/{{trip1Id}}/staff", rawJson({ staffAssignments: [{ staffId: "{{teacher1Id}}", classId: "{{class1Id}}" }, { staffId: "{{teacher2Id}}", classId: "{{class2Id}}" }, { staffId: "{{coordinatorId}}", classId: "{{class3Id}}" }] }), [test([ok2xx])]));
  items.push(item("12 הוספת מאבטח חיצוני לטיול ראשון", "POST", "/api/trips/{{trip1Id}}/external-staff", rawJson({ externalStaff: [{ fullName: school.guard, role: 1, phoneNumber: school.guardPhone }] }), [test([ok2xx])]));
  items.push(item("13 הוספת חובש חיצוני לטיול ראשון", "POST", "/api/trips/{{trip1Id}}/external-staff", rawJson({ externalStaff: [{ fullName: school.medic, role: 2, phoneNumber: school.medicPhone }] }), [test([ok2xx])]));
  items.push(item("14 קבלת צוות הטיול הראשון", "GET", "/api/trips/{{trip1Id}}/staff", undefined, [test([ok2xx, "const json = pm.response.json();", 'if (json.externalEmployees && json.externalEmployees[0]) pm.collectionVariables.set("externalStaffId", json.externalEmployees[0].id);'])], []));
  items.push(item("15 אישור הטיול הראשון", "PUT", "/api/trips/{{trip1Id}}/approve", rawJson({}), [test([ok2xx, "const json = pm.response.json();", 'if (json.parentToken) pm.collectionVariables.set("parentToken", json.parentToken);'])]));
  items.push(item("16 סגירת הטיול השני", "PUT", "/api/trips/{{trip2Id}}/close", rawJson({}), [test([ok2xx])]));
  items.push(formItem("17 העלאת קובץ כללי לטיול", "POST", "/api/trips/{{trip1Id}}/files", [{ key: "description", value: "רשימת ציוד כללית לטיול", type: "text" }, { key: "file", type: "file", src: [] }], [test([okUpload, 'try { const json = pm.response.json(); if (json && json.id) pm.collectionVariables.set("fileId", json.id); } catch (e) {}'])]));
  items.push(formItem("18 העלאת מסמך לתיק הטיול", "POST", "/api/trips/{{trip1Id}}/files/kit", [{ key: "description", value: "אישור מנהל מוסד ליציאה לטיול", type: "text" }, { key: "fileCode", value: "1", type: "text" }, { key: "file", type: "file", src: [] }], [test([okUpload])]));
  items.push(item("19 קבלת כל קבצי הטיול", "GET", "/api/trips/{{trip1Id}}/files", undefined, [test([ok2xx, "const json = pm.response.json(); if (Array.isArray(json) && json[0]) pm.collectionVariables.set(\"fileId\", json[0].id);"])], []));
  items.push(item("20 קבלת תיק הטיול", "GET", "/api/trips/{{trip1Id}}/files/kit", undefined, [test([ok2xx])], []));
  items.push(item("21 הורדת קובץ לפי מזהה", "GET", "/api/trips/{{trip1Id}}/files/{{fileId}}", undefined, [test(['pm.test("נקודת קובץ הופעלה", function () { pm.expect(pm.response.code).to.be.oneOf([200, 404, 500]); });'])], []));
  items.push(item("22 מחיקת קובץ לפי מזהה", "DELETE", "/api/trips/{{trip1Id}}/files/{{fileId}}", undefined, [test(['pm.test("מחיקת קובץ הופעלה", function () { pm.expect(pm.response.code).to.be.oneOf([204, 404, 500]); });'])], []));
  items.push(item("23 קבלת כל המדיה", "GET", "/api/media", undefined, [test([ok2xx])], []));
  items.push(item("24 העלאת תיעוד מדיה - נקודת בדיקה", "POST", "/api/media", rawJson({ tripId: "{{trip1Id}}", mediaType: "image", description: "תיעוד תמונה מפעילות שטח" }), [test([okStub])]));
  items.push(item("25 מחיקת מדיה - נקודת בדיקה", "DELETE", "/api/media/1", undefined, [test([okStub])], []));
  items.push(item("26 התחברות אחראי טיול לפתיחת אירועי חירום", "POST", "/api/auth/login", rawJson({ nationalId: leaderNational, institutionNumber: institution, password: `${leaderNational}abc` }), [setVar("leaderId", "json.userId")]));
  items.push(item("27 פתיחת אירוע חירום קל בטיול של היום", "POST", "/api/trips/{{trip1Id}}/emergencies/minor", rawJson({ description: "תלמידה נפצעה קל במהלך הליכה במסלול", locationLat: 31.7683, locationLng: 35.2137, status: 1 }), [test([ok2xx, "const json = pm.response.json(); if (json.emergency && json.emergency.id) pm.collectionVariables.set(\"emergencyId\", json.emergency.id);"])]));
  items.push(item("28 קבלת אירועי חירום בטיול", "GET", "/api/trips/{{trip1Id}}/emergencies", undefined, [test([ok2xx])], []));
  items.push(item("29 עדכון אירוע חירום", "PUT", "/api/trips/{{trip1Id}}/emergencies/{{emergencyId}}", rawJson({ description: "התלמידה קיבלה טיפול ראשוני וממתינה לאיסוף", locationLat: 31.769, locationLng: 35.214, status: 1 }), [test([ok2xx])]));
  items.push(item("30 סגירת אירוע חירום קל", "PUT", "/api/trips/{{trip1Id}}/emergencies/{{emergencyId}}/close/minor", rawJson({ description: "אירוע החירום נסגר לאחר טיפול ודיווח להורים", locationLat: 31.769, locationLng: 35.214, status: 2 }), [test([ok2xx])]));
  items.push(item("31 התחברות מנהל מוסד לניהול וסגירה", "POST", "/api/auth/login", rawJson({ nationalId: `${principalNational}`, institutionNumber: institution, password }), [setVar("principalId", "json.userId")]));
  items.push(item("32 מחיקת אירוע חירום כמנהל מוסד", "DELETE", "/api/trips/{{trip1Id}}/emergencies/{{emergencyId}}", undefined, [test([ok2xx])], []));
  items.push(item("33 שינוי תפקיד מורה לאחראי טיול", "PUT", "/api/users/{{teacher2Id}}/role", rawJson({ role: "trip leader" }), [test([ok2xx])]));
  items.push(item("34 עדכון פרופיל מנהל מוסד", "PUT", "/api/users/{{principalId}}", rawJson({ fullName: `${school.principal} מעודכן`, userEmail: school.updatedPrincipalEmail, userPhoneNumber: school.updatedPrincipalPhone }), [test([ok2xx])]));
  items.push(item("35 שינוי סיסמת מנהל מוסד", "POST", "/api/users/{{principalId}}/change-password", rawJson({ currentPassword: password, newPassword: `${prefix}Next123!` }), [test([ok2xx])]));
  items.push(item("36 הסרת שיבוץ איש צוות מטיול", "DELETE", "/api/trips/{{trip1Id}}/staff/{{teacher1Id}}", undefined, [test([ok2xx])], []));
  items.push(item("37 הסרת איש צוות חיצוני מטיול", "DELETE", "/api/trips/{{trip1Id}}/external-staff/{{externalStaffId}}", undefined, [test([ok2xx])], []));
  items.push(item("38 מחיקת טיול חמישי לניקוי נתונים", "DELETE", "/api/trips/{{trip5Id}}", undefined, [test([ok2xx])], []));
  items.push(item("39 רענון טוקן", "POST", "/api/auth/refresh", rawJson({}), [test([ok2xx])]));
  items.push(item("40 התנתקות", "POST", "/api/auth/logout", rawJson({}), [test([ok2xx])]));

  return {
    info: {
      _postman_id: crypto.randomUUID(),
      name: `מערכת ניהול טיולים - תרחיש מלא ${index} - ${school.name}`,
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    event: [collectionPre()],
    variable: [
      { key: "baseUrl", value: "http://localhost:3001" },
      ...["principalId", "coordinatorId", "teacher1Id", "teacher2Id", "leaderId", "class1Id", "class2Id", "class3Id", "trip1Id", "trip2Id", "trip3Id", "trip4Id", "trip5Id", "externalStaffId", "fileId", "emergencyId", "parentToken", "today", "futureDate1", "futureDate2", "futureDate3", "futureDate4"].map((key) => ({ key, value: "" })),
    ],
    item: items,
  };
}

const schools = [
  {
    name: "בית ספר אורט ירושלים",
    principal: "ישראל ישראלי",
    principalEmail: "israel.principal@example.com",
    principalPhone: "0501234567",
    updatedPrincipalEmail: "israel.updated@example.com",
    updatedPrincipalPhone: "0507654321",
    city: "ירושלים",
    street: "הרצל",
    houseNumber: 5,
    postalCode: 9100000,
    email: "ort.jerusalem@example.com",
    coordinator: "דנה כהן",
    coordinatorEmail: "dana.cohen@example.com",
    coordinatorPhone: "0501112233",
    teacher1: "יוסי לוי",
    teacher1Email: "yossi.levi@example.com",
    teacher1Phone: "0502223344",
    teacher2: "מיכל אברהם",
    teacher2Email: "michal.avraham@example.com",
    teacher2Phone: "0503334455",
    leader: "רועי בן דוד",
    leaderEmail: "roy.bd@example.com",
    leaderPhone: "0504445566",
    guard: "מאבטח דוד מזרחי",
    guardPhone: "0521111111",
    medic: "חובשת נעמה פרץ",
    medicPhone: "0522222222",
    classes: [["ז-1", 7, "class1Id"], ["ח-2", 8, "class2Id"], ["ט-3", 9, "class3Id"]],
    tripTitles: ["טיול עיר דוד", "סיור מוזיאון ישראל", "מסע הרי ירושלים", "יום שדה בעין כרם", "טיול גיבוש בנחל שורק"],
  },
  {
    name: "בית ספר גלים חיפה",
    principal: "מרים לוי",
    principalEmail: "miriam.levi@example.com",
    principalPhone: "0505551111",
    updatedPrincipalEmail: "miriam.updated@example.com",
    updatedPrincipalPhone: "0505552222",
    city: "חיפה",
    street: "הנביאים",
    houseNumber: 18,
    postalCode: 3300000,
    email: "galim.haifa@example.com",
    coordinator: "אבי שרון",
    coordinatorEmail: "avi.sharon@example.com",
    coordinatorPhone: "0506661111",
    teacher1: "נועה ברק",
    teacher1Email: "noa.barak@example.com",
    teacher1Phone: "0506662222",
    teacher2: "אלון ביטון",
    teacher2Email: "alon.biton@example.com",
    teacher2Phone: "0506663333",
    leader: "שירה אמיר",
    leaderEmail: "shira.amir@example.com",
    leaderPhone: "0506664444",
    guard: "מאבטח חיים אזולאי",
    guardPhone: "0523333333",
    medic: "חובש איתן סגל",
    medicPhone: "0524444444",
    classes: [["י-1", 10, "class1Id"], ["יא-2", 11, "class2Id"], ["יב-3", 12, "class3Id"]],
    tripTitles: ["סיור בנחל מערות", "טיול בכרמל", "יום ים בחוף דדו", "מסע לעכו העתיקה", "סיור מדעי בטכניון"],
  },
  {
    name: "בית ספר שקד באר שבע",
    principal: "אורית בן עמי",
    principalEmail: "orit.benami@example.com",
    principalPhone: "0507771111",
    updatedPrincipalEmail: "orit.updated@example.com",
    updatedPrincipalPhone: "0507772222",
    city: "באר שבע",
    street: "דרך חברון",
    houseNumber: 42,
    postalCode: 8400000,
    email: "shaked.beersheva@example.com",
    coordinator: "תמר אליהו",
    coordinatorEmail: "tamar.eliyahu@example.com",
    coordinatorPhone: "0508881111",
    teacher1: "גיל רוזן",
    teacher1Email: "gil.rozen@example.com",
    teacher1Phone: "0508882222",
    teacher2: "הילה מור",
    teacher2Email: "hila.mor@example.com",
    teacher2Phone: "0508883333",
    leader: "עידן כץ",
    leaderEmail: "idan.katz@example.com",
    leaderPhone: "0508884444",
    guard: "מאבטח שלומי אדרי",
    guardPhone: "0525555555",
    medic: "חובשת רונית כהן",
    medicPhone: "0526666666",
    classes: [["ו-1", 6, "class1Id"], ["ז-2", 7, "class2Id"], ["ח-3", 8, "class3Id"]],
    tripTitles: ["טיול במדבר יהודה", "סיור במכתש רמון", "יום שדה בפארק נחל באר שבע", "מסע למצדה", "טיול גיבוש ביער להב"],
  },
];

[
  scenario(1, schools[0], 410011, 123456789, "OR"),
  scenario(2, schools[1], 410022, 223456789, "GA"),
  scenario(3, schools[2], 410033, 323456789, "SH"),
].forEach((collection, index) => {
  fs.writeFileSync(
    path.join(outDir, `trip-management-full-flow-${index + 1}.postman_collection.json`),
    JSON.stringify(collection, null, 2),
    "utf8",
  );
});

console.log("generated Hebrew Postman collections");
