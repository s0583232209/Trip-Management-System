import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <>
      <Navbar />
      <main
        className="page-main"
        style={{ textAlign: "center", marginTop: "50px" }}
      >
        <h1 className="page-title">404 - עמוד לא נמצא</h1>
        <p style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>
          מצטערים, אך העמוד או הנתון שחיפשת אינם קיימים במערכת.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button
            onClick={() => navigate(-1)}
            className="trip-form-btn trip-form-btn--ghost"
            style={{ display: "inline-block" }}
          >
            חזרה לדף הקודם
          </button>
          <Link
            to="/"
            className="trip-form-btn trip-form-btn--primary"
            style={{ textDecoration: "none", display: "inline-block" }}
          >
            חזרה לדף הבית
          </Link>
        </div>
      </main>
    </>
  );
}
