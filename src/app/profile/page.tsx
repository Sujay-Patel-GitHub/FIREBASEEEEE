
'use client';

import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading, signOut, isGuest } = useAuth();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isGuest) {
    return (
       <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
         <Card>
          <CardHeader>
            <CardTitle>Guest Mode</CardTitle>
            <CardDescription>You are currently in guest mode. Sign in to create a profile.</CardDescription>
          </CardHeader>
          <CardContent>
             <Link href="/auth/signin">
                <Button>Sign In</Button>
            </Link>
          </CardContent>
         </Card>
       </div>
    )
  }

  if (!user) {
    // This should ideally not be reached if AuthProvider is working correctly
    return <p>Redirecting to sign in...</p>;
  }

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return names[0][0];
  };


  return (
    <div className="container mx-auto py-8">
       <h1 className="text-3xl font-bold mb-6">User Profile</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
              <AvatarFallback>{user.displayName ? getInitials(user.displayName) : 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user.displayName}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button onClick={signOut} variant="destructive">
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
