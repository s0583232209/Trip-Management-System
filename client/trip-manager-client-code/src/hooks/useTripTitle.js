import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api.js";

export default function useTripTitle(tripId) {
  const [tripTitle, setTripTitle] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    api
      .get(`/api/trips/${tripId}`)
      .then((res) => {
        const trip = Array.isArray(res.data) ? res.data[0] : res.data;
        if (trip?.title) setTripTitle(trip.title);
      })
      .catch(() => {
        navigate("./not-found");
      });
  }, [tripId]);

  return tripTitle;
}
