import Image from 'next/image';
import Link from 'next/link';
import {ArrowRight, ShieldCheck, Lock, Users, Zap} from 'lucide-react';
import Navbar from '@/components/navbar';
import {Button} from '@/components/ui/button';
import {PlaceHolderImages} from '@/app/lib/placeholder-images';

export default function Home() {
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-security');

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[85vh] md:min-h-[80vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            {heroImg && (
              <Image
                src={heroImg.imageUrl}
                alt={heroImg.description}
                fill
                className="object-cover opacity-30 scale-105"
                priority
                data-ai-hint={heroImg.imageHint}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>

          <div className="container mx-auto px-4 z-10">
            <div className="max-w-3xl animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-accent text-xs font-semibold uppercase tracking-wider mb-6">
                <Zap className="w-3 h-3" />
                Intelligence-Driven Safety
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-headline font-extrabold mb-6 leading-[1.1]">
                Empowering <span className="text-primary">Security</span>, Ensuring <span className="text-accent">Peace of Mind</span>.
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl">
                SafeRwanda combines cutting-edge AI technology with specialized protection services to create a unified ecosystem of safety for families, properties, and communities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-primary text-white hover:bg-primary/90 h-14 px-8 text-base">
                  <Link href="/auth?signup=true">Get Started Today</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-border hover:bg-white/5 h-14 px-8 text-base">
                  <Link href="/services">Explore Our Services</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-16 md:py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-headline font-bold mb-6">Our Mission</h2>
                <p className="text-base lg:text-lg text-muted-foreground mb-6 leading-relaxed">
                  We believe that safety is the foundation of progress. SafeRwanda was born from a vision to integrate intelligence into everyday protection, moving from reactive security to proactive, smart safety.
                </p>
                <ul className="grid sm:grid-cols-2 lg:grid-cols-1 gap-4">
                  {[
                    "Uncompromising reliability in every service.",
                    "AI-driven insights for smarter protection.",
                    "Community-first security integration.",
                    "Expert care for the most vulnerable."
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm font-medium">
                      <ShieldCheck className="w-5 h-5 text-accent shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-center text-center shadow-sm">
                  <div className="text-3xl md:text-4xl font-headline font-bold text-primary mb-1">24/7</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Protection</div>
                </div>
                <div className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-center text-center shadow-sm">
                  <div className="text-3xl md:text-4xl font-headline font-bold text-accent mb-1">100%</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Reliability</div>
                </div>
                <div className="bg-card border border-border p-8 rounded-2xl flex flex-col justify-center text-center col-span-2 shadow-sm">
                  <div className="text-2xl md:text-3xl lg:text-4xl font-headline font-bold text-foreground mb-1">Smart Safe</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest">AI Concierge Integration</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Preview */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-headline font-bold mb-4">Why SafeRwanda?</h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
                Discover why thousands trust our technology-first approach to safety.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[
                {
                  icon: <Lock className="w-10 h-10 text-primary" />,
                  title: "Advanced Security",
                  desc: "Military-grade encryption and physical security protocols protecting your assets."
                },
                {
                  icon: <Users className="w-10 h-10 text-accent" />,
                  title: "Community Surveillance",
                  desc: "Connecting neighbors through smart technology to create collective safety zones."
                },
                {
                  icon: <ShieldCheck className="w-10 h-10 text-primary" />,
                  title: "Vulnerable Care",
                  desc: "Specialized monitoring for children and elderly, providing care when it matters most."
                }
              ].map((feature, idx) => (
                <div key={idx} className="bg-card border border-border p-8 rounded-2xl hover:border-primary/50 transition-all group shadow-sm">
                  <div className="mb-6 group-hover:scale-110 transition-transform">{feature.icon}</div>
                  <h3 className="text-xl font-headline font-bold mb-3">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20 bg-primary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-headline font-bold mb-6 text-white">Ready for a Safer Tomorrow?</h2>
            <p className="text-primary-foreground/80 text-base md:text-lg mb-10 max-w-2xl mx-auto">
              Join the SafeRwanda community today and leverage our AI Concierge to find the perfect protection plan for your needs.
            </p>
            <div className="flex justify-center">
              <Button asChild size="lg" variant="secondary" className="h-14 px-10 text-base font-bold text-primary w-full sm:w-auto shadow-xl">
                <Link href="/concierge" className="flex items-center gap-2 justify-center">
                  Consult our AI Concierge <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-border bg-background">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <span className="font-headline font-bold">SafeRwanda</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SafeRwanda. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
