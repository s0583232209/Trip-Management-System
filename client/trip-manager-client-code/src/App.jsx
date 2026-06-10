import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import TripSelectionPage from "./pages/trips/TripSelectionPage.jsx";
import TripDashboardPage from "./pages/trips/TripDashboardPage.jsx";
import TripPlanningPage from "./pages/trips/TripPlanningPage.jsx";
import TripDayPage from "./pages/trips/TripDayPage.jsx";
import TripSectionPage from "./pages/trips/TripSectionPage.jsx";
import EmergencyPage from "./pages/trips/EmergencyPage.jsx";
import MediaPage from "./pages/media/MediaPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import AddEmployeePage from "./pages/AddEmployeePage.jsx";
import "./App.css";
import UpdateTripPage from "./pages/trips/UpdateTripPage.jsx";
import ApproveTripPage from "./pages/trips/ApproveTripPage.jsx";
import UploadTripFile from "./pages/trips/UploadTripFile.jsx";
import ManageTripStaffPage from "./pages/trips/ManageTripStaffPage.jsx";
import TripsLeaderKit from "./pages/trips/TripsLeadersKit.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";
import NotFound from "./pages/NotFound.jsx";
import CreateTripPage from "./pages/trips/CreateTripPage.jsx";
import TripContactsPage from "./pages/trips/TripContactsPage.jsx";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Navigate to="/register/1" />} />
        <Route path="/register/:step" element={<Register />} />
        <Route path="/" element={<DashboardPage />} />
        <Route path="/trips" element={<TripSelectionPage />} />

        {/* יצירת טיול — מנהל ורכז בלבד */}
        <Route path="/trips/new" element={<CreateTripPage />} />

        <Route path="/trips/:tripId" element={<TripDashboardPage />} />
        <Route path="/trips/:tripId/planning" element={<TripPlanningPage />} />
        <Route path="/trips/:tripId/day" element={<TripDayPage />} />
        <Route path="/trips/:tripId/folder" element={<TripsLeaderKit />} />
        <Route path="/trips/:tripId/trip-leaders-kit" element={<TripsLeaderKit />} />
        <Route path="/trips/:tripId/staff" element={<ManageTripStaffPage />} />

        {/* <Route path="/trips/:tripId/trip-day" element={<TripDayPage />} /> */}

        <Route
          path="/trips/:tripId/folder"
          element={
            <>
              <TripsLeaderKit></TripsLeaderKit>
            </>
          }
        />
        <Route
          path="/trips/:tripId/staff"
          element={<ManageTripStaffPage></ManageTripStaffPage>}
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
          path="/trips/:tripId/attendance"
          element={
            <TripSectionPage
              title="יום טיול / קריאת שמות"
              description="כאן תוכל לבצע קריאת שמות ולעדכן נוכחות תלמידים."
            />
          }
        />
        <Route path="/trips/:tripId/emergencies" element={<EmergencyPage />} />
        <Route path="/trips/:tripId/contacts" element={<TripContactsPage />} />
        <Route
          path="/trips/:tripId/status"
          element={
            <TripSectionPage
              title="יום טיול / סטטוס הטיול"
              description="עדכון וצפייה בסטטוס הטיול בזמן אמת."
            />
          }
        />

        <Route path="/trips/:tripId/files" element={<UploadTripFile />} />
        <Route path="/trips/:tripId/approve" element={<ApproveTripPage />} />
        <Route
          path="/trips/:tripId/close"
          element={<TripSectionPage title="סגירת טיול" description="כאן תוכל לסגור טיול שהסתיים בהצלחה." />}
        />

        <Route path="/trips/:tripId/route" element={<UpdateTripPage />} />

        <Route
          path="/trips/:tripId/emergencies/full"
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

        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/not-found" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
