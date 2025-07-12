import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './UserDashboard.module.css';

const UserDashboard = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const apps = [
    {
      id: 'sorting',
      name: 'Family Item Sorting',
      description: 'Sort through storage items with family voting',
      icon: '📦',
      route: '/sorting',
      color: 'linear-gradient(135deg, #667eea, #764ba2)',
      status: 'active'
    },
    {
      id: 'analytics',
      name: 'Analytics Dashboard',
      description: 'View insights and reports',
      icon: '📊',
      route: '/analytics',
      color: 'linear-gradient(135deg, #f093fb, #f5576c)',
      status: 'coming-soon',
      adminOnly: true
    },
    {
      id: 'admin',
      name: 'Admin Panel',
      description: 'Manage users and system settings',
      icon: '⚙️',
      route: '/admin',
      color: 'linear-gradient(135deg, #4facfe, #00f2fe)',
      status: 'coming-soon',
      adminOnly: true
    }
  ];

  const userApps = apps.filter(app => {
    if (app.adminOnly && userProfile?.role !== 'admin') return false;
    return userProfile?.apps?.includes(app.id) || app.status === 'coming-soon';
  });

  const handleAppClick = (app) => {
    if (app.status === 'active') {
      navigate(app.route);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!userProfile) return null;

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.userSection}>
              <div 
                className={styles.userAvatar}
                style={{ background: userProfile.color }}
              >
                {userProfile.avatar}
              </div>
              <div className={styles.userInfo}>
                <h1 className={styles.welcomeText}>Welcome back, {userProfile.displayName}!</h1>
                <p className={styles.userRole}>
                  {userProfile.role === 'admin' ? 'Administrator' : 'Family Member'}
                </p>
                <p className={styles.userEmail}>{userProfile.email}</p>
              </div>
            </div>
            <div className={styles.headerActions}>
              <button className={styles.logoutBtn} onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className={styles.main}>
          <div className={styles.appsSection}>
            <h2 className={styles.sectionTitle}>Your Applications</h2>
            <div className={styles.appsGrid}>
              {userApps.map((app) => (
                <div
                  key={app.id}
                  className={`${styles.appCard} ${app.status === 'coming-soon' ? styles.comingSoon : ''}`}
                  onClick={() => handleAppClick(app)}
                  style={{
                    cursor: app.status === 'active' ? 'pointer' : 'default'
                  }}
                >
                  <div className={styles.appCardContent}>
                    <div 
                      className={styles.appIcon}
                      style={{ background: app.color }}
                    >
                      {app.icon}
                    </div>
                    <h3 className={styles.appName}>{app.name}</h3>
                    <p className={styles.appDescription}>{app.description}</p>
                    <div className={styles.appStatus}>
                      {app.status === 'active' && (
                        <span className={styles.statusActive}>Ready to use</span>
                      )}
                      {app.status === 'coming-soon' && (
                        <span className={styles.statusComingSoon}>Coming Soon</span>
                      )}
                    </div>
                  </div>
                  {app.status === 'active' && (
                    <div className={styles.appCardHover}>
                      <span>Click to open</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className={styles.footer}>
          <p>© 2025 Herbé-George Charity. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default UserDashboard;