import { useEffect, useState } from "react";
import api from "../api.js";

export default function useTripTitle(tripId) {
  const [tripTitle, setTripTitle] = useState("");

  useEffect(() => {
    api
      .get(`/api/trips/${tripId}`)
      .then((res) => {
        const trip = Array.isArray(res.data) ? res.data[0] : res.data;
        if (trip?.title) setTripTitle(trip.title);
      })
      .catch(() => {});
  }, [tripId]);

  return tripTitle;
}
