"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setIsOpen(true)} 
        className="h-10 w-10 rounded-xl bg-white/5 border border-white/5"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Side Menu Content */}
          <div className="relative w-[80%] max-w-[300px] h-full bg-background border-l border-border shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col overflow-hidden">
            <div className="p-6 flex justify-end">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)} 
                className="h-10 w-10 rounded-xl"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex flex-col gap-6 px-8 py-4">
              {visibleLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  onClick={() => setIsOpen(false)}
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
                    <Link href="/auth?signup=true" onClick={() => setIsOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </div>
              )}
            </div>
            
            <div className="mt-auto p-8 text-[10px] text-muted-foreground uppercase tracking-widest font-medium border-t border-border bg-muted/20">
              SafeRwanda IoT Labs
            </div>
          </div>
        </div>
      )}
    </>
  );
}