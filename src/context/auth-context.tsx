
// src/context/auth-context.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { Leaf } from 'lucide-react';

// Function to generate a simple random ID for guests
const generateGuestId = () => {
    return 'guest_' + Math.random().toString(36).substring(2, 15);
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isGuest: boolean;
  userId: string | null; // Unified ID for both logged-in users and guests
  setGuest: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  isGuest: false,
  userId: null,
  setGuest: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuestState] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // If user logs in, they are no longer a guest
        localStorage.removeItem('isGuest');
        localStorage.removeItem('guestId'); // Clear guest ID on login
        setIsGuestState(false);
        setUserId(currentUser.uid);
      } else {
        // Check for guest status only if there's no active user
        const guestStatus = localStorage.getItem('isGuest') === 'true';
        if (guestStatus) {
            setIsGuestState(true);
            let guestId = localStorage.getItem('guestId');
            if (!guestId) {
                guestId = generateGuestId();
                localStorage.setItem('guestId', guestId);
            }
            setUserId(guestId);
        } else {
            // Not a logged-in user and not a guest
            setIsGuestState(false);
            setUserId(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // This effect should run only once

  useEffect(() => {
    // This effect handles redirection logic.
    if (!loading) {
      const isAuthPage = pathname === '/auth/signin';
      const isAuthenticated = !!user || isGuest;

      if (!isAuthenticated && !isAuthPage) {
        router.push('/auth/signin');
      }
      // Only redirect away from signin page if they are a logged-in user, not a guest
      else if (user && isAuthPage) {
        router.push('/');
      }
    }
  }, [loading, user, isGuest, pathname, router]);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // Clear all local auth state and application state
      localStorage.removeItem('isGuest');
      localStorage.removeItem('guestId');
      setIsGuestState(false);
      setUserId(null);
      setUser(null);
      router.push('/auth/signin');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const setGuest = () => {
    localStorage.setItem('isGuest', 'true');
    let guestId = localStorage.getItem('guestId');
    if (!guestId) {
        guestId = generateGuestId();
        localStorage.setItem('guestId', guestId);
    }
    setIsGuestState(true);
    setUserId(guestId);
    setUser(null); // Ensure no stale user object
  };

  const value = { user, loading, signOut, isGuest, userId, setGuest };

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
