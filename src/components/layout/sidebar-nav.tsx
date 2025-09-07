
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
  Info,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Logo } from '../logo';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
            <SidebarMenuItem>
                <Dialog>
                    <DialogTrigger asChild>
                        <SidebarMenuButton className="justify-start w-full">
                            <Info className="h-4 w-4" />
                            <span>Developed by</span>
                        </SidebarMenuButton>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>About the Developers</DialogTitle>
                            <DialogDescription>
                                This application was designed and developed by a passionate team.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div>
                                <h3 className="font-semibold text-foreground mb-2">Mentor</h3>
                                <div className="flex items-center gap-4">
                                    <Image 
                                      src="https://i.ibb.co/zVDsF5dk/Whats-App-Image-2025-09-07-at-13-52-38-9d22302e.jpg"
                                      alt="Dr. Shriji Gandhi"
                                      width={60}
                                      height={60}
                                      className="rounded-full shrink-0"
                                      data-ai-hint="person"
                                    />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Prof of Government Polytechnic Ahmedabad</p>
                                        <p className="text-sm font-medium text-foreground">DR. SHRIJI GANDHI</p>
                                        <p className="text-xs text-muted-foreground">Instrumentation & Control</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground mb-2">Student Developers</h3>
                                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                    <li>SUJAY PATEL</li>
                                    <li>DAKSH PATEL</li>
                                    <li>JANIL MISTRY</li>
                                    <li>TUSHAR PANCHAL</li>
                                    <li>SUMUKH PATEL</li>
                                </ul>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 space-y-2">
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
