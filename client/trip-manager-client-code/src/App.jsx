import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import TripSelectionPage from "./pages/trips/TripSelectionPage.jsx";
import TripDashboardPage from "./pages/trips/TripDashboardPage.jsx";
import TripPlanningPage from "./pages/trips/TripPlanningPage.jsx";
import TripDayPage from "./pages/trips/TripDayPage.jsx";
import TripSectionPage from "./pages/trips/TripSectionPage.jsx";
import MediaPage from "./pages/media/MediaPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import AddEmployeePage from "./pages/AddEmployeePage.jsx";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Navigate to="/register/1" />} />
        <Route path="/register/:step" element={<Register />} />
        <Route path="/" element={<DashboardPage />} />
        <Route path="/trips" element={<TripSelectionPage />} />
        <Route path="/trips/:tripId" element={<TripDashboardPage />} />
        <Route path="/trips/:tripId/planning" element={<TripPlanningPage />} />
        <Route path="/trips/:tripId/day" element={<TripDayPage />} />
        <Route
          path="/trips/:tripId/folder"
          element={
            <TripSectionPage
              title="תכנון טיול / תיק טיול"
              description="כאן תוכל לנהל את תיק הטיול ולצרף מסמכים חשובים."
            />
          }
        />
        <Route
          path="/trips/:tripId/staff"
          element={
            <TripSectionPage
              title="תכנון טיול / אנשי צוות"
              description="כאן תוכל לנהל את צוות המלווה לטיול."
            />
          }
        />
        <Route
          path="/trips/:tripId/equipment"
          element={
            <TripSectionPage
              title="תכנון טיול / ציוד"
              description="כאן תוכל לתכנן ולעקוב אחרי ציוד לטיול."
            />
          }
        />
        <Route
          path="/trips/:tripId/documents"
          element={
            <TripSectionPage
              title="תכנון טיול / מסמכים"
              description="כאן תוכל להעלות ולצפות במסמכים של הטיול."
            />
          }
        />
        <Route
          path="/trips/:tripId/attendance"
          element={
            <TripSectionPage
              title="יום טיול / קריאת שמות"
              description="כאן תוכל לבצע קריאת שמות ולעדכן נוכחות תלמידים."
            />
          }
        />
        <Route
          path="/trips/:tripId/emergency"
          element={
            <TripSectionPage
              title="יום טיול / מצב חירום"
              description="דווח על מצב חירום וקבל הנחיות לפעולה מהירה."
            />
          }
        />
        <Route
          path="/trips/:tripId/contacts"
          element={
            <TripSectionPage
              title="יום טיול / פרטי קשר צוות"
              description="צפה בפרטי הקשר של צוות המלווה במהלך הטיול."
            />
          }
        />
        <Route
          path="/trips/:tripId/status"
          element={
            <TripSectionPage
              title="יום טיול / סטטוס הטיול"
              description="עדכון וצפייה בסטטוס הטיול בזמן אמת."
            />
          }
        />
        <Route
          path="/trips/:tripId/files"
          element={
            <TripSectionPage
              title="העלאת קבצים"
              description="עמוד להעלאת קבצים ותמיכה במסמכים בטיול."
            />
          }
        />
        <Route
          path="/trips/:tripId/approve"
          element={
            <TripSectionPage
              title="אישור טיול סופי"
              description="כאן תוכל לאשר את הטיול לפני היציאה."
            />
          }
        />
        <Route
          path="/trips/:tripId/close"
          element={
            <TripSectionPage
              title="סגירת טיול"
              description="כאן תוכל לסגור טיול שהסתיים בהצלחה."
            />
          }
        />
        <Route
          path="/trips/:tripId/route"
          element={
            <TripSectionPage
              title="עדכון מסלול"
              description="כאן תוכל לעדכן ולקבע את המסלול בזמן אמת."
            />
          }
        />
        <Route
          path="/trips/:tripId/emergency/full"
          element={
            <TripSectionPage
              title="חרום מלא"
              description="דיווח על אירוע חירום מלא ופעולות מטה"
            />
          }
        />
        <Route path="/media" element={<MediaPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/add-employee" element={<AddEmployeePage />} />
        <Route path="/admin" element={<AddEmployeePage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
