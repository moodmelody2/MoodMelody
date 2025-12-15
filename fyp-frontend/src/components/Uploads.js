import "./uploads.css";
import "./main.css";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useState } from "react";

function Upload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      return Swal.fire({
        toast: true,
        position: 'top',
        icon: 'warning',
        title: 'No File Selected',
        text: 'Please select a video first!',
        showConfirmButton: true,
        confirmButtonColor: '#3b8e75ff',
        width: '300px',
        padding: '0.8rem',
        background: '#ffffffff',
        timer: 3000,
        timerProgressBar: true
      });
    }

    const formData = new FormData();
    formData.append("video", selectedFile);

    try {
      const res = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();

      if (data.video_url) {
        localStorage.setItem("uploaded_video_url", data.video_url);
      } else {
        localStorage.setItem("uploaded_video_url", URL.createObjectURL(selectedFile));
      }

      // Show success popup first
      Swal.fire({
        toast: true,
        position: 'top',
        icon: 'success',
        title: 'Upload Started!',
        text: 'Your video upload has started successfully. 🎬',
        showConfirmButton: true,
        confirmButtonColor: '#3b8e75ff',
        width: '300px',
        padding: '0.8rem',
        background: '#ffffffff'
      }).then(() => {
        // Navigate to next page after popup is closed
        navigate("/keyword");
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        toast: true,
        position: 'top',
        icon: 'error',
        title: 'Upload Failed',
        text: err.message,
        showConfirmButton: true,
        confirmButtonColor: '#d33',
        width: '300px',
        padding: '0.8rem',
        background: '#ffffffff'
      });
    }
  };

  return (
    <div>
      <h1 className="top-heading">MoodMelody</h1>
      <h2 className="sub-Heading">Share Your Moment</h2>
      <h4 className="Description">
        Upload a video and let our AI create a personalized story and suggest music for you...
      </h4>

      <div className="upload-container">
        <h4 className="Description2">Drag your video here or click to browse</h4>

        <div className="upload-flex">
          <img
            src={`${process.env.PUBLIC_URL}/fyp-images/Video-512.webp`}
            alt="Upload Video Icon"
            className="upload-icon"
          />
          <label htmlFor="videoInput" className="custom-file-upload">
            {selectedFile ? selectedFile.name : "Choose Video"}
          </label>
          <input
            id="videoInput"
            type="file"
            accept="video/*"
            onChange={handleFileChange}
          />
        </div>

        {selectedFile && (
          <div className="video-preview">
            <video width="300" height="250" controls>
              <source src={URL.createObjectURL(selectedFile)} type="video/mp4" />
            </video>
          </div>
        )}

        <div className="container" id="cont2">
          <div className="row" id="cont2r1">
            <div className="col-2">MP4</div>
            <div className="col-2">MOV</div>
            <div className="col-2">AVI</div>
            <div className="col-4">Max 100MB</div>
          </div>
        </div>

        <button className="upload-btn" onClick={handleUpload}>
          Upload
        </button>
      </div>

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

export default Upload;
