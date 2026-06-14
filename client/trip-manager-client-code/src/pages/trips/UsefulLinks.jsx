import Navbar from "../../components/Navbar.jsx";
import "../trips/TripsPage.css";

const LINKS = [
  {
    label: 'חוזרי מנכ"ל',
    href: "https://apps.education.gov.il/mankal/horaa.aspx?siduri=450#_Toc256000167",
  },
  {
    label: "ביטחון ובטיחות בטיולים ובפעילויות חוץ בית ספריות",
    href: "https://pob.education.gov.il/institutions/main-security/trips-safety/",
  },
  {
    label: "מצגת הנחיה של מוקד טבע - האפליקציה",
    href: "https://meyda.education.gov.il/files/PortalShaar/moked_teva_online_app.pdf",
  },
  {
    label: "סרטון הנחיה של מוקד טבע — ניהול טיול",
    href: "http://develop.lnet.org.il/dev/video/trip/main_3.mp4",
  },
  {
    label: "טלפונים חשובים בעת תכנון וביצוע פעילויות — טיולים, שטח ואתגר",
    href: "https://meyda.education.gov.il/files/Bitachon/KMPhones190319.pdf",
  },
  {
    label: "מוקד טבע",
    href: "https://mokedteva.co.il/MokedTevaTravelers/TripCoordination",
  },
  {
    label: "אוגדן טיולים מעודכן 09.2026",
    href: "https://www.gov.il/BlobFolder/policy/youth-trips/he/manpower-training_youth_trips-2025.pdf",
  },
];

export default function UsefulLinks() {
  return (
    <>
      <Navbar />
      <main className="page-main" style={{ maxWidth: 700 }}>
        <h1 className="page-title">🔗 קישורים שימושיים</h1>

        <section
          style={{
            background: "var(--surface)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow)",
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}
        >
          {LINKS.map((link, i) => (
            <a
              key={i}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem 1.5rem",
                borderBottom:
                  i < LINKS.length - 1 ? "1px solid var(--border)" : "none",
                color: "var(--text)",
                textDecoration: "none",
                fontSize: 16,
                fontWeight: 500,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--sky-light)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <span>{link.label}</span>
              <span style={{ color: "var(--sky-dark)", fontSize: 18 }}>←</span>
            </a>
          ))}
        </section>
      </main>
    </>
  );
}
