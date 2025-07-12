import React from 'react';

const LoginScreen = ({ onLogin, styles }) => {
  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h2 className={styles.loginTitle}>Family Item Sorting</h2>
        <p className={styles.loginSubtitle}>Choose your family member to continue</p>
        <div className={styles.familyLoginButtons}>
          <button 
            className={`${styles.familyLoginBtn} ${styles.alexander}`} 
            onClick={() => onLogin('alexander')}
          >
            👨‍💼 Alexander <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>(Admin)</span>
          </button>
          <button 
            className={`${styles.familyLoginBtn} ${styles.celestin}`} 
            onClick={() => onLogin('celestin')}
          >
            👨 Celestin
          </button>
          <button 
            className={`${styles.familyLoginBtn} ${styles.doRachelle}`} 
            onClick={() => onLogin('do-rachelle')}
          >
            👩 Do-Rachelle
          </button>
          <button 
            className={`${styles.familyLoginBtn} ${styles.laura}`} 
            onClick={() => onLogin('laura')}
          >
            👩‍🦱 Laura
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;