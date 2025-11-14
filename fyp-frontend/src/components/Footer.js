import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <h2 className="footer-logo">
          <img
            src={`${process.env.PUBLIC_URL}/fyp-images/logo.png`}
            width="60"
            height="30"
            alt="MoodMelody Logo"
            className="footer-icon"
          />
          <span>MoodMelody</span>
        </h2>

        <p className="footer-text">
          Feel the rhythm of your mood. AI-powered music that matches your emotions.
        </p>

        <div className="footer-links">
          <a href="/" className="footer-link">Home</a>
          <a href="/upload" className="footer-link">Upload</a>
          <a href="/keyword" className="footer-link">Keyword</a>
          <a href="/processing" className="footer-link">Processing</a>
          <a href="/result" className="footer-link">Result</a>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} <strong>MoodMelody</strong> | All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
