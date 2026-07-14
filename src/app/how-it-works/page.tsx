
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
      title: "Tactical Onboarding",
      description: "Initialize your secured profile. Our encryption standards ensure your security data remains private and accessible only to you and your authorized network.",
      icon: <UserPlus className="w-8 h-8 text-primary" />,
      image: PlaceHolderImages.find(img => img.id === 'step-account')?.imageUrl,
      color: "border-primary"
    },
    {
      id: "step-shop",
      title: "Hardware Acquisition",
      description: "Select your defense tier in the dashboard shop. Choose from child trackers, elderly health monitors, or industrial fire and methane sensors.",
      icon: <ShoppingCart className="w-8 h-8 text-accent" />,
      image: PlaceHolderImages.find(img => img.id === 'step-shop')?.imageUrl,
      color: "border-accent"
    },
    {
      id: "step-connect",
      title: "Device Registration",
      description: "Link your unique hardware node ID. Once your device arrives, simply enter its identification code in your dashboard to initiate the digital handshake.",
      icon: <Cpu className="w-8 h-8 text-rwanda-green" />,
      image: PlaceHolderImages.find(img => img.id === 'step-connect')?.imageUrl,
      color: "border-rwanda-green"
    },
    {
      id: "step-monitor",
      title: "Central Monitoring",
      description: "View live telemetry and signal health. Track real-time movements, health metrics, or environmental gas levels from anywhere in the world.",
      icon: <Activity className="w-8 h-8 text-primary" />,
      image: PlaceHolderImages.find(img => img.id === 'step-monitor')?.imageUrl,
      color: "border-primary"
    },
    {
      id: "step-alert",
      title: "Distress Protocols",
      description: "Immediate SMS and Email alerts. During a security breach or health emergency, our system triggers multi-channel notifications to your pre-set contacts.",
      icon: <Bell className="w-8 h-8 text-destructive" />,
      image: PlaceHolderImages.find(img => img.id === 'step-alert')?.imageUrl,
      color: "border-destructive"
    },
    {
      id: "step-comms",
      title: "Direct Interfacing",
      description: "Communicate with your nodes. Use silent audio callbacks, two-way voice calls, or remote configuration commands to manage your hardware in the field.",
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
              Strategic Operations Grid
            </Badge>
            <h1 className="text-4xl md:text-6xl font-headline font-black tracking-tighter leading-tight mb-6">
              How the <span className="text-gradient">Platform Works</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
              We've engineered a seamless transition from physical insecurity to digital oversight. Follow the deployment phases below.
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
                      <CheckCircle2 className="w-4 h-4" /> Military Grade Security
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-rwanda-green">
                      <CheckCircle2 className="w-4 h-4" /> Live Signal Validation
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
                      <span className="text-white text-xs font-black uppercase tracking-widest">SafeRwanda Node Link</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Alerting Capabilities Section */}
          <div className="mt-32 p-12 md:p-24 rounded-[4rem] bg-primary text-white relative overflow-hidden shadow-2xl animate-reveal">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px]" />
            <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <Badge variant="outline" className="mb-6 px-4 py-1.5 border-white/20 text-white font-extrabold bg-white/10 backdrop-blur-md">
                  Real-Time Notification Grid
                </Badge>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-8">Never Miss a Single Heartbeat.</h2>
                <p className="text-lg text-primary-foreground/80 mb-10 font-light leading-relaxed">
                  Our infrastructure is directly integrated with major Rwandan cellular providers and email servers. Whether it's a gas leak, a fall detection, or a perimeter breach, you are the first to know.
                </p>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-6 rounded-3xl bg-white/5 border border-white/10">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Instant SMS Alerts</h4>
                      <p className="text-sm text-primary-foreground/60">Delivered in less than 2 seconds over LoRaWAN.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-6 rounded-3xl bg-white/5 border border-white/10">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Detailed Email Reports</h4>
                      <p className="text-sm text-primary-foreground/60">Full telemetry snapshots and incident timestamps.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl rounded-[3rem] p-10 border border-white/20">
                <div className="space-y-4 font-mono text-[10px]">
                  <div className="flex justify-between items-center text-accent">
                    <span>SYSTEM_STATUS: ACTIVE</span>
                    <span>99.9% UPTIME</span>
                  </div>
                  <div className="h-px bg-white/10 w-full" />
                  <div className="space-y-1">
                    <p className="text-white/40">[14:32:01] Link: Node_Alpha_Active</p>
                    <p className="text-rwanda-green">[14:32:05] SENSOR: Methane Level Nominal (12 PPM)</p>
                    <p className="text-white/40">[14:32:10] Heartbeat: Validated via Gateway 7</p>
                    <p className="text-destructive font-bold">[14:33:45] ALERT: Perimeter Breach Zone-B</p>
                    <p className="text-white">[14:33:46] PROTOCOL: SMS Dispatched to +250 7XX XXX XXX</p>
                    <p className="text-white">[14:33:46] PROTOCOL: Email Dispatched to security@user.rw</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-32 text-center animate-reveal">
            <h3 className="text-3xl font-black mb-8">Ready to Initialize?</h3>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button asChild size="lg" className="h-16 px-12 rounded-2xl text-lg font-bold shadow-2xl bg-primary hover:bg-primary/90">
                <Link href="/services">Get Started Now <ChevronRight className="w-5 h-5 ml-2" /></Link>
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
             © {new Date().getFullYear()} SafeRwanda Security. Technical Documentation Grid.
           </p>
        </div>
      </footer>
    </div>
  );
}
