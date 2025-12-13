import React, { useState } from "react";
import "./main.css";
import "./keywords.css";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";

function Keyword() {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  // Handle input change
  const handleChange = (e) => setKeyword(e.target.value);

  // Handle keyword submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!keyword.trim()) {
      return Swal.fire({
        toast: true,
        position: 'top',
        icon: 'warning',
        title: 'No Keyword',
        text: 'Please enter a keyword!',
        showConfirmButton: true,
        confirmButtonColor: '#3b8e75ff',
        width: '300px',
        padding: '0.8rem',
        background: '#ffffffff'
      });
    }

    localStorage.setItem("selectedKeyword", keyword);

    Swal.fire({
      toast: true,
      position: 'top',
      icon: 'success',
      title: 'Keyword Saved!',
      text: 'Your inspiration keyword is saved 🎵',
      showConfirmButton: true,
      confirmButtonColor: '#3b8e75ff',
      width: '300px',
      padding: '0.8rem',
      background: '#ffffffff'
    }).then(() => {
      navigate("/processing");
    });
  };


  // Handle suggested keyword selection
  const handleSelect = (value) => setKeyword(value);

  return (
    <div className="keyword-page">
      <h1 className="top-heading">
        <img
          src={`${process.env.PUBLIC_URL}/fyp-images/iconmusic.webp`}
          width="50"
          height="55"
          alt="MoodMelody Logo"
        />{" "}
        MoodMelody
      </h1>

      <blockquote className="styled-quote">
        <p>
          <img
            src={`${process.env.PUBLIC_URL}/fyp-images/movie.webp`}
            width="35"
            height="30"
            alt="Mood Icon"
            className="movie"
          />
          From Moments to Melodies — Create Stories from Your Videos...
        </p>
      </blockquote>

      <h2 className="main-heading">Add Your Inspiration Keyword</h2>

      <form className="keyword-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="keyword-input"
          placeholder="Enter a word that captures your video (e.g., adventure, peace...)"
          value={keyword}
          onChange={handleChange}
        />

        <div className="keyword-suggestions">
          <div className="row">
            <div className="col" onClick={() => handleSelect("Adventure")}>Adventure</div>
            <div className="col" onClick={() => handleSelect("Love")}>Love</div>
            <div className="col" onClick={() => handleSelect("Freedom")}>Freedom</div>
            <div className="col" onClick={() => handleSelect("Mystery")}>Mystery</div>
          </div>
          <div className="row-2">
            <div className="col" onClick={() => handleSelect("Joy")}>Joy</div>
            <div className="col" onClick={() => handleSelect("Peace")}>Peace</div>
            <div className="col" onClick={() => handleSelect("Memories")}>Memories</div>
          </div>
        </div>

        <button type="submit" className="keyword-btn">Next</button>
      </form>
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

export default Keyword;
