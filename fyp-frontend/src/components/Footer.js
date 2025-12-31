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
  <Link to="/" className="footer-link">Home</Link>
  <Link to="/upload" className="footer-link">Upload</Link>
  <Link to="/keyword" className="footer-link">Keyword</Link>
  <Link to="/processing" className="footer-link">Processing</Link>
  <Link to="/result" className="footer-link">Result</Link>
</div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} <strong>MoodMelody</strong> | All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
