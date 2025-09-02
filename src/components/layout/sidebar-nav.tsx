
'use client';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Leaf,
  History,
  Settings,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Logo } from '../logo';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analysis-history', label: 'Analysis History', icon: History },
  { href: '/profile', label: 'Profile', icon: UserIcon },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user, isGuest, signOut } = useAuth();

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return names[0][0];
  };

  return (
    <>
      <SidebarHeader className="p-4">
        <div className="flex flex-col items-center gap-2">
            <Logo className="w-24 h-24" />
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              HARITRAKSHAK
            </h2>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                className="justify-start"
                disabled={(item.href === '/profile') && isGuest}
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        {user ? (
          <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
              <AvatarFallback>{user.displayName ? getInitials(user.displayName) : 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate">{user.displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <SidebarMenuButton variant="ghost" size="icon" className="h-8 w-8" onClick={signOut}>
                <LogOut />
            </SidebarMenuButton>
          </div>
        ) : isGuest ? (
          <div className="flex flex-col items-center text-center gap-2 p-4 rounded-lg bg-muted/50">
             <Avatar className="h-12 w-12">
              <AvatarFallback><UserIcon /></AvatarFallback>
            </Avatar>
             <p className="text-sm font-semibold">Guest Mode</p>
             <p className="text-xs text-muted-foreground">Your history is saved on this device.</p>
             <Link href="/auth/signin" className='w-full'>
              <Button className="w-full" size="sm">Sign In to Sync</Button>
             </Link>
          </div>
        ) : null}
      </SidebarFooter>
    </>
  );
}
