import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

export default function Unauthorized() {
  return (
    <>
      <Navbar />
      <main
        className="page-main"
        style={{ textAlign: "center", marginTop: "50px" }}
      >
        <h1 className="page-title">403 - גישה נדחתה</h1>
        <p style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>
          מצטערים, אך אין לך את ההרשאות המתאימות לצפות בעמוד זה.
        </p>
        <Link
          to="/"
          className="trip-form-btn trip-form-btn--primary"
          style={{ textDecoration: "none", display: "inline-block" }}
        >
          חזרה לדף הבית
        </Link>
      </main>
    </>
  );
}
