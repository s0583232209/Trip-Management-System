import { useParams } from "react-router-dom";
import PagePlaceholder from "../PagePlaceholder.jsx";
import useTripTitle from "../../hooks/useTripTitle.js";

export default function TripSectionPage({ title, description }) {
  const { tripId } = useParams();
  const tripTitle = useTripTitle(tripId);
  return (
    <PagePlaceholder
      title={`${title} — טיול ${tripTitle || tripId}`}
      description={description}
    />
  );
}
