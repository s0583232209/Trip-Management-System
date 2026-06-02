import Navbar from "../components/Navbar.jsx";
import "./trips/TripsPage.css";

export default function PagePlaceholder({ title, description, children }) {
  return (
    <>
      <Navbar />
      <main className="page-main">
        <h1 className="page-title">{title}</h1>
        <p>{description}</p>
        {children}
      </main>
    </>
  );
}
