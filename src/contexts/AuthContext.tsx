import React, { createContext, useContext, useEffect, useState } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'user' | 'superadmin';
  status: 'active' | 'suspended' | 'pending';
  plan?: 'trial' | 'pro' | 'lifetime';
  planName?: string;
  createdAt?: string;
}

interface AuthContextType {
  currentUser: { uid: string, email: string } | null;
  userProfile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<{ uid: string, email: string } | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for a saved user
    const savedUser = localStorage.getItem('uniflow_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser({ uid: parsed.id, email: parsed.email });
        setUserProfile(parsed);
      } catch (e) {
        localStorage.removeItem('uniflow_user');
      }
    }
    setLoading(false);
  }, []);

  const logout = async () => {
    localStorage.removeItem('uniflow_user');
    setCurrentUser(null);
    setUserProfile(null);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!userProfile) return;
    const updatedProfile = { ...userProfile, ...data };
    setUserProfile(updatedProfile);
    localStorage.setItem('uniflow_user', JSON.stringify(updatedProfile));
    
    // Simpan ke database lokal agar persisten saat re-login
    const dbStr = localStorage.getItem('uniflow_users_db');
    const db = dbStr ? JSON.parse(dbStr) : {};
    db[updatedProfile.email] = updatedProfile;
    localStorage.setItem('uniflow_users_db', JSON.stringify(db));
  };

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading, logout, updateProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

