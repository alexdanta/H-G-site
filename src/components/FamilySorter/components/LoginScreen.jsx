import React from 'react';

const LoginScreen = ({ onLogin }) => {
    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Family Item Sorting</h2>
                <p className="login-subtitle">Choose your family member to continue</p>
                <div className="family-login-buttons">
                    <button
                        className="family-login-btn alexander"
                        onClick={() => onLogin('alexander')}
                    >
                        👨‍💼 Alexander <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>(Admin)</span>
                    </button>
                    <button
                        className="family-login-btn celestin"
                        onClick={() => onLogin('celestin')}
                    >
                        👨 Celestin
                    </button>
                    <button
                        className="family-login-btn do-rachelle"
                        onClick={() => onLogin('do-rachelle')}
                    >
                        👩 Do-Rachelle
                    </button>
                    <button
                        className="family-login-btn laura"
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