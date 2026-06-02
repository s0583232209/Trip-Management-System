import Navbar from "../../components/Navbar.jsx";
import "../trips/TripsPage.css";

export default function MediaPage() {
  return (
    <>
      <Navbar />
      <main className="page-main">
        <h1 className="page-title">מדיה</h1>
        <p>גלריית תמונות מהטיולים</p>
      </main>
    </>
  );
}
