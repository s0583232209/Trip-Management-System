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
import ProfilePage from "./pages/ProfilePage.jsx";
import AddEmployeePage from "./pages/AddEmployeePage.jsx";
import UpdateTripPage from "./pages/trips/UpdateTripPage.jsx";
import ApproveTripPage from "./pages/trips/ApproveTripPage.jsx";
import ManageTripStaffPage from "./pages/trips/ManageTripStaffPage.jsx";
import TripLeaderKit from "./pages/trips/TripLeadersKit.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";
import NotFound from "./pages/NotFound.jsx";
import CreateTripPage from "./pages/trips/CreateTripPage.jsx";
import TripContactsPage from "./pages/trips/TripContactsPage.jsx";
import TripStatusPage from "./pages/trips/TripStatusPage.jsx";
import CriticalEmergency from "./pages/CriticalEmergemcy.jsx";
import UsefulLinks from "./pages/trips/UsefulLinks.jsx";
import ExampleForTripLeadersKit from "./pages/trips/ExampleForTripLeadersKit.jsx";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* אימות */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Navigate to="/register/1" />} />
        <Route path="/register/:step" element={<Register />} />

        {/* דשבורד */}
        <Route path="/" element={<DashboardPage />} />

        {/* פרופיל */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* ניהול משתמשים — מנהל בלבד */}
        <Route path="/add-employee" element={<AddEmployeePage />} />

        {/* רשימת טיולים */}
        <Route path="/trips/useful-links" element={<UsefulLinks />} />
        <Route path="/trips/example-kit" element={<ExampleForTripLeadersKit />} />
        <Route path="/trips" element={<TripSelectionPage />} />
        <Route path="/trips/new" element={<CreateTripPage />} />

        {/* דשבורד טיול */}
        <Route path="/trips/:tripId" element={<TripDashboardPage />} />

        {/* תכנון טיול */}
        <Route path="/trips/:tripId/planning" element={<TripPlanningPage />} />
        <Route path="/trips/:tripId/folder" element={<TripLeaderKit />} />
        <Route path="/trips/:tripId/staff" element={<ManageTripStaffPage />} />
        <Route path="/trips/:tripId/route" element={<UpdateTripPage />} />
        <Route path="/trips/:tripId/approve" element={<ApproveTripPage />} />
        <Route path="/trips/:tripId/status" element={<TripStatusPage />} />
       

        {/* יום טיול */}
        <Route path="/trips/:tripId/day" element={<TripDayPage />} />
        <Route path="/trips/:tripId/emergencies" element={<EmergencyPage />} />
        <Route path="/trips/:tripId/emergencies/critical" element={<CriticalEmergency />} />
        <Route path="/trips/:tripId/contacts" element={<TripContactsPage />} />
       

        {/* שגיאות */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/not-found" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
