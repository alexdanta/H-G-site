import React from 'react';
import { FaInstagram, FaYoutube, FaPatreon, FaHandHoldingHeart } from 'react-icons/fa';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      <video className="background-video" autoPlay loop muted playsInline>
        <source
          src="https://ah-g-storage.s3.us-east-1.amazonaws.com/Herbe-George/mas+export.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
      <div className="overlay">
        <header>
          <h1>Herbé-George</h1>
          <p>Exciting things are coming, sit tight!</p>
        </header>
        <section>
          <h2>Follow Us</h2>
          <div className="social-links">
            <a
              href="https://www.instagram.com/herbe_george/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <FaInstagram />
            </a>
            <a
              href="https://www.youtube.com/@Herbe-George"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <FaYoutube />
            </a>
            <a
              href="https://www.patreon.com/ahg_xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <FaPatreon />
            </a>
            <a
              href="https://gofund.me/1ba376e0"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <FaHandHoldingHeart />
            </a>
          </div>
        </section>
        <footer>
          <p>© 2025 Herbé-George. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
