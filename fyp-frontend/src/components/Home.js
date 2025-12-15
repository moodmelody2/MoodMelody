import React, { useEffect } from 'react';
import './home.css';
import './main.css';
import Gallery from "./gallery";
import { Link } from "react-router-dom";

function Home() {
  useEffect(() => {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50; // number of particles

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.top = `${Math.random() * 100}vh`;
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.width = `${2 + Math.random() * 3}px`;
        particle.style.height = particle.style.width;
        particle.style.background = `rgba(124, 92, 255, ${0.2 + Math.random() * 0.5})`;
        particlesContainer.appendChild(particle);
    }
  }, []);

  return (
    <>
      <div className="bg-gradient"></div>
      <div className="particles" id="particles"></div>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-left">
            <h1>Music that understands emotions</h1>
            <p>
              Upload a video or enter keywords, and let our AI-powered system
              analyze facial expressions and recommend the perfect soundtrack.
            </p>
            <div className="cta-buttons">
              <a href="/upload" className="btn btn-primary">🎬 Upload Video</a>
              <a href="/keyword" className="btn btn-secondary">🔤 Add Keywords</a>
            </div>
          </div>

          <div className="hero-right">
            <div className="emotion-visualizer">
              <div className="wave-container">
                <div className="wave"></div>
                <div className="wave"></div>
                <div className="wave"></div>
              </div>

              <div className="emotion-core">
                <div className="core-icon">🧠</div>
              </div>

              <div className="emotion-labels">
                <div className="emotion-label happy">😊 Happy</div>
                <div className="emotion-label sad">😢 Melancholic</div>
                <div className="emotion-label energetic">⚡ Energetic</div>
                <div className="emotion-label calm">😌 Calm</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Three simple steps to get expression-matched music recommendations</p>
        </div>

        <div className="steps">
          <div className="step">
            <div className="step-number">01</div>
            <span className="step-icon">📤</span>
            <h3>Upload Video</h3>
            <p>
              Our AI analyzes facial expressions, body language, and contextual cues to understand the emotional tone of your content.
            </p>
          </div>

          <div className="step">
            <div className="step-number">02</div>
            <span className="step-icon">🔍</span>
            <h3>Add Keywords</h3>
            <p>
              Enhance accuracy with contextual keywords. Our NLP system processes natural language to refine emotion detection.
            </p>
          </div>

          <div className="step">
            <div className="step-number">03</div>
            <span className="step-icon">🎵</span>
            <h3>Get Music</h3>
            <p>
              Receive personalized music recommendations that perfectly match the emotional atmosphere of your content.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="section-header">
          <h2>Why MoodMelody</h2>
          <p>Intelligent features designed for content creators</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">🤖</span>
            <h3>Emotion-Aware AI</h3>
            <p>Advanced machine learning models trained on emotional recognition and music theory.</p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">🎯</span>
            <h3>Context Understanding</h3>
            <p>NLP-powered keyword analysis for enhanced contextual awareness and precision.</p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">⚡</span>
            <h3>Instant Results</h3>
            <p>Real-time processing with optimized algorithms for immediate music recommendations.</p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">🎨</span>
            <h3>Made for Creators</h3>
            <p>Purpose-built for video creators, filmmakers, and content producers.</p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">🔒</span>
            <h3>Privacy First</h3>
            <p>Your videos are processed securely and never stored permanently on our servers.</p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">📊</span>
            <h3>Detailed Analysis</h3>
            <p>Get comprehensive emotion breakdowns and confidence scores for each recommendation.</p>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
