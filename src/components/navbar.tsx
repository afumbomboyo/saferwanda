"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
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

  const visibleLinks = navLinks.filter(link => link.href !== pathname);

  return (
    <nav className={cn(
      "fixed top-0 w-full z-[100] transition-all duration-300",
      isScrolled 
        ? "py-3 bg-background/80 backdrop-blur-2xl border-b border-white/5 shadow-2xl" 
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
        <SheetHeader className="p-8 text-left border-b border-border">
          <SheetTitle className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-headline font-extrabold tracking-tighter">SafeRwanda</span>
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col gap-6 p-8">
          {visibleLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              onClick={() => setOpen(false)}
              className={cn(
                "text-2xl font-headline font-extrabold tracking-tight transition-colors",
                link.name === 'Login' ? "text-primary hover:text-primary/80" : "text-foreground hover:text-primary"
              )}
            >
              {link.name}
            </Link>
          ))}
          
          {showGetStarted && (
            <div className="pt-4">
              <Button asChild className="w-full h-12 rounded-xl font-bold shadow-xl shadow-primary/20 bg-primary">
                <Link href="/auth?signup=true" onClick={() => setOpen(false)}>
                  Get Started
                </Link>
              </Button>
            </div>
          )}
        </div>
        
        <div className="mt-auto p-8 border-t border-border bg-muted/20">
           <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mb-1">
            SafeRwanda IoT Labs
          </div>
          <div className="text-[9px] text-muted-foreground/60 leading-relaxed font-medium">
            Next-Gen Security Infrastructure <br /> for Kigali Communities.
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
