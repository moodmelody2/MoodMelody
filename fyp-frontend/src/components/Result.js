import './main.css';
import './result.css';
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Result() {
  const navigate = useNavigate();

  const [resultData, setResultData] = useState({
    emotion: "",
    keyword: "",
    confidence: 0,
    songName: "",
    artist: "",
    songDescription: "",
    detectedObjects: [],
    story: ""
  });

  // Load data from localStorage safely
  // Load data from backend (/status)
useEffect(() => {
  const fetchResult = async () => {
    try {
      const response = await fetch("https://moodmelody2-backend.onrender.com/status");

      const data = await response.json();
      console.log("✅ Received data from backend:", data);

      const result = data.result || {};
      const emotion = result.dominant_emotion || "Neutral";
      const objectsList = result.detected_objects || [];
      const song = result.recommended_song || { track_name: "Unknown", artist: "Unknown" };
      const story = result.generated_story || "No story generated.";

      setResultData({
        emotion,
        keyword: localStorage.getItem("selectedKeyword") || "Adventure",
        confidence: 87,
        songName: song.track_name,
        artist: song.artist,
        songDescription: `Perfect match for your ${emotion.toLowerCase()} mood!`,
        detectedObjects: objectsList,
        story
      });

      // Save for later use
      localStorage.setItem("dominant_emotion", emotion);
      localStorage.setItem("detected_objects", JSON.stringify(objectsList));
      localStorage.setItem("recommended_song", JSON.stringify(song));
      localStorage.setItem("generated_story", story);

    } catch (error) {
      console.error("❌ Error fetching /status data:", error);
    }
  };

  fetchResult();
}, []);


  // 🔁 Re-generate story handler
  // 🔁 Re-generate story handler
const handleRegenerateStory = async () => {
  try {
    const res = await fetch("https://moodmelody2-backend.onrender.com/generate_story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        objects: resultData.detectedObjects,
        emotion: resultData.emotion,
        keyword: resultData.keyword
      }),
    });

    const data = await res.json();
    if (data.status === "success") {
      setResultData((prev) => ({ ...prev, story: data.generated_story }));
      localStorage.setItem("generated_story", data.generated_story);
    } else {
      console.error("Story regeneration failed:", data.message);
    }
  } catch (error) {
    console.error("Error regenerating story:", error);
  }
};



  return (
    <div>
      {/* Header */}
      <h1 className="top-heading">
        <img
          src={`${process.env.PUBLIC_URL}/fyp-images/iconmusic.webp`}
          width="50"
          height="55"
          alt="MoodMelody Logo"
        />{" "}
        MoodMelody
      </h1>
      <p className="top-Description">Your Personalized Music and Story are Ready</p>

      {/* Detection Overview */}
      <div className="container" id="mini-cont">
        <div className="row text-center">
          <div className="col-4"><h3 className="detections">Detected Expression</h3></div>
          <div className="col-4"><h3 className="detections">Keyword</h3></div>
          <div className="col-4"><h3 className="detections">Confidence</h3></div>
        </div>
        <div className="row text-center align-items-center mt-2">
          <div className="col-4"><h5 className="detected">{resultData.emotion}</h5></div>
          <div className="col-4"><h5 className="detected">“{resultData.keyword}”</h5></div>
          <div className="col-4">
            <h5
              className="detected"
              style={{
                color: resultData.confidence >= 80 ? "green" :
                       resultData.confidence >= 60 ? "orange" : "red"
              }}
            >
              {resultData.confidence}%
            </h5>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container" id="main-cont">
        <div className="row">
          {/* Left – Recommended Music */}
          <div className="col-md-4" id="music-sug">
            <h3 className="detections">
              <img
                src={`${process.env.PUBLIC_URL}/fyp-images/icon.png`}
                width="30" height="30" alt="Music Icon" className="logo-icon"
              /> Recommended Music
            </h3>
            <div className="music-details">
              <h4 className="music-name">
                <img
                  src={`${process.env.PUBLIC_URL}/fyp-images/iconmusic.webp`}
                  width="35" height="35" alt="Music Icon" className="logo-icon"
                /> {resultData.songName}
              </h4>
              <p className="artist-name">{resultData.artist}</p>
              <p className="music-desc">{resultData.songDescription}</p>
            </div>
          </div>

          {/* Right – Story */}
          <div className="col-md-7 offset-md-1" id="story">
            <h3 className="detections">
              <img
                src={`${process.env.PUBLIC_URL}/fyp-images/story.jpg`}
                width="30" height="30" alt="Story Icon" className="logo-icon2"
              /> Generated Story
            </h3>
            <div className="story-details">
              <h5 className="detected-objects">Detected Objects:</h5>
              <div className="object-list">
                {resultData.detectedObjects.length ? 
                  resultData.detectedObjects.map((obj, idx) => (
                    <span key={idx} className="object-badge">{obj}</span>
                  ))
                  : <span className="object-badge">None</span>
                }
              </div>
              <p className="story-text">{resultData.story}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="tryanother-btn" onClick={() => navigate("/upload")}>
          🎥 Try Another Video
        </button>
        <button className="regen-btn" onClick={handleRegenerateStory}>
          🔄 Re-generate Story
        </button>
      </div>
    </div>
  );
}

export default Result;
