
// src/context/auth-context.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { Leaf } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isGuest: boolean;
  setIsGuest: (isGuest: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  isGuest: false,
  setIsGuest: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuestState] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check for guest status in sessionStorage on initial load
    const guestStatus = sessionStorage.getItem('isGuest') === 'true';
    if (guestStatus) {
        setIsGuestState(true);
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // If user logs in, they are no longer a guest
        sessionStorage.removeItem('isGuest');
        setIsGuestState(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    // This effect handles redirection logic for protected routes.
    // It runs after the initial auth state has been determined.
    if (!loading && !user && !isGuest && pathname !== '/auth/signin') {
      router.push('/auth/signin');
    }
  }, [loading, user, isGuest, pathname, router]);

  const setIsGuest = (isGuest: boolean) => {
    sessionStorage.setItem('isGuest', 'true');
    setIsGuestState(isGuest);
  };

  const signOut = async () => {
    try {
      sessionStorage.removeItem('isGuest');
      setIsGuestState(false);
      await firebaseSignOut(auth);
      // The onAuthStateChanged listener and the useEffect above will handle the redirect.
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };
  
  const value = { user, loading, signOut, isGuest, setIsGuest };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Leaf className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If a redirect is needed, the effect will handle it. We return null to avoid rendering children during the redirect flicker.
  if (!loading && !user && !isGuest && pathname !== '/auth/signin') {
    return null; 
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
