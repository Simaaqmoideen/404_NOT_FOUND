import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import {
  mockLogin, mockAdminLogin, mockRegister, mockLogout, mockGetCurrentUser, mockGoogleLogin
} from '../services/mockData';
import { auth, googleProvider } from '../services/firebase';
import { signInWithPopup } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (residentId: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  adminLogin: (email: string, password: string) => Promise<User>;
  register: (data: { name: string; email: string; location: string; binId: string }) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => { throw new Error('Not initialized'); },
  loginWithGoogle: async () => { throw new Error('Not initialized'); },
  adminLogin: async () => { throw new Error('Not initialized'); },
  register: async () => { throw new Error('Not initialized'); },
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = mockGetCurrentUser();
    setUser(stored);
    setLoading(false);
  }, []);

  const login = async (residentId: string) => {
    const u = await mockLogin(residentId);
    setUser(u);
    return u;
  };

  const loginWithGoogle = async () => {
    const isMock = import.meta.env.VITE_USE_MOCK === 'true';
    if (isMock) {
      // Mock flow
      const u = await mockGoogleLogin('Google Demo User', 'demo@gmail.com');
      setUser(u);
      return u;
    } else {
      // Live Firebase flow
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const fbUser = result.user;
        // Map firebase user to our DB user
        // Note: In a real app, we would check if they exist in Firestore first
        // For this demo, we use mockGoogleLogin to register them in our local state
        const u = await mockGoogleLogin(fbUser.displayName || 'Google User', fbUser.email || '');
        setUser(u);
        return u;
      } catch (err: any) {
        throw new Error(err.message || 'Google Sign In failed');
      }
    }
  };

  const adminLogin = async (email: string, password: string) => {
    const u = await mockAdminLogin(email, password);
    setUser(u);
    return u;
  };

  const register = async (data: { name: string; email: string; location: string; binId: string }) => {
    const u = await mockRegister(data);
    setUser(u);
    return u;
  };

  const logout = () => {
    mockLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, adminLogin, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
