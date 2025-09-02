
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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  isGuest: false,
  userId: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuestState] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
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
        setIsGuestState(false);
        setUserId(null);
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // If user logs in, they are no longer a guest
        localStorage.removeItem('isGuest');
        localStorage.removeItem('guestId'); // Clear guest ID on login
        setIsGuestState(false);
        setUserId(currentUser.uid);
      } else if (!localStorage.getItem('isGuest')) {
        // Only if not a guest, clear the user state
        setIsGuestState(false);
        setUserId(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname]); // Rerun on path change to catch client-side navigations

  useEffect(() => {
    // This effect handles redirection logic for protected routes.
    // It runs after the initial auth state has been determined.
    if (!loading) {
      const isAuthPage = pathname === '/auth/signin';
      const isAuthenticated = !!user || isGuest;

      if (!isAuthenticated && !isAuthPage) {
        router.push('/auth/signin');
      } else if (isAuthenticated && isAuthPage) {
        router.push('/');
      }
    }
  }, [loading, user, isGuest, pathname, router]);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // Clear all local auth state
      localStorage.removeItem('isGuest');
      localStorage.removeItem('guestId');
      setIsGuestState(false);
      setUserId(null);
      setUser(null);
      // The onAuthStateChanged listener and the useEffect above will handle the redirect.
      router.push('/auth/signin');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const value = { user, loading, signOut, isGuest, userId };

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
