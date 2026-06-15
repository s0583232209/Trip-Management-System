# 🧭 מסלול בטוח — Trip Management System

(פירוט בעברית - למטה)


A full-stack web platform that helps schools plan, run, and supervise field trips — from initial scheduling and document collection to live, real-time emergency response on the day of the trip.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2-764ABC?logo=redux&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express%205-339933?logo=node.js&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-realtime-010101?logo=socket.io&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-black?logo=jsonwebtokens)

---

## 📖 Overview

**מסלול בטוח** ("Safe Route") is a Hebrew (RTL) web application built for schools to manage every stage of a class trip's lifecycle:

- 📝 Plan a trip, assign a trip leader, staff, and external personnel (guides, medics, security)
- 📂 Collect and track the required "trip kit" documents (parental consent forms, medical lists, insurance forms, etc.)
- ✅ Move a trip through its lifecycle — *scheduled → approved → closed → post-edit*
- 🚨 Respond to **real-time emergencies** during the trip, with instant alerts pushed to everyone connected to that trip
- 👥 Manage users, roles, schools, and classes with fine-grained, role-based permissions

The system is built as a modern **client/server SPA**: a React 19 + Redux frontend talking to a layered Express 5 REST API, with a MySQL database and Socket.io for live updates.

---

## ✨ Key Features

### 🔐 Role-Based Access Control
Every user can hold one or more of the following roles, each with its own permissions enforced on both client and server:

| Role (English) | Role (Hebrew) | Highlights |
|---|---|---|
| Principal | מנהל | Full control — manage users, roles, approve/close trips, post-edit access |
| Coordinator | רכז | Create & manage trips, staff, documents, classes |
| Trip Leader | אחראי טיול | Manage the trip on the day it runs, open critical emergencies |
| Teacher | מורה | View trip details, raise minor emergencies for their class |

### 🗺️ Trip Lifecycle Management
Trips move through a clear status workflow (`scheduled → approved → closed → post-edit`), with each transition gated by role and, where relevant, by whether the trip is actually happening *today*.

### 🚨 Real-Time Emergency Response
Built on **Socket.io** rooms (`trip-<id>`):
- Teachers and trip leaders can raise **minor** or **critical** emergencies
- All connected clients on that trip instantly receive `emergency-alert` events — including an audible alarm in the UI
- Emergencies can be closed individually, broadcasting `emergency-closed` to everyone watching

### 📁 Trip Document "Kit"
Every trip has a checklist of required documents (e.g. *אישור יציאה לטיול ממנהל מוסד*, *רשימת תלמידים עם מגבלות רפואיות*, *טופס ביטוח למתנדב*). Files are uploaded securely via Multer with:
- Filename sanitization
- MIME + extension allow-list (PDF / PNG / JPG)
- 5MB size limit
- Friendly Hebrew validation messages

### 👥 Staff & External Personnel
Assign internal staff (teachers, trip leaders) and external personnel (guards, medics, paramedics, guides, first-aid providers) to each trip, with full add/remove support.

### 🏫 Schools & Classes
Multi-school support out of the box — users, classes, and trips are all scoped to a school.

### 🔑 Secure Authentication
- JWT access + refresh tokens via secure HTTP-only cookies
- Bcrypt password hashing
- Centralized `roleGuard` middleware for endpoint protection
- Trip-day and trip-staff guards for context-sensitive actions

### 🌐 Hebrew RTL Interface
The entire UI is built right-to-left in Hebrew, designed for everyday use by school staff.

---

## 🏗️ Architecture

```
┌──────────────────────────┐        REST + WebSocket        ┌────────────────────────────────┐
│   React 19 / Vite Client │ ◄─────────────────────────────►│      Express 5 API Server      │
│  Redux Toolkit + Router  │        (axios, socket.io)      │  Routes → Controllers →        │
│  RTL Hebrew UI           │                                │  Services → Repositories       │
└──────────────────────────┘                                └──────────────────┬─────────────┘
                                                                               │ mysql2/promise
                                                                               ▼
                                                                     ┌──────────────────┐
                                                                     │   MySQL Database │
                                                                     └──────────────────┘
```

The server follows a strict **layered architecture**:

- **Routes** — define endpoints and attach role/permission guards
- **Controllers** — handle HTTP req/res, delegate to services
- **Services** — business logic
- **Repositories** — data access layer (raw SQL via `mysql2/promise`)

Express and Socket.io share a single `http` server, so REST calls and real-time events run side-by-side on the same port.

---

## 🛠️ Tech Stack

### Frontend (`client/trip-manager-client-code`)
- **React 19** + **Vite 8**
- **Redux Toolkit** + **react-redux** — global auth/session state
- **React Router v7** — routing
- **React Hook Form** — form handling & validation
- **Axios** — HTTP client
- **Socket.io-client** — real-time emergency alerts
- **ESLint** for linting

### Backend (`server`)
- **Express 5** — REST API
- **Socket.io** — real-time communication
- **MySQL2** (promise API) — database access
- **JWT** (jsonwebtoken) + **cookie-parser** — authentication
- **bcrypt** — password hashing
- **Multer** — file uploads
- **Winston** + **winston-daily-rotate-file** — logging
- **dotenv** — environment configuration
- **CORS** — locked down to the client origin with credentials

---

## 📂 Project Structure

```
Trip-Management-System/
├── client/
│   └── trip-manager-client-code/
│       └── src/
│           ├── assets/
│           ├── components/
│           ├── hooks/
│           ├── pages/
│           │   ├── trips/
│           │   └── media/
│           ├── services/        # API service layer (axios calls)
│           └── store/            # Redux Toolkit store & slices
├── server/
│   ├── src/
│   │   ├── config/               # DB connection, Socket.io setup
│   │   ├── controllers/          # Request handlers
│   │   ├── services/             # Business logic
│   │   ├── repositories/         # SQL queries
│   │   ├── routes/                # Express routers
│   │   ├── middlewares/          # Auth, role guards, upload, logging
│   │   ├── loggers/               # Winston loggers
│   │   └── utils/
│   ├── uploads/trips/             # Uploaded trip documents
│   ├── logs/                      # Rotating log files
│   └── server.js                  # App entry point
├── database/
│   ├── schema.sql                 # Full DB schema + seed data
│   ├── seed.sql
│   └── migrate_statuses.sql
└── postman/                        # Postman collections for API testing
```

---

## 🚀 Getting Started

This section walks through getting the full stack — MySQL database, Express/Socket.io API server, and React client — running locally from a clean checkout.

### Prerequisites

Install these first:

| Tool | Recommended version | Check with |
|---|---|---|
| [Node.js](https://nodejs.org/) | v20 LTS or newer (includes npm) | `node -v` / `npm -v` |
| [MySQL Server](https://dev.mysql.com/downloads/mysql/) | 8.0+ | `mysql --version` |
| [Git](https://git-scm.com/) | any recent version | `git --version` |

### 1. Clone the repository
```bash
git clone <repository-url>
cd Trip-Management-System
```

The project has two independently-installed apps plus the SQL files:
```
Trip-Management-System/
├── server/                          # Express API + Socket.io (port 3000)
├── client/trip-manager-client-code/ # React + Vite frontend (port 5173)
└── database/                        # schema.sql + seed.sql
```

### 2. Set up the MySQL database

1. Make sure your local MySQL server is running.
2. Run the schema script to create the `trip_manager` database and all tables:
   ```bash
   mysql -u root -p --force < database/schema.sql
   ```
   > ⚠️ The first line of `schema.sql` is `DROP DATABASE trip_manager;`. On a fresh MySQL instance this single statement will fail because the database doesn't exist yet — the `--force` flag tells the `mysql` client to ignore that error and keep going (everything else in the script still runs). If you're re-running this on an existing install, the drop will succeed and reset the schema completely.
3. Load the reference/lookup data (roles, trip statuses, file codes, emergency types, external roles, etc.):
   ```bash
   mysql -u root -p trip_manager < database/seed.sql
   ```

At this point `trip_manager` exists with all tables and lookup data, but **no schools, users, or trips** — those are created from the app itself in step 5.

### 3. Configure and run the server

Create a file named `.env` inside `server/`:
```env
HOST=localhost
PORT=3000
USER=<your-mysql-user>
PASSWORD=<your-mysql-password>
DATABASE=trip_manager
JWT_SECRET=<any-long-random-string>
JWT_REFRESH_SECRET=<another-long-random-string>
UPLOAD_FOLDER=uploads
TZ=Asia/Jerusalem
```

| Variable | Description |
|---|---|
| `HOST` | MySQL host (usually `localhost`) |
| `PORT` | Port the API/Socket.io server listens on. **Must be `3000`** — the client is hardcoded to call `http://localhost:3000` |
| `USER` / `PASSWORD` | Your MySQL credentials |
| `DATABASE` | Must match the database created in step 2 (`trip_manager`) |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Random secret strings used to sign access/refresh tokens, e.g. generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `UPLOAD_FOLDER` | Folder (relative to `server/`) where uploaded trip documents are stored |
| `TZ` | Timezone used for "is this trip happening today" logic — keep as `Asia/Jerusalem` |

Install dependencies and start the server:
```bash
cd server
npm install
npm start
```
You should see output similar to:
```
Connected to MySQL at localhost
Server started on http://localhost:3000
```
This single server serves both the REST API and the Socket.io server.

### 4. Configure and run the client

In a **second terminal**, from the project root:
```bash
cd client/trip-manager-client-code
npm install
npm run dev
```
Vite starts the dev server at `http://localhost:5173` — open that URL in your browser.

> The client calls the API at `http://localhost:3000` (hardcoded in `src/api.js` and `src/socket.js`), and the server's CORS is locked to `http://localhost:5173` (in `server.js`). Keep both ports as shown unless you update those files too.

### 5. Create your first account

The database starts empty — there are no users yet:

1. Open `http://localhost:5173` and click through to **Register** (`/register/1`).
2. **Step 1** — enter your school's details (this creates a new school record).
3. **Step 2** — enter your personal details and submit. The first user registered for a school is automatically given the **principal** (מנהל) role.
4. You'll be logged in automatically and redirected to the dashboard.

From the principal account you can then:
- Add staff via **ניהול משתמשים** (`/add-employee`) and assign them roles (coordinator / trip leader / teacher)
- Create trips, assign staff and external personnel, manage classes, and upload trip-kit documents
- Approve, run, and close trips, and respond to live emergencies

### 6. Summary — everything running together

| Component | URL | Start command |
|---|---|---|
| MySQL database | `localhost:3306` (default) | started via your OS / MySQL service |
| API + Socket.io server | `http://localhost:3000` | `cd server && npm start` |
| React client | `http://localhost:5173` | `cd client/trip-manager-client-code && npm run dev` |

### Troubleshooting

- **"Database connection failed" / `ECONNREFUSED`** — MySQL isn't running, or `HOST`/`USER`/`PASSWORD`/`DATABASE` in `server/.env` are wrong.
- **CORS errors in the browser console** — the server only allows requests from `http://localhost:5173`; make sure the client runs on exactly that origin.
- **Client requests fail / connection refused to `localhost:3000`** — set `PORT=3000` in `server/.env` and make sure the server is running.
- **File uploads fail** — ensure the folder set in `UPLOAD_FOLDER` (default `server/uploads`) exists and is writable.
- **"Trip day" features (emergencies, route updates) behave unexpectedly** — make sure `TZ=Asia/Jerusalem` is set in `server/.env`.

---

## 🔌 API Overview

All endpoints are prefixed with `/api` and protected by JWT authentication (except `/api/auth/*`).

| Resource | Base Path | Description |
|---|---|---|
| Auth | `/api/auth` | Register, login, logout, refresh tokens |
| Users | `/api/users` | Manage users, roles, profiles, passwords |
| Classes | `/api/classes` | Manage school classes |
| Trips | `/api/trips` | Create, view, approve, close, and update trips; manage trip staff |
| Trip Files | `/api/trips/:id/files` | Upload, list, download, and delete trip documents & kit files |
| Emergencies | `/api/trips/:id/emergencies` | Raise, update, and close minor/critical emergencies |

A full set of importable **Postman collections** is available in [`postman/`](postman/), including a generated end-to-end Hebrew flow.

### Real-Time Events (Socket.io)
| Event | Direction | Description |
|---|---|---|
| `join-trip` / `leave-trip` | Client → Server | Join/leave the room for a specific trip |
| `emergency-alert` | Server → Clients | Broadcast when a new emergency is opened on a trip |
| `emergency-closed` | Server → Clients | Broadcast when an emergency is resolved |

---

## 🗄️ Database Schema Highlights

- **schools, users, user_roles, user_passwords** — multi-school user management with role assignments
- **classes, trip_classes** — class-to-trip coverage tracking
- **trips, statuses** — trip lifecycle (scheduled / approved / closed / post-edit)
- **trip_kit, trip_files, file_codes** — required document tracking per trip
- **staff_trip, external_employees, external_staff_trip, external_role** — internal & external personnel assignments
- **emergencies, emergency_types, emergency_status** — emergency tracking and severity levels
- **audit_log** — tracks sensitive actions across the system
- **tokens** — refresh token storage for JWT auth

---

## 🧪 Testing

API testing is supported via the Postman collections in [`postman/`](postman/), covering authentication, trip management, file uploads, and emergency flows end-to-end.

---


---

# 🧭 מסלול בטוח — מערכת לניהול טיולים <div dir="rtl">

<div dir="rtl">

פלטפורמת web מקצה לקצה שעוזרת לבתי ספר לתכנן, לנהל ולפקח על טיולים — מהשלב הראשוני של תכנון וריכוז מסמכים, ועד לטיפול בזמן אמת באירועי חירום ביום הטיול עצמו.

## 📖 סקירה כללית

**מסלול בטוח** היא אפליקציית web בעברית (RTL), שנבנתה עבור בתי ספר לניהול כל שלב במחזור החיים של טיול בית ספרי:

- 📝 תכנון טיול, הקצאת אחראי טיול, צוות ואנשי צוות חיצוניים (מדריכים, חובשים, מאבטחים)
- 📂 ריכוז ומעקב אחר מסמכי "תיק הטיול" הנדרשים (אישורי הורים, רשימות תלמידים עם מגבלות רפואיות, טפסי ביטוח ועוד)
- ✅ קידום הטיול במחזור החיים שלו — *מתוכנן ← מאושר ← סגור ← פתוח לעריכה בדיעבד*
- 🚨 טיפול **באירועי חירום בזמן אמת** במהלך הטיול, עם התראות מיידיות לכל המשתמשים המחוברים לאותו טיול
- 👥 ניהול משתמשים, תפקידים, בתי ספר וכיתות, עם הרשאות מדויקות לפי תפקיד

המערכת בנויה כ-**SPA בארכיטקטורת client/server** מודרנית: צד לקוח ב-React 19 + Redux המתקשר עם שרת REST מבוסס Express 5 בארכיטקטורה שכבתית, מסד נתונים MySQL, ו-Socket.io לעדכונים בזמן אמת.

## ✨ תכונות עיקריות

### 🔐 ניהול הרשאות לפי תפקיד
כל משתמש יכול להחזיק אחד או יותר מהתפקידים הבאים, וכל תפקיד נהנה מהרשאות מוגדרות הנאכפות גם בצד הלקוח וגם בצד השרת:

| תפקיד | תיאור |
|---|---|
| מנהל (Principal) | שליטה מלאה — ניהול משתמשים ותפקידים, אישור וסגירת טיולים, גישה לעריכה בדיעבד |
| רכז טיולים (Coordinator) | יצירה וניהול טיולים, צוות, מסמכים וכיתות |
| אחראי טיול (Trip Leader) | ניהול הטיול ביום שבו הוא מתקיים, פתיחת חירום קריטי |
| מורה (Teacher) | צפייה בפרטי הטיול, פתיחת חירום מינורי עבור הכיתה שלו |

### 🗺️ ניהול מחזור חיי הטיול
טיול עובר במחזור חיים מוגדר (`מתוכנן ← מאושר ← סגור ← פתוח לעריכה בדיעבד`), כשכל מעבר מוגבל לפי תפקיד, ובמקרים הרלוונטיים — גם לפי השאלה האם הטיול מתקיים *היום בפועל*.

### 🚨 טיפול בחירום בזמן אמת
מבוסס על חדרי **Socket.io** (`trip-<id>`):
- מורים ואחראי טיול יכולים לפתוח אירוע חירום **מינורי** או **קריטי**
- כל הלקוחות המחוברים לאותו טיול מקבלים באופן מיידי אירוע `emergency-alert` — כולל אזעקה קולית בממשק
- ניתן לסגור אירועי חירום באופן פרטני, מה שמשדר `emergency-closed` לכל מי שמחובר

### 📁 "תיק הטיול"
לכל טיול יש רשימת מסמכים נדרשים (כגון *אישור יציאה לטיול ממנהל מוסד*, *רשימת תלמידים עם מגבלות רפואיות*, *טופס ביטוח למתנדב*). העלאת קבצים מתבצעת באופן מאובטח באמצעות Multer, עם:
- ניקוי (sanitization) של שמות קבצים
- רשימת היתר לסוגי קבצים (PDF / PNG / JPG) לפי MIME וסיומת
- הגבלת גודל של 5MB
- הודעות שגיאה ברורות בעברית

### 👥 ניהול צוות ואנשי צוות חיצוניים
שיבוץ אנשי צוות פנימיים (מורים, אחראי טיול) ואנשי צוות חיצוניים (מאבטחים, חובשים, פראמדיקים, מדריכים, אנשי עזרה ראשונה) לכל טיול, עם אפשרות הוספה והסרה מלאה.

### 🏫 בתי ספר וכיתות
תמיכה במספר בתי ספר מהקופסה — משתמשים, כיתות וטיולים משויכים כולם לבית ספר מסוים.

### 🔑 אימות מאובטח 
- JWT עם access ו-refresh tokens באמצעות עוגיות HTTP-only מאובטחות
- הצפנת סיסמאות עם bcrypt
- מידלוור `roleGuard` מרוכז להגנה על נקודות קצה
- שומרים (guards) לפי יום הטיול וצוות הטיול לפעולות תלויות-הקשר

### 🌐 ממשק בעברית מימין לשמאל
כל הממשק בנוי מימין לשמאל (RTL) בעברית, ומיועד לשימוש יומיומי על ידי צוות בית הספר.

## 🏗️ ארכיטקטורה

השרת בנוי בארכיטקטורה שכבתית קפדנית:

- **Routes** — הגדרת נקודות הקצה והצמדת שומרי הרשאות/תפקיד
- **Controllers** — טיפול ב-request/response והעברה לשכבת השירותים
- **Services** — לוגיקה עסקית
- **Repositories** — שכבת גישה לנתונים (SQL גולמי באמצעות `mysql2/promise`)

Express ו-Socket.io חולקים שרת `http` יחיד, כך שקריאות REST ואירועים בזמן אמת רצים זה לצד זה על אותו פורט.

## 🛠️ מחסנית טכנולוגית

### צד לקוח (`client/trip-manager-client-code`)
- **React 19** + **Vite 8**
- **Redux Toolkit** + **react-redux** — ניהול מצב אימות/סשן גלובלי
- **React Router v7** — ניתוב
- **React Hook Form** — טיפול ואימות טפסים
- **Axios** — קליינט HTTP
- **Socket.io-client** — התראות חירום בזמן אמת
- **ESLint** ללינטינג

### צד שרת (`server`)
- **Express 5** — REST API
- **Socket.io** — תקשורת בזמן אמת
- **MySQL2** (promise API) — גישה למסד הנתונים
- **JWT** (jsonwebtoken) + **cookie-parser** — אימות
- **bcrypt** — הצפנת סיסמאות
- **Multer** — העלאת קבצים
- **Winston** + **winston-daily-rotate-file** — לוגים
- **dotenv** — ניהול קונפיגורציה
- **CORS** — מוגבל לכתובת הקליינט בלבד, עם credentials

## 🚀 התחלה מהירה — הרצה מקצה לקצה

חלק זה מסביר כיצד להריץ את כל המערכת — מסד הנתונים MySQL, שרת ה-API (Express + Socket.io) והקליינט (React) — באופן מקומי, מהתקנה נקייה.

### דרישות מקדימות

יש להתקין מראש:

| כלי | גרסה מומלצת | בדיקה |
|---|---|---|
| [Node.js](https://nodejs.org/) | LTS גרסה 20 ואילך (כולל npm) | `node -v` / `npm -v` |
| [MySQL Server](https://dev.mysql.com/downloads/mysql/) | 8.0 ואילך | `mysql --version` |
| [Git](https://git-scm.com/) | כל גרסה עדכנית | `git --version` |

### 1. הורדת הפרויקט
```bash
git clone <repository-url>
cd Trip-Management-System
```

לפרויקט שני חלקים שמותקנים בנפרד, בנוסף לקבצי ה-SQL:
```
Trip-Management-System/
├── server/                          # Express API + Socket.io (פורט 3000)
├── client/trip-manager-client-code/ # React + Vite (פורט 5173)
└── database/                        # schema.sql + seed.sql
```

### 2. הקמת מסד הנתונים MySQL

1. ודאו ששרת ה-MySQL המקומי פועל.
2. הרצת קובץ הסכמה ליצירת מסד הנתונים `trip_manager` וכל הטבלאות:
   ```bash
   mysql -u root -p --force < database/schema.sql
   ```
   > ⚠️ השורה הראשונה ב-`schema.sql` היא `DROP DATABASE trip_manager;`. בהתקנת MySQL חדשה, פקודה זו תיכשל כי מסד הנתונים עדיין לא קיים — הדגל `--force` גורם ל-`mysql` להתעלם מהשגיאה הזו ולהמשיך להריץ את שאר הסקריפט. אם מריצים את הסקריפט על התקנה קיימת, ה-`DROP DATABASE` יצליח וימחק את כל הנתונים הקיימים.
3. טעינת נתוני הבסיס (תפקידים, סטטוסי טיול, קודי קבצים, סוגי חירום, תפקידים חיצוניים וכו'):
   ```bash
   mysql -u root -p trip_manager < database/seed.sql
   ```

בשלב הזה מסד הנתונים `trip_manager` קיים עם כל הטבלאות ונתוני הבסיס, אך **ללא בתי ספר, משתמשים או טיולים** — אלו נוצרים מתוך האפליקציה עצמה (שלב 5).

### 3. הגדרת והרצת השרת

יצירת קובץ `.env` בתיקיית `server/`:
```env
HOST=localhost
PORT=3000
USER=<מ-MySQL שלך username>
PASSWORD=<מ-MySQL שלך password>
DATABASE=trip_manager
JWT_SECRET=<מחרוזת אקראית ארוכה>
JWT_REFRESH_SECRET=<מחרוזת אקראית ארוכה נוספת>
UPLOAD_FOLDER=uploads
TZ=Asia/Jerusalem
```

| משתנה | תיאור |
|---|---|
| `HOST` | כתובת שרת ה-MySQL (בדרך כלל `localhost`) |
| `PORT` | הפורט שעליו מאזין שרת ה-API/Socket.io. **חייב להיות `3000`** — הקליינט מוגדר באופן קשיח לפנות ל-`http://localhost:3000` |
| `USER` / `PASSWORD` | פרטי ההתחברות שלך ל-MySQL |
| `DATABASE` | חייב להתאים למסד הנתונים שנוצר בשלב 2 (`trip_manager`) |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | מחרוזות סוד אקראיות לחתימת ה-access/refresh tokens, למשל ליצור עם `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `UPLOAD_FOLDER` | תיקייה (יחסית ל-`server/`) לשמירת קבצי תיק הטיול שמועלים |
| `TZ` | אזור הזמן המשמש לבדיקות "האם הטיול מתקיים היום" — להשאיר `Asia/Jerusalem` |

התקנת תלויות והרצת השרת:
```bash
cd server
npm install
npm start
```
פלט צפוי:
```
Connected to MySQL at localhost
Server started on http://localhost:3000
```
שרת אחד זה מגיש גם את ה-REST API וגם את שרת ה-Socket.io.

### 4. הגדרת והרצת הקליינט

ב**טרמינל שני**, מתיקיית השורש של הפרויקט:
```bash
cd client/trip-manager-client-code
npm install
npm run dev
```
Vite יעלה שרת פיתוח בכתובת `http://localhost:5173` — פתחו את הכתובת הזו בדפדפן.

> הקליינט פונה ל-API בכתובת `http://localhost:3000` (מוגדר באופן קשיח ב-`src/api.js` וב-`src/socket.js`), והשרת מוגדר לקבל CORS רק מ-`http://localhost:5173` (בקובץ `server.js`). יש לשמור על הפורטים הללו, אלא אם משנים גם את הקבצים האלו.

### 5. יצירת המשתמש הראשון

מסד הנתונים מתחיל ריק — אין משתמשים:

1. פתחו `http://localhost:5173` ועברו ל**הרשמה** (`/register/1`).
2. **שלב 1** — הזנת פרטי בית הספר (יוצר רשומת בית ספר חדשה).
3. **שלב 2** — הזנת הפרטים האישיים ושליחה. המשתמש הראשון שנרשם לבית ספר מקבל אוטומטית את תפקיד **מנהל** (principal).
4. לאחר ההרשמה תתבצע התחברות אוטומטית והפניה למסך הראשי.

מהמשתמש המנהל אפשר:
- להוסיף אנשי צוות דרך **ניהול משתמשים** (`/add-employee`) ולהקצות להם תפקידים (רכז / אחראי טיול / מורה)
- ליצור טיולים, לשבץ צוות ואנשי צוות חיצוניים, לנהל כיתות ולהעלות מסמכי תיק טיול
- לאשר, להריץ ולסגור טיולים, ולהגיב לאירועי חירום בזמן אמת

### 6. סיכום — הכל רץ במקביל

| רכיב | כתובת | פקודת הרצה |
|---|---|---|
| מסד נתונים MySQL | `localhost:3306` (כברירת מחדל) | מופעל כשירות מערכת / MySQL |
| שרת API + Socket.io | `http://localhost:3000` | `cd server && npm start` |
| קליינט React | `http://localhost:5173` | `cd client/trip-manager-client-code && npm run dev` |

### פתרון תקלות נפוצות

- **"Database connection failed" / `ECONNREFUSED`** — MySQL לא פועל, או שהערכים `HOST`/`USER`/`PASSWORD`/`DATABASE` בקובץ `server/.env` שגויים.
- **שגיאות CORS בקונסול הדפדפן** — השרת מאפשר בקשות רק מ-`http://localhost:5173`; ודאו שהקליינט רץ בדיוק על כתובת זו.
- **בקשות מהקליינט נכשלות / חיבור נדחה ל-`localhost:3000`** — קבעו `PORT=3000` בקובץ `server/.env` וודאו שהשרת רץ.
- **העלאת קבצים נכשלת** — ודאו שהתיקייה שמוגדרת ב-`UPLOAD_FOLDER` (כברירת מחדל `server/uploads`) קיימת וניתנת לכתיבה.
- **תכונות "יום הטיול" (חירום, עדכון מסלול) מתנהגות לא כצפוי** — ודאו ש-`TZ=Asia/Jerusalem` מוגדר בקובץ `server/.env`.

## 🔌 סקירת ה-API

כל נקודות הקצה מתחילות ב-`/api` ומוגנות באמצעות JWT (מלבד `/api/auth/*`).

| משאב | נתיב בסיס | תיאור |
|---|---|---|
| אימות | `/api/auth` | הרשמה, התחברות, התנתקות, רענון טוקנים |
| משתמשים | `/api/users` | ניהול משתמשים, תפקידים, פרופילים וסיסמאות |
| כיתות | `/api/classes` | ניהול כיתות בית הספר |
| טיולים | `/api/trips` | יצירה, צפייה, אישור, סגירה ועדכון טיולים; ניהול צוות הטיול |
| קבצי טיול | `/api/trips/:id/files` | העלאה, הצגה, הורדה ומחיקה של מסמכי הטיול ותיק הטיול |
| חירום | `/api/trips/:id/emergencies` | פתיחה, עדכון וסגירה של אירועי חירום מינוריים/קריטיים |

קולקציות **Postman** מלאות וזמינות לייבוא נמצאות בתיקיית [`postman/`](postman/), כולל תרחיש מקצה לקצה בעברית.

### אירועים בזמן אמת (Socket.io)
| אירוע | כיוון | תיאור |
|---|---|---|
| `join-trip` / `leave-trip` | לקוח ← שרת | הצטרפות/עזיבה של חדר עבור טיול ספציפי |
| `emergency-alert` | שרת ← לקוחות | שידור עת נפתח אירוע חירום חדש בטיול |
| `emergency-closed` | שרת ← לקוחות | שידור עת אירוע חירום נסגר |

## 🗄️ עיקרי מסד הנתונים

- **schools, users, user_roles, user_passwords** — ניהול משתמשים מרובי בתי ספר עם שיוך תפקידים
- **classes, trip_classes** — מעקב אחר כיסוי כיתות בטיול
- **trips, statuses** — מחזור חיי הטיול (מתוכנן / מאושר / סגור / עריכה בדיעבד)
- **trip_kit, trip_files, file_codes** — מעקב אחר מסמכים נדרשים לכל טיול
- **staff_trip, external_employees, external_staff_trip, external_role** — שיבוץ אנשי צוות פנימיים וחיצוניים
- **emergencies, emergency_types, emergency_status** — מעקב אחר אירועי חירום ורמות חומרה
- **audit_log** — מעקב אחר פעולות רגישות במערכת
- **tokens** — שמירת refresh tokens עבור אימות JWT

## 🧪 בדיקות

בדיקת ה-API נתמכת באמצעות קולקציות Postman בתיקיית [`postman/`](postman/), המכסות אימות, ניהול טיולים, העלאת קבצים ותהליכי חירום מקצה לקצה.

</div>
