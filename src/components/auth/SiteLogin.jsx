import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './SiteLogin.module.css';

const SiteLogin = () => {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    const result = await login(email.trim());
    
    if (!result.success) {
      console.error('Login failed:', result.error);
    }
    setIsSubmitting(false);
  };

  // Quick login buttons for testing
  const quickLogins = [
    { email: 'alexander@herbe-george.com', name: 'Alexander', role: 'Admin' },
    { email: 'celestin@herbe-george.com', name: 'Celestin', role: 'Family' },
    { email: 'do-rachelle@herbe-george.com', name: 'Do-Rachelle', role: 'Family' },
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

            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className={styles.loginButton}
              disabled={isSubmitting || !email.trim()}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className={styles.divider}>
            <span>or for testing</span>
          </div>

          <div className={styles.quickLogin}>
            <p className={styles.quickLoginTitle}>Quick Login (Development)</p>
            <div className={styles.quickLoginButtons}>
              {quickLogins.map((user) => (
                <button
                  key={user.email}
                  className={styles.quickLoginBtn}
                  onClick={() => setEmail(user.email)}
                  disabled={isSubmitting}
                >
                  <span className={styles.quickLoginName}>{user.name}</span>
                  <span className={styles.quickLoginRole}>{user.role}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className={styles.loginFooter}>
            <p>© 2025 Herbé-George Charity. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteLogin;