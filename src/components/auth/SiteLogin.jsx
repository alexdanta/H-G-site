import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './SiteLogin.module.css';

const SiteLogin = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    
    setIsSubmitting(true);
    const result = await login(email.trim(), password.trim());
   
    if (!result.success) {
      console.error('Login failed:', result.error);
    }
    setIsSubmitting(false);
  };

  const handleQuickLogin = async (userEmail) => {
    setEmail(userEmail);
    setPassword('password123'); // Simple password for testing
    
    setIsSubmitting(true);
    const result = await login(userEmail, 'password123');
   
    if (!result.success) {
      console.error('Login failed:', result.error);
    }
    setIsSubmitting(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleClose = () => {
    navigate('/');
  };

  // Quick login buttons for testing
  const quickLogins = [
    { email: 'alexander@herbe-george.com', name: 'Alexander', role: 'Admin' },
    { email: 'scelestinherbegeorge@gmail.com', name: 'Celestin', role: 'Family' },
    { email: 'dodorachelle@gmail.com', name: 'Do-Rachelle', role: 'Family' },
    { email: 'laura@herbe-george.com', name: 'Laura', role: 'Family' }
  ];

  if (isLoading) {
    return (
      <div className={styles.loginOverlay}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.loginOverlay}>
      <button className={styles.closeButton} onClick={handleClose} aria-label="Close login">
        ✕
      </button>
      
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <h2 className={styles.loginTitle}>Welcome to Herbé-George</h2>
          <p className={styles.loginSubtitle}>Sign in to access your dashboard</p>
         
          <form onSubmit={handleSubmit} className={styles.loginForm}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                placeholder="Enter your email"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <div className={styles.passwordInputWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                  placeholder="Enter your password"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={togglePasswordVisibility}
                  disabled={isSubmitting}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className={styles.loginButton}
              disabled={isSubmitting || !email.trim() || !password.trim()}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className={styles.loginFooter}>
            <p>© 2025 Herbé-George Charity. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteLogin;