import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Firebase configuration (using your existing config)
const firebaseConfig = {
  apiKey: "AIzaSyAS_7R16Rv9FR3kfhtgGFaL5Rjz7LIN2Yc",
  authDomain: "family-item-sorter.firebaseapp.com",
  projectId: "family-item-sorter",
  storageBucket: "family-item-sorter.firebasestorage.app",
  messagingSenderId: "287365849681",
  appId: "1:287365849681:web:b7bd0a8beb185e128c0e70"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Create the context
const AuthContext = createContext(null);

// User profiles - these would eventually be in Firestore
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
  'celestin@herbe-george.com': {
    uid: 'celestin',
    email: 'celestin@herbe-george.com',
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
  'do-rachelle@herbe-george.com': {
    uid: 'do-rachelle',
    email: 'do-rachelle@herbe-george.com',
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
    apps: ['sorting'],
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

  const login = async (email) => {
    try {
      setError(null);
      setIsLoading(true);
      
      // For testing, we'll use a dummy password
      // In production, you'd implement proper password authentication
      const dummyPassword = 'password123';
      
      const userCredential = await signInWithEmailAndPassword(auth, email, dummyPassword);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Login error:', error);
      
      // For development, create the user if they don't exist
      if (error.code === 'auth/user-not-found' && userProfiles[email]) {
        try {
          // In a real app, you'd create the user properly
          // For now, we'll just set the profile directly
          const profile = userProfiles[email];
          setUserProfile(profile);
          setUser({ email, uid: profile.uid });
          return { success: true };
        } catch (createError) {
          setError('Failed to create user account');
          return { success: false, error: createError.message };
        }
      }
      
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