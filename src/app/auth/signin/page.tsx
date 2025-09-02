
// src/app/auth/signin/page.tsx
'use client';

import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export default function SignInPage() {
  const router = useRouter();


  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Use router.push for a client-side navigation
      router.push('/');
    } catch (error: any) {
      // The 'auth/popup-closed-by-user' error is expected if the user closes the popup.
      // We can safely ignore it and don't need to show an error message.
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error("Error signing in with Google: ", error);
      }
    }
  };

  const continueAsGuest = () => {
    localStorage.setItem('isGuest', 'true');
    // Use router.push to navigate client-side, which is faster
    // and avoids a full page reload, allowing the AuthContext to update smoothly.
    router.push('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Leaf className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome to LeafWise AI</CardTitle>
            <CardDescription>Sign in to save your analysis history</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={signInWithGoogle}
              className="w-full"
            >
              <GoogleIcon />
              <span className="ml-2">Sign in with Google</span>
            </Button>
            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 -translate-x-1/2 top-[-10px] bg-card px-2 text-sm text-muted-foreground">OR</span>
            </div>
            <Button
              onClick={continueAsGuest}
              className="w-full"
              variant="secondary"
            >
              Continue as Guest
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
