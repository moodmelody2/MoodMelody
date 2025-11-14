import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Footer from "./components/Footer";

import { BrowserRouter as Router, Routes, Route, NavLink, Link } from 'react-router-dom';

import Home from './components/Home';
import Upload from './components/Uploads';
import Keyword from './components/Keyword';
import Processing from './components/Processing';
import Result from './components/Result';

function App() {
  return (
    <Router>
      <div className="App">
        <header>
          <Navbar expand="lg" className="navbackground">
            <Container>
              <Navbar.Brand as={Link} to="/">
                <img
                  src={`${process.env.PUBLIC_URL}/fyp-images/logo.png`}
                  width="120"
                  height="50"
                  alt="MoodMelody Logo"
                />
              </Navbar.Brand>

              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="nav-links mx-auto">
                  <NavLink to="/" className="nav-link">Home</NavLink>
                  <NavLink to="/upload" className="nav-link">Upload</NavLink>
                  <NavLink to="/keyword" className="nav-link">Keyword</NavLink>
                  <NavLink to="/processing" className="nav-link">Processing</NavLink>
                  <NavLink to="/result" className="nav-link">Result</NavLink>
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </header>

       <main
  className="App-main"
  style={{
    backgroundImage: `url(${process.env.PUBLIC_URL}/fyp-images/background.jpeg)`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    minHeight: "100%",
    color: "white"
  }}
>
  <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/keyword" element={<Keyword />} />
            <Route path="/processing" element={<Processing />} />
            <Route path="/result" element={<Result />} />
          </Routes>
        </main>
        <Footer /> 
      </div>
    </Router>
  );
}

export default App;
