"use client"

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Users, 
  Zap, 
  Activity, 
  Signal, 
  Map as MapIcon, 
  Heart, 
  Flame, 
  Box, 
  Network, 
  Baby, 
  Database, 
  Cpu,
  Globe,
  Bell,
  Eye,
  House
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlaceHolderImages } from '@/app/lib/placeholder-images';

export default function Home() {
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-security');
  const communityImg = PlaceHolderImages.find(img => img.id === 'smart-community');

  const [metrics, setMetrics] = useState([
    { id: 1, label: 'Kigali Methane', value: '12 PPM', status: 'Optimal' },
    { id: 2, label: 'Asset Tracker #92', value: 'In Motion', status: 'Encrypted' },
    { id: 3, label: 'Gateway Node Alpha', value: '99.9% Uptime', status: 'Stable' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(m => {
        if (m.id === 1) return { ...m, value: `${Math.floor(Math.random() * 3) + 11} PPM` };
        return m;
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        
        {/* 1. The Hero Section (Cinematic First Impression) */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            {heroImg && (
              <Image
                src={heroImg.imageUrl}
                alt="SafeRwanda Dashboard"
                fill
                className="object-cover opacity-20 scale-105"
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/60 to-background" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          </div>

          <div className="container mx-auto px-4 z-10 text-center">
            <div className="max-w-5xl mx-auto animate-fade-in">
              <Badge variant="outline" className="mb-6 px-4 py-1.5 border-primary/30 text-primary font-bold bg-primary/5 backdrop-blur-md">
                <Signal className="w-3.5 h-3.5 mr-2 animate-pulse text-primary" />
                Next-Gen IoT Infrastructure
              </Badge>
              <h1 className="text-5xl sm:text-6xl md:text-5xl lg:text-8xl font-headline font-extrabold mb-8 leading-[1] tracking-tighter">
                Building a <span className="text-gradient">Smarter, Safer Rwanda</span> From the Ground Up.
              </h1>
              <p className="text-lg md:text-base lg:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-light">
                Advanced IoT and smart monitoring solutions designed to protect your home, secure your assets, and empower your entire community.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button asChild size="lg" className="h-16 px-10 rounded-2xl text-lg font-bold shadow-2xl shadow-primary/30 bg-primary hover:bg-primary/90 transition-all hover:scale-105">
                  <Link href="/auth?signup=true" className="flex items-center gap-2">
                    Get Started <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-16 px-10 rounded-2xl text-lg font-bold border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all hover:scale-105">
                  <Link href="#demo">Request a Demo</Link>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
            <div className="w-6 h-10 rounded-full border-2 border-muted-foreground flex justify-center p-1">
              <div className="w-1 h-2 bg-muted-foreground rounded-full" />
            </div>
          </div>
        </section>

        {/* 2. The Core Value Pillars (Tiered Design) */}
        <section className="py-32 relative">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-3xl lg:text-6xl font-headline font-extrabold mb-6">Omnipresent Protection.</h2>
                <p className="text-xl md:text-lg text-muted-foreground font-light">Our smart infrastructure ecosystem is categorized into three specialized safety tiers, providing granular security for every facet of life.</p>
              </div>
              <div className="flex gap-4">
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                  <Activity className="w-8 h-8 text-primary" />
                </div>
                <div className="p-4 rounded-2xl bg-accent/10 border border-accent/20">
                  <Globe className="w-8 h-8 text-accent" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Pillar A: Family & Vulnerable Care */}
              <div className="space-y-8 lg:mt-12">
                <div className="inline-flex items-center gap-3 bg-accent/10 px-4 py-2 rounded-xl border border-accent/20">
                  <Heart className="w-5 h-5 text-accent" />
                  <span className="text-accent font-bold tracking-widest uppercase text-xs">Family & Care</span>
                </div>
                <Card className="glass-card group hover:-translate-y-2 transition-transform duration-500">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center mb-4 text-accent">
                      <Baby className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-2xl md:text-xl font-bold">Protect Your Child</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground leading-relaxed text-sm">
                    Real-time location tracking and wearable geofencing alerts to ensure your children are safe on their way to and from school.
                  </CardContent>
                </Card>
                <Card className="glass-card group hover:-translate-y-2 transition-transform duration-500">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center mb-4 text-accent">
                      <Users className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-2xl md:text-xl font-bold">Take Care of Your Elderly</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground leading-relaxed text-sm">
                    Smart ambient health sensors, fall-detection alerts, and automated panic buttons that notify family emergency contacts instantly.
                  </CardContent>
                </Card>
              </div>

              {/* Pillar B: Smart Home & Asset Protection */}
              <div className="space-y-8">
                <div className="inline-flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">
                  <Lock className="w-5 h-5 text-primary" />
                  <span className="text-primary font-bold tracking-widest uppercase text-xs">Home & Assets</span>
                </div>
                <Card className="glass-card group hover:-translate-y-2 transition-transform duration-500 border-primary/20">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 text-primary">
                      <Flame className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-2xl md:text-xl font-bold">Prevent Fire</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground leading-relaxed text-sm">
                    Smart thermal and smoke detectors linked to automated network alarms to neutralize fire hazards before they spread.
                  </CardContent>
                </Card>
                <Card className="glass-card group hover:-translate-y-2 transition-transform duration-500 border-primary/20">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 text-primary">
                      <House className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-2xl md:text-xl font-bold">Secure Your Premise</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground leading-relaxed text-sm">
                    Connected smart locks, perimeter breach detectors, and intelligent entry logs tailored for residential and commercial layouts.
                  </CardContent>
                </Card>
                <Card className="glass-card group hover:-translate-y-2 transition-transform duration-500 border-primary/20">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 text-primary">
                      <Zap className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-2xl md:text-xl font-bold">Secure Your Assets</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground leading-relaxed text-sm">
                    High-precision cellular and LoRaWAN hardware asset tracking nodes built to safeguard equipment, vehicles, and critical tools.
                  </CardContent>
                </Card>
              </div>

              {/* Pillar C: Connected Community */}
              <div className="space-y-8 lg:mt-24">
                <div className="inline-flex items-center gap-3 bg-accent/10 px-4 py-2 rounded-xl border border-accent/20">
                  <Network className="w-5 h-5 text-accent" />
                  <span className="text-accent font-bold tracking-widest uppercase text-xs">Community Infrastructure</span>
                </div>
                <Card className="glass-card group hover:-translate-y-2 transition-transform duration-500">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center mb-4 text-accent">
                      <Eye className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-2xl md:text-xl font-bold">Neighborhood Survey</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground leading-relaxed text-sm">
                    Decentralized network gateway monitoring nodes linking neighborhood watch loops together for real-time safety updates.
                  </CardContent>
                </Card>
                <Card className="glass-card group hover:-translate-y-2 transition-transform duration-500">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center mb-4 text-accent">
                      <Globe className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-2xl md:text-xl font-bold">Make Community Smart</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground leading-relaxed text-sm">
                    Scalable urban IoT applications, including smart lighting, waste analytics, and environmental hazard tracking dashboards.
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* 3. How It Works (The 3-Step Tech Simplicity) */}
        <section className="py-32 bg-secondary/30 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl md:text-3xl lg:text-5xl font-headline font-extrabold mb-6">Simplicity in Motion.</h2>
              <p className="text-xl md:text-lg text-muted-foreground font-light">We handle the technical complexity so you can focus on what matters most.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
              {[
                {
                  icon: <Cpu className="w-10 h-10" />,
                  title: "Deploy Hardware Nodes",
                  desc: "We set up plug-and-play IoT sensors, trackers, and gateway devices seamlessly across your premises."
                },
                {
                  icon: <Database className="w-10 h-10" />,
                  title: "Monitor the Stream",
                  desc: "Data channels route securely into our centralized cloud processing system with zero downtime."
                },
                {
                  icon: <Bell className="w-10 h-10" />,
                  title: "Receive Live Alerts",
                  desc: "Get instant, actionable mobile notifications and view status metrics on your web control panel."
                }
              ].map((step, idx) => (
                <div key={idx} className="relative group text-center flex flex-col items-center">
                  <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center mb-8 shadow-2xl shadow-primary/20 group-hover:rotate-6 transition-transform">
                    {step.icon}
                  </div>
                  <h4 className="text-2xl md:text-xl font-bold mb-4">{step.title}</h4>
                  <p className="text-muted-foreground leading-relaxed text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Interactive Live Metric Showcase */}
        <section className="py-32" id="demo">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <Badge variant="outline" className="mb-6 px-4 py-1.5 border-primary text-primary font-bold">PHYSICAL VALIDATION</Badge>
                <h2 className="text-4xl md:text-3xl lg:text-6xl font-headline font-extrabold mb-8 tracking-tighter leading-tight">Live Capability Stream.</h2>
                <p className="text-xl md:text-lg text-muted-foreground mb-12 font-light leading-relaxed">
                  Our platform delivers real-world protection in real-time. This interactive showcase demonstrates our active deployments across Rwanda.
                </p>
                <div className="space-y-6">
                  {metrics.map((metric) => (
                    <div key={metric.id} className="flex items-center justify-between p-6 glass-card rounded-2xl hover:border-primary/50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse-soft shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
                        <span className="text-lg md:text-base font-medium">{metric.label}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-lg md:text-base font-bold font-mono text-primary">{metric.value}</span>
                        <Badge variant="secondary" className="px-3 py-1 uppercase text-[10px] font-bold tracking-widest">{metric.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative group rounded-[3rem] overflow-hidden border border-white/5 shadow-[0_0_100px_rgba(37,99,235,0.15)] aspect-square lg:aspect-video">
                <div className="absolute inset-0 z-0">
                  {communityImg && (
                    <Image 
                      src={communityImg.imageUrl} 
                      alt="Smart City Map" 
                      fill 
                      className="object-cover opacity-30 grayscale group-hover:scale-110 transition-transform duration-1000"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-background" />
                </div>
                
                <div className="relative z-10 w-full h-full p-10 flex flex-col justify-between backdrop-blur-[4px]">
                  <div className="flex justify-between items-start">
                    <div className="glass-card p-6 rounded-3xl border-white/20 max-w-[280px]">
                      <div className="flex items-center gap-2 mb-4 text-xs font-bold text-primary uppercase tracking-tighter">
                        <MapIcon className="w-4 h-4" />
                        Active Node: Zone B-4
                      </div>
                      <div className="h-32 w-full rounded-xl bg-primary/20 animate-pulse mb-4 flex items-center justify-center">
                        <Activity className="w-12 h-12 text-primary/40" />
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">Precision GPS Mesh active. 32 Node Handshakes verified.</p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Badge className="bg-green-500 text-white border-none shadow-lg shadow-green-500/30">System: ONLINE</Badge>
                      <Badge variant="secondary" className="bg-white/10 text-white backdrop-blur-md border-white/20 uppercase tracking-widest text-[10px]">Signal: EXCELLENT</Badge>
                    </div>
                  </div>
                  
                  <div className="bg-black/80 backdrop-blur-2xl p-6 rounded-2xl font-mono text-xs border border-white/10 overflow-hidden shadow-2xl">
                    <div className="space-y-1 text-green-400">
                      <div className="flex gap-2">
                        <span className="opacity-40">[{new Date().toLocaleTimeString()}]</span>
                        <span className="text-primary font-bold">INFO:</span>
                        <span>Node_128 Handshake Success.</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="opacity-40">[{new Date().toLocaleTimeString()}]</span>
                        <span className="text-accent font-bold">METRIC:</span>
                        <span>Methane detection: {metrics[0].value}</span>
                      </div>
                      <div className="flex gap-2 opacity-50">
                        <span className="opacity-40">[{new Date().toLocaleTimeString()}]</span>
                        <span>AES-256 Tunnel Active.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Final Closing CTA Section */}
        <section className="py-32 relative overflow-hidden bg-primary text-white">
          <div className="absolute top-0 left-0 w-full h-full">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/10 rounded-full blur-[120px] pointer-events-none" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-5xl md:text-3xl lg:text-7xl font-headline font-extrabold mb-8 tracking-tighter leading-tight">Ready to Secure Your Piece of Tomorrow?</h2>
                <p className="text-xl md:text-lg text-primary-foreground/80 mb-12 font-light leading-relaxed">
                  Contact our technical engineering deployment team today for a tailored residential or community infrastructure security assessment.
                </p>
                <div className="flex items-center gap-10">
                   <div className="flex -space-x-4">
                     {[1,2,3,4,5].map(i => (
                       <div key={i} className="w-14 h-14 rounded-full border-4 border-primary bg-white/20 backdrop-blur-md" />
                     ))}
                   </div>
                   <div className="font-bold text-xl md:text-lg">
                     1,200+ <span className="text-primary-foreground/60 font-light block text-sm">Active Deployments</span>
                   </div>
                </div>
              </div>

              <Card className="bg-white/5 backdrop-blur-2xl p-10 md:p-6 rounded-[3rem] border-white/10 shadow-2xl">
                <CardHeader className="px-0 pt-0 mb-8">
                  <CardTitle className="text-3xl md:text-2xl font-headline font-bold">Request Assessment</CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-6">
                  <Input placeholder="Full Name" className="bg-white/10 border-white/10 h-16 rounded-2xl text-lg md:text-base focus-visible:ring-white/20 text-white placeholder:text-white/40" />
                  <Input placeholder="Email Address" type="email" className="bg-white/10 border-white/10 h-16 rounded-2xl text-lg md:text-base focus-visible:ring-white/20 text-white placeholder:text-white/40" />
                  <Select>
                    <SelectTrigger className="bg-white/10 border-white/10 h-16 rounded-2xl text-lg md:text-base text-white/60 focus:ring-white/20">
                      <SelectValue placeholder="Service Interest" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="child">Child Protection</SelectItem>
                      <SelectItem value="home">Smart Home Security</SelectItem>
                      <SelectItem value="community">Community Infrastructure</SelectItem>
                      <SelectItem value="assets">High-Value Asset Tracking</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="w-full bg-white text-primary hover:bg-white/90 h-16 rounded-2xl text-xl md:text-lg font-bold shadow-2xl transition-all hover:scale-[1.02]">
                    Submit Inquiry
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-24 border-t border-border bg-background relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-16 mb-16">
            <div className="max-w-sm">
              <Link href="/" className="flex items-center gap-3 group mb-8">
                <ShieldCheck className="w-10 h-10 text-primary" />
                <span className="text-3xl font-headline font-extrabold tracking-tighter">SafeRwanda</span>
              </Link>
              <p className="text-muted-foreground leading-relaxed font-light text-sm">
                Engineering a safer future through advanced IoT, real-time analytics, and community-first security architecture.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-16 lg:gap-32">
              <div className="space-y-6">
                <h5 className="font-bold text-xs uppercase tracking-[0.2em] text-primary">Ecosystem</h5>
                <ul className="space-y-4 text-sm font-medium">
                  <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">IoT Stack</Link></li>
                  <li><Link href="/services" className="text-muted-foreground hover:text-primary transition-colors">Services</Link></li>
                  <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Hardware</Link></li>
                </ul>
              </div>
              <div className="space-y-6">
                <h5 className="font-bold text-xs uppercase tracking-[0.2em] text-primary">Company</h5>
                <ul className="space-y-4 text-sm font-medium">
                  <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Our Vision</Link></li>
                  <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Global Partners</Link></li>
                  <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Careers</Link></li>
                </ul>
              </div>
              <div className="space-y-6">
                <h5 className="font-bold text-xs uppercase tracking-[0.2em] text-primary">Portal</h5>
                <ul className="space-y-4 text-sm font-medium">
                  <li><Link href="/auth" className="text-muted-foreground hover:text-primary transition-colors">Login</Link></li>
                  <li><Link href="/concierge" className="text-muted-foreground hover:text-primary transition-colors">AI Concierge</Link></li>
                  <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Support</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-xs text-muted-foreground font-bold tracking-widest uppercase">
              © {new Date().getFullYear()} SafeRwanda IoT Labs. Secure by Design.
            </div>
            <div className="flex gap-10">
              <Link href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors font-bold uppercase">Privacy</Link>
              <Link href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors font-bold uppercase">Terms</Link>
              <Link href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors font-bold uppercase">Technical Assessment</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
