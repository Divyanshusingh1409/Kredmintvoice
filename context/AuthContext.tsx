import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { auth } from '../firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fallback for demo if Firebase is not configured properly
  const isMockMode = !auth || !auth.app?.options?.apiKey || auth.app.options.apiKey === "YOUR_API_KEY_HERE";

  const signup = async (email: string, password: string) => {
    if (isMockMode) {
        // Mock signup
        console.log("Mock Signup", email);
        const mockUser: any = { uid: "mock-uid", email };
        setCurrentUser(mockUser);
        localStorage.setItem('mockUser', JSON.stringify(mockUser));
        return;
    }
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const login = async (email: string, password: string) => {
    if (isMockMode) {
        // Mock login
        console.log("Mock Login", email);
        const mockUser: any = { uid: "mock-uid", email };
        setCurrentUser(mockUser);
        localStorage.setItem('mockUser', JSON.stringify(mockUser));
        return;
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    if (isMockMode) {
        setCurrentUser(null);
        localStorage.removeItem('mockUser');
        return;
    }
    await signOut(auth);
  };

  useEffect(() => {
    if (isMockMode) {
        const stored = localStorage.getItem('mockUser');
        if (stored) {
            setCurrentUser(JSON.parse(stored));
        }
        setLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, [isMockMode]);

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
