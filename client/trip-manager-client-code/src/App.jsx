import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import EmergencySocketProvider from "./components/EmergencySocketProvider.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import DashboardPage from "./pages/dashboard/DashboardPage.jsx";
import TripSelectionPage from "./pages/trips/selection/TripSelectionPage.jsx";
import TripDashboardPage from "./pages/trips/selection/TripDashboardPage.jsx";
import TripPlanningPage from "./pages/trips/planning/TripPlanningPage.jsx";
import TripDayPage from "./pages/trips/day/TripDayPage.jsx";
import EmergencyPage from "./pages/trips/emergency/EmergencyPage.jsx";
import ProfilePage from "./pages/profile/ProfilePage.jsx";
import AddEmployeePage from "./pages/employees/AddEmployeePage.jsx";
import UpdateTripPage from "./pages/trips/planning/UpdateTripPage.jsx";
import ApproveTripPage from "./pages/trips/planning/ApproveTripPage.jsx";
import ManageTripStaffPage from "./pages/trips/staff/ManageTripStaffPage.jsx";
import TripsLeaderKit from "./pages/trips/documents/TripsLeadersKit.jsx";
import Unauthorized from "./pages/errors/Unauthorized.jsx";
import NotFound from "./pages/errors/NotFound.jsx";
import CreateTripPage from "./pages/trips/planning/CreateTripPage.jsx";
import TripContactsPage from "./pages/trips/day/TripContactsPage.jsx";
import TripStatusPage from "./pages/trips/planning/TripStatusPage.jsx";
import CriticalEmergency from "./pages/trips/emergency/CriticalEmergemcy.jsx";
import UsefulLinks from "./pages/trips/planning/UsefulLinks.jsx";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <EmergencySocketProvider>
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
        <Route path="/trips" element={<TripSelectionPage />} />
        <Route path="/trips/new" element={<CreateTripPage />} />

        {/* דשבורד טיול */}
        <Route path="/trips/:tripId" element={<TripDashboardPage />} />

        {/* תכנון טיול */}
        <Route path="/trips/:tripId/planning" element={<TripPlanningPage />} />
        <Route path="/trips/:tripId/folder" element={<TripsLeaderKit />} />
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
      </EmergencySocketProvider>
    </BrowserRouter>
  );
}

export default App;
