import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Firebase configuration for the SITE
const firebaseConfig = {
  apiKey: "AIzaSyAvi3Z5GqIQlGMuAy_TZnrDgOFr5ltkdZ4",
  authDomain: "herbe-george-site.firebaseapp.com",
  projectId: "herbe-george-site",
  storageBucket: "herbe-george-site.firebasestorage.app",
  messagingSenderId: "824809965246",
  appId: "1:824809965246:web:70305a38f55972e533c0ef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export Firebase instances for dataUtils
export { db, auth, app };

// Create the context
const AuthContext = createContext(null);

// User profiles
const userProfiles = {
  'alexander@herbe-george.com': {
    uid: 'alexander',
    email: 'alexander@herbe-george.com',
    displayName: 'Alexander',
    role: 'admin',
    avatar: 'A',
    color: 'linear-gradient(135deg, #667eea, #764ba2)',
    apps: ['sorting', 'analytics', 'admin'],
    permissions: {
      canAddItems: true,
      canDeleteItems: true,
      canExport: true,
      canManageUsers: true
    }
  },
  'scelestinherbegeorge@gmail.com': {
    uid: 'celestin',
    email: 'scelestinherbegeorge@gmail.com',
    displayName: 'Celestin',
    role: 'family',
    avatar: 'C',
    color: 'linear-gradient(135deg, #f093fb, #f5576c)',
    apps: ['sorting'],
    permissions: {
      canAddItems: false,
      canDeleteItems: false,
      canExport: false,
      canManageUsers: false
    }
  },
  'dodorachelle@gmail.com': {
    uid: 'do-rachelle',
    email: 'dodorachelle@gmail.com',
    displayName: 'Do-Rachelle',
    role: 'family',
    avatar: 'D',
    color: 'linear-gradient(135deg, #4facfe, #00f2fe)',
    apps: ['sorting'],
    permissions: {
      canAddItems: false,
      canDeleteItems: false,
      canExport: false,
      canManageUsers: false
    }
  },
  'laura@herbe-george.com': {
    uid: 'laura',
    email: 'laura@herbe-george.com',
    displayName: 'Laura',
    role: 'family',
    avatar: 'L',
    color: 'linear-gradient(135deg, #43e97b, #38f9d7)',
    apps: ['sorting', 'analytics', 'admin'],
    permissions: {
      canAddItems: false,
      canDeleteItems: false,
      canExport: false,
      canManageUsers: false
    }
  }
};

// Custom hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const profile = userProfiles[firebaseUser.email];
        if (profile) {
          setUser(firebaseUser);
          setUserProfile(profile);
        } else {
          console.error('No profile found for user:', firebaseUser.email);
          setError('User profile not found');
          await signOut(auth);
        }
      } else {
        // User is signed out
        setUser(null);
        setUserProfile(null);
        setError(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
    }
  };

  const hasPermission = (permission) => {
    return userProfile?.permissions?.[permission] || false;
  };

  const hasAccess = (appId) => {
    return userProfile?.apps?.includes(appId) || false;
  };

  const value = {
    user,
    userProfile,
    isLoading,
    error,
    login,
    logout,
    hasPermission,
    hasAccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}