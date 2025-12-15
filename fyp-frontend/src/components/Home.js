import './home.css';
import './main.css';
import Gallery from "./gallery";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h1 class="top-heading"> <img
        src={`${process.env.PUBLIC_URL}/fyp-images/iconmusic.webp`}
        width="50"
        height="55"
        alt="MoodMelody Logo"
      /> MoodMelody </h1>

      <div class="container" id="cont1">
        <div class="row">
          <div class="col-10 col-md-10 col-sm-12"  id="col1">
            <div>
              <h1 style={{ marginTop: "40px" }}>Interactive Gallery</h1>
              <Gallery />
            </div>
          </div>
          <div class="col-5 col-md-5 col-sm-12" id="main-col">
            <div class="row justify-content-center text-center">
              <div class="col-5 col-md-5 col-sm-6 mb-1" >
               <img
        src={`${process.env.PUBLIC_URL}/fyp-images/upload.jpg`}
        width="75"
        height="80"
        alt="Upload Video" 
        class="icons"
      /><h3> <Link to="/upload" className="home-link">Upload Video</Link></h3>
              </div>
              <div class="col-5 col-md-5 col-sm-6 mb-1" >
                <img
        src={`${process.env.PUBLIC_URL}/fyp-images/keyword.png`}
        width="65"
        height="70"
        alt="Add Keyword"
         class="icons"
      /><h3><Link to="/keyword" className="home-link">Add Keywords</Link></h3>
              </div>
            </div>
            <div class="row">
              <div class="col-6 col-md-6" id="last-col" >
                <img
        src={`${process.env.PUBLIC_URL}/fyp-images/result.png`}
        width="70"
        height="75"
        alt="MoodMelody Logo"
         class="icons"
         id="music-icon"
      /><h3><Link to="/result" className="home-link">Get Result</Link></h3>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button class="btn"><Link to="/upload" className="btn-link">Get Started</Link></button>
    </div>

  );
}
export default Home;