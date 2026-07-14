
"use client"

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldCheck, Menu, X, User, LogOut, LayoutDashboard, ChevronDown, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useUser, useAuth, useFirestore, useDoc } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activePath, setActivePath] = useState<string | null>(null);

  // Fetch profile to check isAdmin
  const profileRef = useMemo(() => (user && db ? doc(db, 'users', user.uid) : null), [user, db]);
  const { data: profile } = useDoc(profileRef);

  useEffect(() => {
    setActivePath(pathname);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Our Services', href: '/services' },
  ];

  const isAdmin = !!(user && profile?.isAdmin);

  return (
    <nav className={cn(
      "fixed top-0 w-full z-[100] transition-all duration-500 ease-in-out",
      isScrolled 
        ? "py-3 bg-background/90 backdrop-blur-xl border-b border-border shadow-lg" 
        : "py-6 bg-transparent"
    )}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-headline font-extrabold tracking-tighter antialiased">SafeRwanda</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          <div className="flex items-center gap-8 px-8 py-2 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
            {navLinks.map((link) => {
              const isActive = activePath === link.href;
              return (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={cn(
                    "text-sm font-bold uppercase tracking-widest transition-colors antialiased",
                    isActive ? "text-primary" : "text-foreground hover:text-primary"
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
            {!loading && !user && (
              <Link 
                href="/auth" 
                className={cn(
                  "text-sm font-bold uppercase tracking-widest transition-colors antialiased",
                  activePath === '/auth' ? "text-primary" : "text-foreground hover:text-primary"
                )}
              >
                Login
              </Link>
            )}
            {isAdmin && (
              <Link 
                href="/admin" 
                className={cn(
                  "text-sm font-bold uppercase tracking-widest transition-colors antialiased text-destructive",
                  activePath === '/admin' ? "opacity-100" : "opacity-70 hover:opacity-100"
                )}
              >
                Admin
              </Link>
            )}
          </div>

          {!loading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-12 flex items-center gap-3 px-2 rounded-xl hover:bg-white/10">
                      <Avatar className="h-9 w-9 border-2 border-primary/20">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {(user.displayName || "U").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start text-left">
                        <span className="text-xs font-bold leading-none">{user.displayName || 'Agent'}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {profile?.isAdmin ? 'Global Admin' : 'Node Operator'}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 mt-2 rounded-2xl p-2 bg-card/95 backdrop-blur-xl border-white/10" align="end">
                    <DropdownMenuLabel className="px-3 py-3">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-bold leading-none">{user.displayName || 'Security Agent'}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/5" />
                    {isAdmin && (
                      <DropdownMenuItem asChild className="rounded-xl py-3 cursor-pointer text-destructive">
                        <Link href="/admin" className="flex items-center">
                          <ShieldAlert className="mr-2 h-4 w-4" />
                          <span>Admin Panel</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild className="rounded-xl py-3 cursor-pointer">
                      <Link href="/dashboard" className="flex items-center">
                        <LayoutDashboard className="mr-2 h-4 w-4 text-primary" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem className="rounded-xl py-3 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild className="h-12 px-8 rounded-xl font-bold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-95">
                  <Link href="/services">Get Started</Link>
                </Button>
              )}
            </>
          )}
        </div>

        {/* Mobile Nav Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <MobileMenu navLinks={navLinks} activePath={activePath} user={user} handleLogout={handleLogout} profile={profile} isAdmin={isAdmin} />
        </div>
      </div>
    </nav>
  );
}

function MobileMenu({ navLinks, activePath, user, handleLogout, profile, isAdmin }: { navLinks: any[], activePath: string | null, user: any, handleLogout: () => void, profile: any, isAdmin: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[85%] sm:max-w-[380px] bg-background border-l border-border p-0 flex flex-col overflow-hidden z-[200]">
        <SheetHeader className="p-8 text-left relative bg-gradient-to-br from-primary via-primary to-[#20603D] text-white overflow-hidden border-b-4 border-accent">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl -mr-16 -mt-16" />
          <SheetTitle className="flex items-center gap-3 text-white relative z-10">
             <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-headline font-extrabold tracking-tighter">SafeRwanda</span>
          </SheetTitle>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 mt-3 relative z-10">
            Strategic Security Infrastructure
          </p>
        </SheetHeader>
        
        <div className="flex flex-grow flex-col gap-4 p-8">
          {user && (
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 border border-border mb-4">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarImage src={user.photoURL} />
                <AvatarFallback>{(user.displayName || "U").charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-sm leading-none">{user.displayName || 'Agent'}</p>
                <p className="text-xs text-muted-foreground mt-1">{profile?.isAdmin ? 'Global Admin' : 'Node Operator'}</p>
              </div>
            </div>
          )}

          {navLinks.map((link) => {
            const isActive = activePath === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                onClick={() => setOpen(false)}
                className={cn(
                  "text-2xl font-headline font-extrabold tracking-tight transition-all hover:translate-x-2 active:scale-95 antialiased",
                  isActive ? "text-primary" : "text-foreground/90"
                )}
              >
                {link.name}
              </Link>
            );
          })}

          {isAdmin && (
            <Link 
              href="/admin"
              onClick={() => setOpen(false)}
              className={cn(
                "text-2xl font-headline font-extrabold tracking-tight transition-all hover:translate-x-2 active:scale-95 antialiased flex items-center gap-2 text-destructive",
                activePath === '/admin' ? "opacity-100" : "opacity-70"
              )}
            >
              <ShieldAlert className="w-6 h-6" />
              Admin Panel
            </Link>
          )}

          {user && (
            <Link 
              href="/dashboard"
              onClick={() => setOpen(false)}
              className={cn(
                "text-2xl font-headline font-extrabold tracking-tight transition-all hover:translate-x-2 active:scale-95 antialiased flex items-center gap-2",
                activePath === '/dashboard' ? "text-primary" : "text-foreground/90"
              )}
            >
              <LayoutDashboard className="w-6 h-6" />
              Dashboard
            </Link>
          )}
          
          {!user && (
            <Link 
              href="/auth" 
              onClick={() => setOpen(false)}
              className="text-2xl font-headline font-extrabold tracking-tight transition-all hover:translate-x-2 active:scale-95 antialiased"
            >
              Login
            </Link>
          )}
          
          <div className="mt-8 pt-8 border-t border-border">
            {user ? (
              <Button 
                variant="destructive"
                className="w-full h-14 rounded-xl font-bold shadow-2xl text-lg flex items-center gap-2"
                onClick={() => {
                  handleLogout();
                  setOpen(false);
                }}
              >
                <LogOut className="w-5 h-5" />
                Log Out
              </Button>
            ) : (
              <Button asChild className="w-full h-14 rounded-xl font-bold shadow-2xl shadow-primary/30 bg-primary text-white text-lg">
                <Link href="/services" onClick={() => setOpen(false)}>
                  Get Started
                </Link>
              </Button>
            )}
          </div>
        </div>
        
        <div className="mt-auto p-8 bg-secondary/20 border-t border-border">
           <div className="flex items-center gap-3 mb-4">
             <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse shadow-[0_0_10px_rgba(250,210,1,0.8)]" />
             <span className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black">Active Deployment Node</span>
           </div>
           <div className="text-[10px] text-muted-foreground/70 leading-relaxed font-semibold">
            Next-Gen IoT Systems <br /> 
            <span className="text-[#20603D] font-bold">Secure by Design • Built for Rwanda</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
