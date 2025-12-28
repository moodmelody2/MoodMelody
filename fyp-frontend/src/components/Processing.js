import React, { useEffect, useState } from "react";
import "./main.css";
import "./processing.css";
import { Link, useNavigate } from "react-router-dom";

export default function Processing() {
  const navigate = useNavigate();
  const [status, setStatus] = useState({});
  const [videoUrl, setVideoUrl] = useState(null);

  const statusIcons = {
    completed: `${process.env.PUBLIC_URL}/fyp-images/tick.png`,
    processing: `${process.env.PUBLIC_URL}/fyp-images/inprogress.png`,
    pending: `${process.env.PUBLIC_URL}/fyp-images/pending.jpeg`,
  };

  const stepNames = {
    objectDetection: "Object Detection",
    emotionAnalysis: "Facial Expression Analysis",
    musicRecommendation: "Music Recommendation",
    storyGeneration: "Story Generation",
  };

  useEffect(() => {
    const storedUrl = localStorage.getItem("uploaded_video_url");
    if (storedUrl) setVideoUrl(storedUrl);

    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/status");
        const data = await res.json();

        // Flask may return {objectDetection:..., emotionAnalysis:...} OR {status:{...}, result:{...}}
        const currentStatus = data.status || data;
        setStatus(currentStatus);

        const allDone = Object.values(currentStatus).every((v) => v === "completed");

        if (allDone && data.result) {
          localStorage.setItem(
            "detected_objects",
            JSON.stringify(data.result.detected_objects || [])
          );
          localStorage.setItem("dominant_emotion", data.result.dominant_emotion || "neutral");
          localStorage.setItem(
            "recommended_song",
            JSON.stringify(data.result.recommended_song || {})
          );
          localStorage.setItem("generated_story", data.result.generated_story || "");
          navigate("/result");
        }
      } catch (err) {
        console.error("Error fetching status:", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  const progress =
    (Object.values(status).filter((s) => s === "completed").length / 4) * 100;

  const keyword = localStorage.getItem("selectedKeyword") || "—";

  return (
    <div className="keyword-page">
      {/* 🌟 Header */}
      <h1 className="top-heading">
        <img
          src={`${process.env.PUBLIC_URL}/fyp-images/iconmusic.webp`}
          width="50"
          height="55"
          alt="MoodMelody Logo"
        />{" "}
        MoodMelody
      </h1>

      <p className="top-Description">AI Processing in Progress</p>

      {/* 🎥 Video or Placeholder */}
      <div className="uploads-flex">
        {videoUrl ? (
          <video
            src={videoUrl}
            className="video-preview"
            controls
            autoPlay
            muted
            loop
            width="380"
            height="270"
          />
        ) : (
          <img
            src={`${process.env.PUBLIC_URL}/fyp-images/vedio.jpg`}
            alt="Video Placeholder"
            className="vedio-icon"
          />
        )}
        <h3 className="keyword-heading">Keyword = “{keyword}”</h3>
      </div>

      {/* 📊 Progress Bar */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="processing-content">
  <div className="step-list">
    {Object.keys(stepNames).map((step) => (
      <div className="processing-step" key={step}>
        <img
          src={statusIcons[status[step] || "pending"]}
          alt={status[step] || "pending"}
          className="processing-step-icon"
        />
        <p>{stepNames[step]}</p>
      </div>
    ))}
  </div>

  <div className="status-section">
    {Object.keys(stepNames).map((step) => (
      <p key={step}>
        {status[step] === "completed"
          ? "✅ Completed"
          : status[step] === "processing"
          ? "⏳ Processing..."
          : "🕓 Pending"}
      </p>
    ))}
  </div>
</div>


      {/* 🔘 Buttons */}
      <button className="cancel-btn" onClick={() => navigate("/keyword")}>
        Cancel Processing
      </button>

      <nav aria-label="Page navigation" className="page-nav">
        <ul className="pagination-nav">
          <li className="page-item">
            <Link to="/keyword" className="page-link">
              <img
                src={`${process.env.PUBLIC_URL}/fyp-images/previous.png`}
                width="40"
                height="45"
                alt="Previous"
                className="previous"
              />
            </Link>
          </li>
          <li className="page-item next-link">
            <Link to="/result" className="page-link">
              <img
                src={`${process.env.PUBLIC_URL}/fyp-images/next.png`}
                width="40"
                height="45"
                alt="Next"
                className="next"
              />
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}





