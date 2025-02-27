import React from 'react';
import './LandingPage.css';

const LandingPage = () => {
    return (
        <div className="landing-container">
            <div className="video-container">
                <video
                    className="background-video"
                    autoPlay
                    loop
                    muted
                    playsInline
                >
                    <source
                        src="https://ah-g-storage.s3.us-east-1.amazonaws.com/Herbe-George/mas+export.mp4"
                        type="video/mp4"
                    />
                    Your browser does not support the video tag.
                </video>
                <div className="video-overlay">
                    <header>
                        <h1>Herbé-George Charity</h1>
                        <p>Making a difference, one step at a time.</p>
                    </header>

                    <section className="section">
                        <h2>About Us</h2>
                        <p>
                            Welcome to Herbé-George Charity, dedicated to transforming lives and building stronger communities.
                        </p>
                    </section>

                    <section className="section">
                        <h2>Get Involved</h2>
                        <p>
                            Your support is invaluable. Whether through donations or volunteering, every contribution makes an impact.
                        </p>
                        <button className="donate-button">Donate Now</button>
                    </section>

                    <section className="section">
                        <h2>Follow Us</h2>
                        <div className="social-links">
                            <a
                                href="https://www.instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="social-link instagram"
                            >
                                Instagram
                            </a>
                            <a
                                href="https://www.youtube.com/@Herbe-George"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="social-link youtube"
                            >
                                YouTube
                            </a>
                            <a
                                href="https://www.patreon.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="social-link patreon"
                            >
                                Patreon
                            </a>
                            <a
                                href="https://www.gofundme.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="social-link gofundme"
                            >
                                GoFundMe
                            </a>
                        </div>
                    </section>

                    <footer className="footer">
                        <p>© 2025 Herbé-George Charity. All rights reserved.</p>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
