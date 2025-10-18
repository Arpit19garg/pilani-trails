import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up with email and password
  const signup = async (email, password, displayName) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    return result;
  };

  // Login with email and password
  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

  // Sign in with Google
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  // Logout
  const logout = () => signOut(auth);

  // Watch for auth state changes and merge role data from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          console.log('[AuthContext] user signed in:', user.email, 'uid:', user.uid);
          const userRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userRef);
          const userData = snap && snap.exists() ? snap.data() : {};
          console.log('[AuthContext] userData from Firestore:', userData);

          // Merge role/flags from Firestore into the user object
          setCurrentUser({ ...user, ...userData });
        } catch (err) {
          console.error('[AuthContext] Error loading user data from Firestore:', err);
          setCurrentUser(user);
        }
      } else {
        console.log('[AuthContext] no user logged in');
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    signInWithGoogle,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
