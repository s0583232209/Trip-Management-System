import { useParams } from "react-router-dom";
import PagePlaceholder from "../PagePlaceholder.jsx";

export default function TripSectionPage({ title, description }) {
  const { tripId } = useParams();
  return (
    <PagePlaceholder
      title={`${title} — טיול ${tripId}`}
      description={description}
    />
  );
}
