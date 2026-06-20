"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Menu, X, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Our Services', href: '/services' },
    { name: 'Login', href: '/auth' },
  ];

  const visibleLinks = navLinks.filter(link => {
    if (link.href === '/' && pathname === '/') return false;
    if (link.href === '/auth' && pathname === '/auth') return false;
    if (link.href === '/services' && pathname === '/services') return false;
    return true;
  });

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
          <div className="flex items-center gap-8 px-6 py-2 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
            {visibleLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={cn(
                  "text-sm font-bold uppercase tracking-widest transition-colors antialiased",
                  link.name === 'Login' ? "text-primary hover:text-primary/80" : "text-foreground hover:text-primary"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <Button asChild className="h-12 px-8 rounded-xl font-bold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-95">
            <Link href="/auth?signup=true">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Nav Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <Button asChild size="sm" className="h-9 px-4 rounded-lg font-bold bg-primary text-xs">
            <Link href="/auth?signup=true">Get Started</Link>
          </Button>
          <MobileMenu visibleLinks={visibleLinks} />
        </div>
      </div>
    </nav>
  );
}

function MobileMenu({ visibleLinks }: { visibleLinks: any[] }) {
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
      <SheetContent side="right" className="w-[85%] sm:max-w-[380px] bg-background border-l border-border p-0 flex flex-col overflow-hidden z-[150]">
        <SheetHeader className="p-8 text-left relative bg-gradient-to-br from-primary via-primary to-[#20603D] text-white overflow-hidden border-b-4 border-accent">
          {/* Subtle Rwanda Color Accents */}
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
        
        <div className="flex flex-grow flex-col gap-6 p-8">
          {visibleLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              onClick={() => setOpen(false)}
              className={cn(
                "text-3xl font-headline font-extrabold tracking-tight transition-all hover:translate-x-2 active:scale-95 antialiased",
                link.name === 'Login' ? "text-primary" : "text-foreground/90"
              )}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="mt-8 pt-8 border-t border-border">
            <Button asChild className="w-full h-14 rounded-xl font-bold shadow-2xl shadow-primary/30 bg-primary text-white text-lg">
              <Link href="/auth?signup=true" onClick={() => setOpen(false)}>
                Get Started
              </Link>
            </Button>
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