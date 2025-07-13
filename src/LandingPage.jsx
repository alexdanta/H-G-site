<<<<<<< HEAD
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
=======
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { FaInstagram, FaYoutube, FaPatreon, FaHandHoldingHeart } from 'react-icons/fa';
import styles from './LandingPage.module.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const { userProfile } = useAuth();
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [networkSpeed, setNetworkSpeed] = useState('fast');

    // Detect mobile and network conditions
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        const checkNetworkSpeed = () => {
            // Check for slow connection
            if (navigator.connection) {
                const conn = navigator.connection;
                if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g' || conn.saveData) {
                    setNetworkSpeed('slow');
                } else if (conn.effectiveType === '3g') {
                    setNetworkSpeed('medium');
                } else {
                    setNetworkSpeed('fast');
                }
            }
        };

        checkMobile();
        checkNetworkSpeed();

        window.addEventListener('resize', checkMobile);
        
        // Listen for network changes
        if (navigator.connection) {
            navigator.connection.addEventListener('change', checkNetworkSpeed);
        }

        return () => {
            window.removeEventListener('resize', checkMobile);
            if (navigator.connection) {
                navigator.connection.removeEventListener('change', checkNetworkSpeed);
            }
        };
    }, []);

    const handleLoginClick = () => {
        navigate('/login');
    };

    const handleDashboardClick = () => {
        navigate('/dashboard');
    };

    // Determine video source based on device and network
    const getVideoSource = () => {
        const baseUrl = "https://ah-g-storage.s3.us-east-1.amazonaws.com/Herbe-George/";
        
        if (isMobile && networkSpeed === 'slow') {
            return `${baseUrl}mas+export-mobile-low.mp4`; // Create this: 480p, higher compression
        } else if (isMobile) {
            return `${baseUrl}mas+export-mobile.mp4`; // Create this: 720p optimized for mobile
        } else if (networkSpeed === 'slow') {
            return `${baseUrl}mas+export-compressed.mp4`; // Create this: desktop but compressed
        } else {
            return `${baseUrl}mas+export.mp4`; // Original
        }
    };

    return (
        <div className={styles.landingPageWrapper}>
            <div className={styles.landingContainer}>
                <div className={styles.topLogin}>
                    {userProfile ? (
                        <button className={styles.loginButton} onClick={handleDashboardClick}>
                            Dashboard
                        </button>
                    ) : (
                        <button className={styles.loginButton} onClick={handleLoginClick}>
                            Login
                        </button>
                    )}
                </div>

                {/* Loading placeholder */}
                {!videoLoaded && !videoError && (
                    <div className={styles.loadingPlaceholder}>
                        <div className={styles.loadingSpinner}></div>
                    </div>
                )}

                <video
                    className={`${styles.backgroundVideo} ${videoLoaded ? styles.videoLoaded : ''}`}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload={isMobile ? "none" : "metadata"}
                    onLoadedData={() => setVideoLoaded(true)}
                    onError={() => setVideoError(true)}
                    onCanPlay={() => setVideoLoaded(true)}
                    // Reduce quality on mobile
                    style={{
                        filter: isMobile && networkSpeed === 'slow' ? 'blur(0.5px)' : 'none'
                    }}
                >
                    <source
                        src={getVideoSource()}
                        type="video/mp4"
                    />
                    Your browser does not support the video tag.
                </video>
               
                <div className={styles.overlay}>
                    <header>
                        <h1>Herbé-George</h1>
                        <p>Exciting things are coming, sit tight!</p>
                    </header>
                    
                    <section>
                        <h2>Follow Us</h2>
                        <div className={styles.socialLinks}>
                            <a
                                href="https://www.instagram.com/herbe_george/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.socialLink}
                            >
                                <FaInstagram />
                            </a>
                            <a
                                href="https://www.youtube.com/@Herbe-George"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.socialLink}
                            >
                                <FaYoutube />
                            </a>
                            <a
                                href="https://www.patreon.com/ahg_xyz"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.socialLink}
                            >
                                <FaPatreon />
                            </a>
                            <a
                                href="https://gofund.me/1ba376e0"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.socialLink}
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
        </div>
    );
>>>>>>> feature/family-sorting
};

export default LandingPage;