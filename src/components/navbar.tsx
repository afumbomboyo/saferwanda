import Link from 'next/link';
import {Shield, Menu} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Shield className="w-8 h-8 text-primary group-hover:text-accent transition-colors" />
          <span className="text-xl font-headline font-bold tracking-tight">SafeRwanda</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/services" className="text-sm font-medium hover:text-primary transition-colors">Services</Link>
          <Link href="/auth" className="text-sm font-medium hover:text-primary transition-colors">Login</Link>
          <Button asChild variant="default" className="bg-primary hover:bg-primary/90">
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
                <Link href="/services" className="text-lg font-medium hover:text-primary">Services</Link>
                <Link href="/auth" className="text-lg font-medium hover:text-primary">Login</Link>
                <Button asChild className="w-full bg-accent hover:bg-accent/90">
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