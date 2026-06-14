import UploadTripFile from "../pages/trips/documents/UploadTripFile.jsx";

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
          <button type="button" className="stop-remove-btn kit-doc-remove" onClick={onRemove}>
            הסר
          </button>
        )}
      </div>
      {subtitle && <p className="form-section-hint kit-doc-subtitle">{subtitle}</p>}
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
