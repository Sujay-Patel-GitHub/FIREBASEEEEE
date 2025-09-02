
'use client';

import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Leaf } from 'lucide-react';
import Image from 'next/image';

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
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
      router.push('/');
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error("Error signing in with Google: ", error);
      }
    }
  };

  const continueAsGuest = () => {
    localStorage.setItem('isGuest', 'true');
    router.push('/');
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0D1B2A] text-white">
      <div className="absolute inset-0 z-0 opacity-20">
        {/* You can replace this with a more dynamic background component if needed */}
        <div className="neural-network-bg"></div>
      </div>
      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <div className="hidden lg:flex flex-col items-center justify-center p-12">
           <Image
                src="https://picsum.photos/800/1200"
                alt="Lush green leaves"
                width={800}
                height={1200}
                className="rounded-2xl object-cover h-full w-full shadow-2xl"
                data-ai-hint="leaf plant"
            />
        </div>
        <div className="flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-sm">
            <div className="text-center lg:text-left mb-10">
              <div className="inline-flex items-center gap-3 mb-4">
                <Leaf className="h-8 w-8 text-[#A7F3D0]" />
                <h1 className="text-3xl font-bold tracking-tighter text-white">
                  HARITRAKSHAK
                </h1>
              </div>
              <p className="text-lg text-gray-300">
                Intelligent insights for a greener tomorrow.
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={signInWithGoogle}
                className="w-full h-12 text-base font-semibold bg-white text-gray-800 hover:bg-gray-200"
                size="lg"
              >
                <GoogleIcon />
                <span className="ml-3">Sign in with Google</span>
              </Button>

              <div className="flex items-center text-xs text-gray-400 uppercase">
                  <div className="flex-1 border-t border-gray-600"></div>
                  <span className="px-4">Or</span>
                  <div className="flex-1 border-t border-gray-600"></div>
              </div>

              <Button
                onClick={continueAsGuest}
                className="w-full h-12 text-base font-semibold bg-gray-700 text-white hover:bg-gray-600"
                variant="secondary"
                size="lg"
              >
                Continue as Guest
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
