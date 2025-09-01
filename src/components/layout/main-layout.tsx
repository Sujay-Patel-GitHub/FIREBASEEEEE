
'use client';
import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import { Header } from './header';
import { useAuth } from '@/context/auth-context';
import { usePathname } from 'next/navigation';


export function MainLayout({ children }: { children: ReactNode }) {
  const { user, isGuest } = useAuth();
  const pathname = usePathname();

  // The sign-in page should not have the main layout
  if (pathname === '/auth/signin') {
      return <>{children}</>;
  }

  // If user is not authenticated and not a guest, AuthProvider will handle redirect.
  // We can render a minimal layout or null while waiting for redirect.
  if (!user && !isGuest) {
    return null;
  }
  
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNav />
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
