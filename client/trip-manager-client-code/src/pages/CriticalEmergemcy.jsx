import videoSrc from "../assets/critical_emegency_video.mp4";

export default function CriticalEmergency() {
  return (
    <div>
      <video
        src={videoSrc}
        controls
        style={{ width: "720px", maxWidth: "100%", borderRadius: "8px" }}
      />
    </div>
  );
}
