import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoadingProvider, useLoading } from "./LoadingContext.jsx";
import { setupLoadingInterceptors } from "./api.js";
import Spinner from "./components/Spinner.jsx";
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
import TripLeaderKit from "./pages/trips/documents/TripLeadersKit.jsx";
import Unauthorized from "./pages/errors/Unauthorized.jsx";
import NotFound from "./pages/errors/NotFound.jsx";
import CreateTripPage from "./pages/trips/planning/CreateTripPage.jsx";
import TripContactsPage from "./pages/trips/day/TripContactsPage.jsx";
import TripStatusPage from "./pages/trips/planning/TripStatusPage.jsx";
import CriticalEmergency from "./pages/trips/emergency/CriticalEmergemcy.jsx";
import UsefulLinks from "./pages/trips/planning/UsefulLinks.jsx";
import ExampleForTripLeadersKit from "./pages/trips/documents/ExampleForTripLeadersKit.jsx";
import "./App.css";

function AppInner() {
  const { loading, show, hide } = useLoading();
  useEffect(() => {
    setupLoadingInterceptors({ show, hide });
  }, []);
  return (
    <>
      {loading && <Spinner />}
      <BrowserRouter>
        <EmergencySocketProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Navigate to="/register/1" />} />
            <Route path="/register/:step" element={<Register />} />

            <Route path="/" element={<DashboardPage />} />

            <Route path="/profile" element={<ProfilePage />} />

            <Route path="/add-employee" element={<AddEmployeePage />} />

            <Route path="/trips/useful-links" element={<UsefulLinks />} />
            <Route
              path="/trips/example-kit"
              element={<ExampleForTripLeadersKit />}
            />
            <Route path="/trips" element={<TripSelectionPage />} />
            <Route path="/trips/new" element={<CreateTripPage />} />

            <Route path="/trips/:tripId" element={<TripDashboardPage />} />

            <Route
              path="/trips/:tripId/planning"
              element={<TripPlanningPage />}
            />
            <Route path="/trips/:tripId/folder" element={<TripLeaderKit />} />
            <Route
              path="/trips/:tripId/staff"
              element={<ManageTripStaffPage />}
            />
            <Route path="/trips/:tripId/route" element={<UpdateTripPage />} />
            <Route
              path="/trips/:tripId/approve"
              element={<ApproveTripPage />}
            />
            <Route path="/trips/:tripId/status" element={<TripStatusPage />} />

            <Route path="/trips/:tripId/day" element={<TripDayPage />} />
            <Route
              path="/trips/:tripId/emergencies"
              element={<EmergencyPage />}
            />
            <Route
              path="/trips/:tripId/emergencies/critical"
              element={<CriticalEmergency />}
            />
            <Route
              path="/trips/:tripId/contacts"
              element={<TripContactsPage />}
            />

            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/not-found" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/not-found" replace />} />
          </Routes>
        </EmergencySocketProvider>
      </BrowserRouter>
    </>
  );
}

function App() {
  return (
    <LoadingProvider>
      <AppInner />
    </LoadingProvider>
  );
}

export default App;
