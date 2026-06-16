"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'Login', href: '/auth' },
  ];

  const visibleLinks = navLinks.filter(link => link.href !== pathname);

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Shield className="w-8 h-8 text-primary group-hover:text-accent transition-colors" />
          <span className="text-xl font-headline font-bold tracking-tight">SafeRwanda</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {visibleLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <Button asChild variant="default" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            <Link href="/auth?signup=true">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background border-border">
              <div className="flex flex-col gap-6 mt-12">
                {visibleLinks.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    className="text-lg font-medium hover:text-primary"
                  >
                    {link.name}
                  </Link>
                ))}
                <Button asChild className="w-full bg-primary hover:bg-primary/90 shadow-lg">
                  <Link href="/auth?signup=true">Get Started</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
