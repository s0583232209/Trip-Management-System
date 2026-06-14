import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import api from "../api.js";
import socket from "../socket.js";
import { getTodayInIsrael, toDateOnlyString } from "../dateUtils.js";
import { setEmergencyAlert, clearEmergencyAlert } from "../store/emergencySlice.js";

export default function EmergencySocketProvider({ children }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const tripIdRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    async function joinTodayTrip() {
      try {
        const res = await api.get("/api/trips");
        const trips = res.data;
        if (!trips?.length) return;
        const today = getTodayInIsrael();
        const todayTrip = trips.find((t) => toDateOnlyString(t.trip_date) === today);
        if (!todayTrip) return;
        tripIdRef.current = todayTrip.id;
        socket.emit("join-trip", todayTrip.id);
      } catch (err) {
        console.error("EmergencySocketProvider trips fetch error", err);
      }
    }

    joinTodayTrip();

    function handleReconnect() {
      if (tripIdRef.current) socket.emit("join-trip", tripIdRef.current);
    }

    function handleEmergencyAlert(data) {
      dispatch(setEmergencyAlert(data.emergency));
    }
    function handleEmergencyClosed() {
      dispatch(clearEmergencyAlert());
    }

    socket.on("connect", handleReconnect);
    socket.on("emergency-alert", handleEmergencyAlert);
    socket.on("emergency-closed", handleEmergencyClosed);

    return () => {
      socket.off("connect", handleReconnect);
      socket.off("emergency-alert", handleEmergencyAlert);
      socket.off("emergency-closed", handleEmergencyClosed);
    };
  }, [user]);

  useEffect(() => {
    if (tripIdRef.current && location.pathname === `/trips/${tripIdRef.current}/emergencies`) {
      dispatch(clearEmergencyAlert());
    }
  }, [location.pathname]);

  return children;
}
