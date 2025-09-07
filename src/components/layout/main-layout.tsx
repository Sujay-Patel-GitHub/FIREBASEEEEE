
'use client';
import type { ReactNode } from 'react';
import * as React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import { Header } from './header';
import { useAuth } from '@/context/auth-context';
import { usePathname } from 'next/navigation';
import { LanguageSelector } from '../language-selector';


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
  
  // This is a bit of a workaround to pass props from page to layout
  // A cleaner way might involve a separate context
  let onAnalyzeClick: (() => void) | undefined = undefined;
  let isAnalyzing: boolean | undefined = undefined;
  if (pathname === '/' && React.isValidElement(children) && (children.props.children as React.ReactElement)?.type?.name === 'DashboardClient') {
    const dashboardClient = children.props.children as React.ReactElement;
    const { fileInputRef, isAnalyzing: analyzingState } = dashboardClient.props;
    onAnalyzeClick = () => fileInputRef.current?.click();
    isAnalyzing = analyzingState;
  }
  
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNav />
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <Header onAnalyzeClick={onAnalyzeClick} isAnalyzing={isAnalyzing} />
          <main className="flex-1 p-4 lg:p-6">
            <div className="container mx-auto">
              {children}
            </div>
          </main>
        </div>
        <LanguageSelector />
      </SidebarInset>
    </SidebarProvider>
  );
}
