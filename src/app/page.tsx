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
  Smartphone,
  Cpu
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

  // Simulated live data
  const [metrics, setMetrics] = useState([
    { id: 1, label: 'Methane Levels', value: '12 PPM', status: 'Normal' },
    { id: 2, label: 'Tracker ID #92', value: 'Moving', status: 'Active' },
    { id: 3, label: 'Gateway Node 4', value: 'Connected', status: 'Stable' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(m => {
        if (m.id === 1) return { ...m, value: `${Math.floor(Math.random() * 5) + 10} PPM` };
        return m;
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow pt-16">
        
        {/* 1. The Hero Section */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden border-b border-border/50">
          <div className="absolute inset-0 z-0">
            {heroImg && (
              <Image
                src={heroImg.imageUrl}
                alt="Active smart monitoring dashboard"
                fill
                className="object-cover opacity-15"
                priority
                data-ai-hint="dashboard overlay"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          </div>

          <div className="container mx-auto px-4 z-10">
            <div className="max-w-4xl animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6">
                <Activity className="w-3 h-3" />
                Live Monitoring Dashboard Active
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-headline font-extrabold mb-6 leading-[1.1] tracking-tight text-foreground">
                Building a <span className="text-primary">Smarter, Safer Rwanda</span> From the Ground Up.
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
                Advanced IoT and smart monitoring solutions designed to protect your home, secure your assets, and empower your entire community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-primary text-white hover:bg-primary/90 h-14 px-8 text-base font-bold shadow-xl shadow-primary/20 group">
                  <Link href="/auth?signup=true" className="flex items-center gap-2">
                    Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-border bg-background/50 backdrop-blur-sm hover:bg-secondary h-14 px-8 text-base font-semibold">
                  <Link href="#demo">Request a Demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 2. The Core Value Pillars */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-headline font-extrabold mb-4 tracking-tight">Protect What Matters Most</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">Our smart infrastructure ecosystem is categorized into three specialized safety tiers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Pillar A: Family & Vulnerable Care */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                    <Heart className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-headline font-bold">Family & Care</h3>
                </div>
                <Card className="bg-secondary/20 border-border group hover:border-accent/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 text-accent font-bold mb-1">
                      <Baby className="w-4 h-4" />
                      <span className="text-sm">Protect Your Child</span>
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs md:text-sm text-muted-foreground">
                    Real-time location tracking and wearable geofencing alerts to ensure your children are safe on their way to and from school.
                  </CardContent>
                </Card>
                <Card className="bg-secondary/20 border-border group hover:border-accent/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 text-accent font-bold mb-1">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-sm">Take Care of Your Elderly</span>
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs md:text-sm text-muted-foreground">
                    Smart ambient health sensors, fall-detection alerts, and automated panic buttons that notify family emergency contacts instantly.
                  </CardContent>
                </Card>
              </div>

              {/* Pillar B: Smart Home & Asset Protection */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-headline font-bold">Home & Assets</h3>
                </div>
                <Card className="bg-secondary/20 border-border group hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 text-primary font-bold mb-1">
                      <Flame className="w-4 h-4" />
                      <span className="text-sm">Prevent Fire</span>
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs md:text-sm text-muted-foreground">
                    Smart thermal and smoke detectors linked to automated network alarms to neutralize fire hazards before they spread.
                  </CardContent>
                </Card>
                <Card className="bg-secondary/20 border-border group hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 text-primary font-bold mb-1">
                      <Box className="w-4 h-4" />
                      <span className="text-sm">Secure Your Property</span>
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs md:text-sm text-muted-foreground">
                    Connected smart locks, perimeter breach detectors, and intelligent entry logs tailored for residential and commercial layouts.
                  </CardContent>
                </Card>
                <Card className="bg-secondary/20 border-border group hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 text-primary font-bold mb-1">
                      <Zap className="w-4 h-4" />
                      <span className="text-sm">Secure Your Assets</span>
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs md:text-sm text-muted-foreground">
                    High-precision cellular and LoRaWAN hardware asset tracking nodes built to safeguard equipment and vehicles.
                  </CardContent>
                </Card>
              </div>

              {/* Pillar C: Connected Community */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                    <Network className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-headline font-bold">Community</h3>
                </div>
                <Card className="bg-secondary/20 border-border group hover:border-accent/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 text-accent font-bold mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Neighborhood Survey</span>
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs md:text-sm text-muted-foreground">
                    Decentralized network gateway monitoring nodes linking neighborhood watch loops together for real-time safety updates.
                  </CardContent>
                </Card>
                <Card className="bg-secondary/20 border-border group hover:border-accent/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 text-accent font-bold mb-1">
                      <Cpu className="w-4 h-4" />
                      <span className="text-sm">Smart Community</span>
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs md:text-sm text-muted-foreground">
                    Scalable urban IoT applications, including smart lighting, waste analytics, and environmental hazard tracking dashboards.
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* 3. How It Works */}
        <section className="py-24 bg-secondary/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-extrabold mb-16 tracking-tight">Demystifying the Security Pipeline</h2>
            <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              {[
                {
                  icon: <Cpu className="w-8 h-8" />,
                  title: "Deploy Hardware Nodes",
                  desc: "We set up plug-and-play IoT sensors, trackers, and gateway devices seamlessly across your premises."
                },
                {
                  icon: <Database className="w-8 h-8" />,
                  title: "Monitor the Stream",
                  desc: "Data channels route securely into our centralized cloud processing system with zero downtime."
                },
                {
                  icon: <Smartphone className="w-8 h-8" />,
                  title: "Receive Live Alerts",
                  desc: "Get instant, actionable mobile notifications and view status metrics on your web control panel."
                }
              ].map((step, idx) => (
                <div key={idx} className="relative group">
                  {idx < 2 && (
                    <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] border-t-2 border-dashed border-primary/30 z-0" />
                  )}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-3xl bg-primary text-white flex items-center justify-center mb-6 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                      {step.icon}
                    </div>
                    <h4 className="text-lg font-headline font-bold mb-4">{step.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed px-4">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Interactive Live Metric Showcase */}
        <section className="py-24 border-y border-border/50 overflow-hidden" id="demo">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <Badge variant="outline" className="mb-4 border-primary text-primary font-bold">LIVE PROOF OF CONCEPT</Badge>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-headline font-extrabold mb-6 tracking-tight text-foreground">Immediate, Functioning Protection Capabilities.</h2>
                <p className="text-muted-foreground text-sm md:text-base lg:text-lg mb-8 leading-relaxed">
                  Our platform delivers real-world data in real-time. This interactive showcase demonstrates how we provide physical proof to corporate clients, community leaders, and homeowners.
                </p>
                <div className="space-y-4">
                  {metrics.map((metric) => (
                    <div key={metric.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-xl shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-medium">{metric.label}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold font-mono">{metric.value}</span>
                        <Badge variant="secondary" className="text-[10px] uppercase font-bold">{metric.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative rounded-3xl overflow-hidden border border-border shadow-2xl aspect-video md:aspect-square lg:aspect-video">
                <div className="absolute inset-0 bg-muted flex items-center justify-center">
                  {communityImg && (
                    <Image 
                      src={communityImg.imageUrl} 
                      alt="Smart city dashboard" 
                      fill 
                      className="object-cover opacity-40"
                      data-ai-hint="smart city"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
                  <div className="relative z-10 w-full h-full p-8 flex flex-col justify-between backdrop-blur-[2px]">
                    <div className="flex justify-between items-start">
                      <div className="bg-background/90 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl max-w-[200px]">
                        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-primary uppercase tracking-tighter">
                          <MapIcon className="w-3 h-3" />
                          Kigali Node Cluster
                        </div>
                        <div className="h-20 w-full rounded bg-muted animate-pulse mb-2" />
                        <p className="text-[10px] text-muted-foreground">32 Active Sensors detected in Zone B-4</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className="bg-green-500 border-none">System Online</Badge>
                        <Badge variant="secondary" className="bg-white/10 text-white backdrop-blur-md border-white/20">LTE-M Signal Strong</Badge>
                      </div>
                    </div>
                    <div className="bg-black/80 text-green-400 p-4 rounded-xl font-mono text-[10px] overflow-hidden">
                      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {`> [INFO] Node_128 reports Methane: ${metrics[0].value}`}
                      </div>
                      <div className="opacity-70">{`> [INFO] Gateway_Alpha status: Stable`}</div>
                      <div className="opacity-50">{`> [INFO] GPS_Link encryption active`}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Final Closing CTA Section */}
        <section className="py-24 bg-primary relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="text-white max-w-xl">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-headline font-extrabold mb-6 tracking-tight leading-tight">Ready to Secure Your Piece of Tomorrow?</h2>
                <p className="text-primary-foreground/80 text-base md:text-lg lg:text-xl mb-10 leading-relaxed">
                  Contact our technical engineering deployment team today for a tailored residential or community infrastructure security assessment.
                </p>
                <div className="flex items-center gap-6">
                  <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-12 h-12 rounded-full border-4 border-primary bg-white/10" />
                    ))}
                  </div>
                  <div className="text-white/80 text-sm font-medium">
                    <span className="block font-bold text-white">1,200+</span>
                    Active Deployments
                  </div>
                </div>
              </div>

              <Card className="bg-white p-8 rounded-3xl shadow-2xl border-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-2xl font-headline font-bold text-primary">Request Assessment</CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-4">
                  <div className="space-y-2">
                    <Input placeholder="Full Name" className="bg-secondary/30 border-none h-12 rounded-xl focus-visible:ring-primary" />
                  </div>
                  <div className="space-y-2">
                    <Input placeholder="Email Address" type="email" className="bg-secondary/30 border-none h-12 rounded-xl focus-visible:ring-primary" />
                  </div>
                  <div className="space-y-2">
                    <Select>
                      <SelectTrigger className="bg-secondary/30 border-none h-12 rounded-xl text-muted-foreground">
                        <SelectValue placeholder="Service Interest" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="child">Child Protection</SelectItem>
                        <SelectItem value="home">Smart Home Security</SelectItem>
                        <SelectItem value="community">Community Infrastructure</SelectItem>
                        <SelectItem value="assets">High-Value Asset Tracking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90 h-14 rounded-xl text-white font-bold text-lg shadow-xl shadow-primary/20 transition-all">
                    Submit Inquiry
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-16 border-t border-border bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-12">
            <div className="flex items-center gap-2 group">
              <ShieldCheck className="w-8 h-8 text-primary group-hover:text-accent transition-colors" />
              <span className="text-2xl font-headline font-bold tracking-tight">SafeRwanda</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 md:gap-24">
              <div className="space-y-4">
                <h5 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Company</h5>
                <ul className="space-y-2 text-sm">
                  <li><Link href="#" className="hover:text-primary transition-colors">Our Vision</Link></li>
                  <li><Link href="/services" className="hover:text-primary transition-colors">IoT Stack</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h5 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Deploy</h5>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/auth" className="hover:text-primary transition-colors">Partner Portal</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">Client Login</Link></li>
                  <li><Link href="/concierge" className="hover:text-primary transition-colors">AI Concierge</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="text-sm text-muted-foreground font-medium">
              © {new Date().getFullYear()} SafeRwanda IoT Labs. All rights reserved.
            </div>
            <div className="flex gap-8">
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Engineering</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
