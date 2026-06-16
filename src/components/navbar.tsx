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
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'Concierge', href: '/concierge' },
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
                className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <Button asChild className="h-12 px-8 rounded-xl font-bold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90">
            <Link href="/auth?signup=true">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Nav Toggle */}
        <div className="md:hidden">
          <MobileMenu visibleLinks={visibleLinks} />
        </div>
      </div>
    </nav>
  );
}

function MobileMenu({ visibleLinks }: { visibleLinks: any[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} className="h-12 w-12 rounded-xl bg-white/5 border border-white/5">
        <Menu className="w-6 h-6" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-2xl animate-in fade-in slide-in-from-right duration-300">
          <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center relative">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(false)} 
              className="absolute top-6 right-4 h-12 w-12"
            >
              <X className="w-8 h-8" />
            </Button>
            
            <div className="flex flex-col gap-10 text-center">
              {visibleLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  onClick={() => setIsOpen(false)}
                  className="text-4xl font-headline font-extrabold tracking-tighter hover:text-primary"
                >
                  {link.name}
                </Link>
              ))}
              <Button asChild size="lg" className="h-16 px-12 rounded-2xl text-xl font-bold mt-6 shadow-2xl bg-primary">
                <Link href="/auth?signup=true" onClick={() => setIsOpen(false)}>Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}