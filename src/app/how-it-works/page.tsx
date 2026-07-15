
"use client"

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  UserPlus, 
  ShoppingCart, 
  Cpu, 
  Activity, 
  Bell, 
  ShieldCheck, 
  ArrowRight,
  ChevronRight,
  Zap,
  CheckCircle2,
  Mail,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/app/lib/placeholder-images';
import { cn } from '@/lib/utils';

export default function HowItWorksPage() {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.animate-reveal');
    revealElements.forEach((el) => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      id: "step-account",
      title: "Create Your Account",
      description: "Sign up and set up your security profile. We use strong encryption to keep your private data safe.",
      icon: <UserPlus className="w-8 h-8 text-primary" />,
      image: PlaceHolderImages.find(img => img.id === 'step-account')?.imageUrl,
      color: "border-primary"
    },
    {
      id: "step-shop",
      title: "Buy or Lease Devices",
      description: "Pick the devices you need from our shop. Choose from child trackers, health monitors, or fire sensors.",
      icon: <ShoppingCart className="w-8 h-8 text-accent" />,
      image: PlaceHolderImages.find(img => img.id === 'step-shop')?.imageUrl,
      color: "border-accent"
    },
    {
      id: "step-connect",
      title: "Connect Your Device",
      description: "When your device arrives, enter its ID code into your dashboard to link it to your account.",
      icon: <Cpu className="w-8 h-8 text-rwanda-green" />,
      image: PlaceHolderImages.find(img => img.id === 'step-connect')?.imageUrl,
      color: "border-rwanda-green"
    },
    {
      id: "step-monitor",
      title: "Monitoring Dashboard",
      description: "Check your dashboard anytime to see if your devices are working and if everything is safe.",
      icon: <Activity className="w-8 h-8 text-primary" />,
      image: PlaceHolderImages.find(img => img.id === 'step-monitor')?.imageUrl,
      color: "border-primary"
    },
    {
      id: "step-alert",
      title: "Instant Alerts",
      description: "Get immediate phone or email alerts if something happens, like a fire or an emergency.",
      icon: <Bell className="w-8 h-8 text-destructive" />,
      image: PlaceHolderImages.find(img => img.id === 'step-alert')?.imageUrl,
      color: "border-destructive"
    },
    {
      id: "step-comms",
      title: "Talk to Your Devices",
      description: "Use your dashboard to make calls to your devices or listen to what's happening around them.",
      icon: <Zap className="w-8 h-8 text-accent" />,
      image: PlaceHolderImages.find(img => img.id === 'step-comms')?.imageUrl,
      color: "border-accent"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <main className="flex-grow pt-32 pb-24 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          
          <div className="text-center mb-24 animate-reveal">
            <Badge variant="outline" className="mb-4 px-3 py-1 border-primary text-primary font-bold text-xs uppercase tracking-widest bg-primary/5">
              How to Get Started
            </Badge>
            <h1 className="text-4xl md:text-6xl font-headline font-black tracking-tighter leading-tight mb-6">
              How <span className="text-gradient">SafeRwanda Works</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
              We make it easy to protect your family and home. Just follow these simple steps.
            </p>
          </div>

          <div className="space-y-32">
            {steps.map((step, idx) => (
              <div 
                key={step.id} 
                className={cn(
                  "flex flex-col gap-12 items-center animate-reveal",
                  idx % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                )}
              >
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-16 h-16 rounded-2xl bg-background border flex items-center justify-center shadow-xl", step.color)}>
                      {step.icon}
                    </div>
                    <span className="text-4xl font-black opacity-10">0{idx + 1}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight">{step.title}</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed font-light">
                    {step.description}
                  </p>
                  <div className="pt-4 flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                      <CheckCircle2 className="w-4 h-4" /> Strong Security
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-rwanda-green">
                      <CheckCircle2 className="w-4 h-4" /> Reliable Monitoring
                    </div>
                  </div>
                </div>

                <div className="flex-1 w-full">
                  <div className={cn("relative h-[300px] md:h-[450px] rounded-[3rem] overflow-hidden border-4 shadow-2xl", step.color)}>
                    {step.image && (
                      <Image 
                        src={step.image} 
                        alt={step.title} 
                        fill 
                        className="object-cover"
                        data-ai-hint={step.id.replace('step-', '')}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-8 left-8 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                        <ShieldCheck className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-white text-xs font-black uppercase tracking-widest">SafeRwanda Network</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Alerting Section */}
          <div className="mt-32 p-12 md:p-24 rounded-[4rem] bg-primary text-white relative overflow-hidden shadow-2xl animate-reveal">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px]" />
            <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <Badge variant="outline" className="mb-6 px-4 py-1.5 border-white/20 text-white font-extrabold bg-white/10 backdrop-blur-md">
                  Instant Notifications
                </Badge>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-8">Never Miss a Single Event.</h2>
                <p className="text-lg text-primary-foreground/80 mb-10 font-light leading-relaxed">
                  Our system is connected to local networks to send you alerts immediately. If something is wrong, you will be the first to know.
                </p>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-6 rounded-3xl bg-white/5 border border-white/10">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Phone Alerts</h4>
                      <p className="text-sm text-primary-foreground/60">Receive SMS messages within seconds.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-6 rounded-3xl bg-white/5 border border-white/10">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Email Alerts</h4>
                      <p className="text-sm text-primary-foreground/60">Get detailed reports by email.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl rounded-[3rem] p-10 border border-white/20">
                <div className="space-y-4 font-mono text-[10px]">
                  <div className="flex justify-between items-center text-accent">
                    <span>SYSTEM_STATUS: ACTIVE</span>
                    <span>100% WORKING</span>
                  </div>
                  <div className="h-px bg-white/10 w-full" />
                  <div className="space-y-1">
                    <p className="text-white/40">[14:32:01] System: Connected</p>
                    <p className="text-rwanda-green">[14:32:05] SENSOR: Normal Levels</p>
                    <p className="text-white/40">[14:32:10] Check: Everything is okay</p>
                    <p className="text-destructive font-bold">[14:33:45] ALERT: Something detected</p>
                    <p className="text-white">[14:33:46] SMS: Sent to your phone</p>
                    <p className="text-white">[14:33:46] EMAIL: Sent to your inbox</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-32 text-center animate-reveal">
            <h3 className="text-3xl font-black mb-8">Ready to Start?</h3>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button asChild size="lg" className="h-16 px-12 rounded-2xl text-lg font-bold shadow-2xl bg-primary hover:bg-primary/90">
                <Link href="/services">Browse Services <ChevronRight className="w-5 h-5 ml-2" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-16 px-12 rounded-2xl text-lg font-bold border-primary text-primary hover:bg-primary/5">
                <Link href="/auth">Member Login</Link>
              </Button>
            </div>
          </div>

        </div>
      </main>

      <footer className="py-16 border-t border-border bg-background/50 backdrop-blur-md">
        <div className="container mx-auto px-4 text-center">
           <p className="text-[10px] text-muted-foreground font-black tracking-[0.2em] uppercase opacity-30">
             © {new Date().getFullYear()} SafeRwanda Security. All rights reserved.
           </p>
        </div>
      </footer>
    </div>
  );
}
