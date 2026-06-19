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
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'Login', href: '/auth' },
  ];

  // Logic: Hide Home link if on home page, hide Login if on auth page, etc.
  const visibleLinks = navLinks.filter(link => {
    if (link.href === '/' && pathname === '/') return false;
    if (link.href === '/auth' && pathname === '/auth') return false;
    return true;
  });

  return (
    <nav className={cn(
      "fixed top-0 w-full z-[100] transition-all duration-300",
      isScrolled 
        ? "py-3 bg-background/80 backdrop-blur-2xl border-b border-border shadow-2xl" 
        : "py-6 bg-transparent"
    )}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-headline font-extrabold tracking-tighter">SafeRwanda</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          <div className="flex items-center gap-8 px-6 py-2 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
            {visibleLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={cn(
                  "text-sm font-bold uppercase tracking-widest transition-colors",
                  link.name === 'Login' ? "text-primary hover:text-primary/80" : "text-foreground hover:text-primary"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
          {isScrolled && (
            <Button asChild className="h-12 px-8 rounded-xl font-bold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 animate-fade-in">
              <Link href="/auth?signup=true">Get Started</Link>
            </Button>
          )}
        </div>

        {/* Mobile Nav Toggle */}
        <div className="md:hidden">
          <MobileMenu visibleLinks={visibleLinks} showGetStarted={isScrolled} />
        </div>
      </div>
    </nav>
  );
}

function MobileMenu({ visibleLinks, showGetStarted }: { visibleLinks: any[], showGetStarted: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 rounded-xl bg-white/5 border border-white/5"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[85%] sm:max-w-[350px] bg-background border-l border-border p-0 flex flex-col">
        <SheetHeader className="p-8 text-left bg-gradient-to-br from-primary via-primary to-[#0077A3] text-white">
          <SheetTitle className="flex items-center gap-3 text-white">
             <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-headline font-extrabold tracking-tighter">SafeRwanda</span>
          </SheetTitle>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mt-2">Strategic Protection Unit</p>
        </SheetHeader>
        
        <div className="flex flex-grow flex-col gap-8 p-8">
          {visibleLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              onClick={() => setOpen(false)}
              className={cn(
                "text-2xl font-headline font-extrabold tracking-tight transition-all hover:translate-x-1",
                link.name === 'Login' ? "text-primary" : "text-foreground"
              )}
            >
              {link.name}
            </Link>
          ))}
          
          {showGetStarted && (
            <div className="mt-4 pt-8 border-t border-border">
              <Button asChild className="w-full h-14 rounded-xl font-bold shadow-xl shadow-primary/20 bg-primary text-white">
                <Link href="/auth?signup=true" onClick={() => setOpen(false)}>
                  Get Started
                </Link>
              </Button>
            </div>
          )}
        </div>
        
        <div className="mt-auto p-8 border-t border-border bg-secondary/10">
           <div className="flex items-center gap-2 mb-4">
             <div className="w-3 h-3 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(250,210,1,0.6)]" />
             <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Live Deployment Node</span>
           </div>
           <div className="text-[9px] text-muted-foreground/60 leading-relaxed font-medium">
            Next-Gen Security Infrastructure <br /> 
            <span className="text-[#20603D] font-bold">Secure by Design • Built for Rwanda</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}