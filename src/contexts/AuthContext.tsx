import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  onAuthStateChanged, 
  signOut, 
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  businessName?: string;
  role: 'user' | 'superadmin';
  status: 'active' | 'suspended' | 'pending';
  plan?: 'trial' | 'pro' | 'lifetime';
  planName?: string;
  createdAt?: string;
  planEnd?: string;
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser({ uid: user.uid, email: user.email || '' });
        
        // Fetch profile from Firestore
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        } else {
          // If profile doesn't exist, create a default one
          const newProfile: UserProfile = {
            id: user.uid,
            email: user.email || '',
            name: user.displayName || 'User',
            role: 'user',
            status: 'active',
            plan: 'trial',
            createdAt: new Date().toISOString()
          };
          await setDoc(docRef, newProfile);
          setUserProfile(newProfile);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser || !userProfile) return;
    
    const updatedProfile = { ...userProfile, ...data };
    setUserProfile(updatedProfile);
    
    const docRef = doc(db, 'users', currentUser.uid);
    await setDoc(docRef, updatedProfile, { merge: true });
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
