import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Footer from "./components/Footer";

import { Routes, Route, NavLink, Link } from 'react-router-dom';

import Home from './components/Home';
import Upload from './components/Uploads';
import Keyword from './components/Keyword';
import Processing from './components/Processing';
import Result from './components/Result';

function App() {
  return (
    <div className="App">
      <header>
        <Navbar expand="lg" className="navbackground" variant="dark">
          <Container>
            <Navbar.Brand as={Link} to="/" className="logo">
              <img
                src={`${process.env.PUBLIC_URL}/fyp-images/moodmelodyicon.png`}
                width="50"
                height="50"
                alt="MoodMelody Logo"
              />
              <span className="brand-text">MoodMelody</span>
            </Navbar.Brand>

            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav" className="justify-content-center">
              <Nav className="nav-links">
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
          minHeight: "100vh",
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
  );
}

export default App;
