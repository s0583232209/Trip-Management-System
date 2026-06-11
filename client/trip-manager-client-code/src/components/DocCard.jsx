import UploadTripFile from "../pages/trips/UploadTripFile.jsx";

// כרטיס מסמך בודד בתיק הטיול: כותרת, תג מספר/אייקון, סטטוס העלאה וטופס העלאה/החלפה/מחיקה.
// משמש גם עבור מסמכי חובה, גם עבור אישורי אטרקציות וגם עבור קבצים נוספים.
export default function DocCard({
  badge,
  title,
  subtitle,
  uploaded,
  tripId,
  fileCode,
  documentType,
  onUpload,
  onRemove,
}) {
  return (
    <div className={`kit-doc-card ${uploaded ? "kit-doc-card--done" : ""}`}>
      <div className="kit-doc-header">
        <span className={`kit-doc-badge ${uploaded ? "kit-doc-badge--done" : ""}`}>
          {uploaded ? "✓" : badge}
        </span>
        <h3 className="kit-doc-title">{title}</h3>
        {onRemove && (
          <button type="button" className="stop-remove-btn" style={{ marginRight: "auto" }} onClick={onRemove}>
            הסר
          </button>
        )}
      </div>
      {subtitle && <p className="form-section-hint" style={{ margin: "0.25rem 0 0.5rem" }}>{subtitle}</p>}
      {uploaded && (
        <div className="kit-doc-uploaded-row">
          <span className="kit-doc-filename">{uploaded.original_name}</span>
          <span className="kit-doc-ok-label">הועלה</span>
        </div>
      )}
      <UploadTripFile
        compact
        tripId={tripId}
        fileCode={fileCode}
        documentType={documentType}
        existingFile={uploaded || null}
        onUploadSuccess={onUpload}
      />
    </div>
  );
}
