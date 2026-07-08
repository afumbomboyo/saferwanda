
"use client"

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  Lock, 
  Signal, 
  Map as MapIcon, 
  Heart, 
  Network, 
  Database, 
  Cpu,
  Bell,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { PlaceHolderImages } from '@/app/lib/placeholder-images';

export default function Home() {
  const router = useRouter();
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-security');
  const communityImg = PlaceHolderImages.find(img => img.id === 'smart-community');

  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState('--:--:--');
  const [metrics, setMetrics] = useState([
    { id: 1, label: 'Kigali Methane', value: '12 PPM', status: 'Optimal' },
    { id: 2, label: 'Asset Tracker #92', value: 'In Motion', status: 'Encrypted' },
    { id: 3, label: 'Gateway Node Alpha', value: '99.9% Uptime', status: 'Stable' },
  ]);

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date().toLocaleTimeString());
    
    // Intersection Observer for scroll-triggered reveal animations
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
    
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(m => {
        if (m.id === 1) return { ...m, value: `${Math.floor(Math.random() * 3) + 11} PPM` };
        return m;
      }));
      setCurrentTime(new Date().toLocaleTimeString());
    }, 4000);
    
    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  const handleGetStarted = (serviceId: string) => {
    localStorage.setItem('temp_initial_service', serviceId);
    router.push(`/onboarding?id=${serviceId}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        
        {/* 1. The Hero Section (Cinematic First Impression) */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {heroImg && (
            <Image
              src="/images/SafeRwanda-Hero-BG.png"
              alt="SafeRwanda Vision"
              fill
              className="object-cover opacity-60 scale-105"
              priority
            />
          )}
            <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/60 to-background" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
          </div>
          <div className="container mx-auto px-4 z-10 text-center">
            <div className="max-w-4xl mx-auto animate-reveal">
            <Badge variant="outline" className="mb-6 px-4 py-1.5 border-slate-300 text-slate-900 font-extrabold bg-white/90 shadow-sm backdrop-blur-md">
              <Signal className="w-3.5 h-3.5 mr-2 animate-pulse text-sky-600" />
              Next-Gen IoT Infrastructure
            </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-extrabold mb-6 leading-tight tracking-tighter">
                Building a <span className="text-gradient">Smarter, Safer Rwanda</span> From the Ground Up.
              </h1>
              <p className="text-sm md:text-base lg:text-lg text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed font-light">
                Advanced IoT and smart monitoring solutions designed to protect your home, secure your assets, and empower your entire community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="h-12 md:h-14 px-8 rounded-xl text-sm md:text-base font-bold shadow-xl shadow-primary/30 bg-primary hover:bg-primary/90 transition-all hover:scale-105">
                  <Link href="/services" className="flex items-center gap-2">
                    Our Services <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 md:h-14 px-8 rounded-xl text-sm md:text-base font-bold border-white/10 bg-white/5 backdrop-blur-md transition-all hover:scale-90">
                  <Link href="#demo">How it Works</Link>
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

        {/* 2. The Core Value Pillars */}
        <section className="py-24 relative">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16 animate-reveal">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-headline font-extrabold mb-4">Our Services</h2>
              <p className="text-sm md:text-base lg:text-lg text-muted-foreground font-light">Our smart infrastructure ecosystem is categorized into three specialized safety tiers, providing granular security for every facet of life.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Pillar A: Family & Vulnerable Care */}
              <div className="space-y-6 flex flex-col animate-reveal reveal-delay-1">
                <div className="flex justify-center mb-2">
                  <div className="inline-flex items-center gap-2 bg-accent/10 px-3 py-1.5 rounded-lg border border-accent/20">
                    <Heart className="w-4 h-4 text-accent" />
                    <span className="text-accent font-bold tracking-widest uppercase text-[10px]">Family & Care</span>
                  </div>
                </div>
                <Card className="glass-card group hover:-translate-y-1 transition-transform duration-500 overflow-hidden flex flex-col h-full">
                  <div className="relative w-full h-80 border-b border-accent/10">
                    <Image src="/images/child.png" alt="Protect Your Child" fill className="object-cover" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl md:text-2xl font-bold">Protect Your Child</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground leading-relaxed text-xs md:text-sm flex-grow">
                    Option 1: Real-time tracking and geofencing for safe school commutes. Includes a one-touch SOS panic button for immediate distress alerts and a silent audio callback to instantly hear your child’s surroundings.<br/>
                    Option 2: Option 1 + Advanced health monitoring for temperature and oxygen saturation, specifically targeting early malaria detection.
                  </CardContent>
                  <div className="p-6 pt-0">
                    <Button onClick={() => handleGetStarted('child-protection')} className="w-full rounded-xl bg-accent text-accent-foreground hover:bg-accent/90">Get Started</Button>
                  </div>
                </Card>
                <Card className="glass-card group hover:-translate-y-1 transition-transform duration-500 overflow-hidden flex flex-col h-full">
                  <div className="relative w-full h-80 border-b border-accent/10">
                    <Image src="/images/elder.png" alt="Take Care of Your Elderly" fill className="object-cover" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl md:text-2xl font-bold">Take Care of Your Elderly</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground leading-relaxed text-xs md:text-sm flex-grow">
                    Smart sensors monitoring body temperature, blood pressure, and heart rate. Features automatic fall-detection alerts and instant panic buttons and notifications to family contacts the moment a health check drops.
                  </CardContent>
                  <div className="p-6 pt-0">
                    <Button onClick={() => handleGetStarted('elderly-care')} className="w-full rounded-xl bg-accent text-accent-foreground hover:bg-accent/90">Get Started</Button>
                  </div>
                </Card>
              </div>

              {/* Pillar B: Smart Home & Asset Protection */}
              <div className="space-y-6 flex flex-col animate-reveal reveal-delay-2">
                <div className="flex justify-center mb-2">
                  <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                    <Lock className="w-4 h-4 text-primary" />
                    <span className="text-primary font-bold tracking-widest uppercase text-[10px]">Home & Assets</span>
                  </div>
                </div>
                <Card className="glass-card group hover:-translate-y-1 transition-transform duration-500 border-primary/20 overflow-hidden flex flex-col h-full">
                  <div className="relative w-full h-80 border-b border-primary/10">
                    <Image src="/images/fire.png" alt="Prevent Fire" fill className="object-cover" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl md:text-2xl font-bold">Prevent Fire</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground leading-relaxed text-xs md:text-sm flex-grow">
                    Smart gas, thermal, and humidity (all in one) sensors that continuously monitor surroundings to deliver instant feedback on gas leakage warnings, high temperatures, and potential or active fire outbreaks.
                  </CardContent>
                  <div className="p-6 pt-0">
                    <Button onClick={() => handleGetStarted('fire-prevention')} className="w-full rounded-xl">Get Started</Button>
                  </div>
                </Card>
                <Card className="glass-card group hover:-translate-y-1 transition-transform duration-500 border-primary/20 overflow-hidden flex flex-col h-full">
                  <div className="relative w-full h-80 border-b border-primary/10">
                    <Image src="https://mecsecurity.com/news/wp-content/uploads/2018/11/6.jpg" alt="Secure Your Premise" fill className="object-cover" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl md:text-2xl font-bold">Secure Your Premise</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground leading-relaxed text-xs md:text-sm flex-grow">
                    Connected smart locks, perimeter breach detectors, and intelligent entry logs for residential layouts.
                  </CardContent>
                  <div className="p-6 pt-0">
                    <Button onClick={() => handleGetStarted('property-security')} className="w-full rounded-xl">Get Started</Button>
                  </div>
                </Card>
                <Card className="glass-card group hover:-translate-y-1 transition-transform duration-500 border-primary/20 overflow-hidden flex flex-col h-full">
                  <div className="relative w-full h-80 border-b border-primary/10">
                    <Image src="https://i5.walmartimages.com/seo/EON-Odyssey-18-Month-Long-Life-GPS-Tracker-Vehicles-Assets-Fleet-Hidden-Magnetic-GPS-Tracking-Device-Track-Years-Single-Charge-4G-LTE-Real-Time-Track_ddc51730-ff5f-4363-afc6-70c6686ebb84.bb45370a23c0677c87767a2e8b848bf3.jpeg?odnHeight=328&odnWidth=328&odnBg=FFFFFF" alt="Secure Your Assets" fill className="object-cover" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl md:text-2xl font-bold">Secure Your Assets</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground leading-relaxed text-xs md:text-sm flex-grow">
                    High-precision hardware asset tracking nodes built to safeguard equipment and vehicles.
                  </CardContent>
                  <div className="p-6 pt-0">
                    <Button onClick={() => handleGetStarted('asset-protection')} className="w-full rounded-xl">Get Started</Button>
                  </div>
                </Card>
              </div>

              {/* Pillar C: Connected Community */}
              <div className="space-y-6 flex flex-col animate-reveal reveal-delay-3">
                <div className="flex justify-center mb-2">
                  <div className="inline-flex items-center gap-2 bg-[#20603D]/10 px-3 py-1.5 rounded-lg border border-[#20603D]/20">
                    <Network className="w-4 h-4 text-[#20603D]" />
                    <span className="text-[#20603D] font-bold tracking-widest uppercase text-[10px]">Community Infrastructure</span>
                  </div>
                </div>
                <Card className="glass-card group hover:-translate-y-1 transition-transform duration-500 overflow-hidden flex flex-col h-full">
                  <div className="relative w-full h-80 border-b border-[#20603D]/10">
                    <Image src="https://images.unsplash.com/photo-1589935447067-5531094415d1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2N0diUyMGNhbWVyYXxlbnwwfHwwfHx8MA%3D%3D" alt="Neighborhood Survey" fill className="object-cover" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl md:text-2xl font-bold">Neighborhood Survey</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground leading-relaxed text-xs md:text-sm flex-grow">
                    Decentralized network gateway monitoring nodes linking neighborhood watch loops together.
                  </CardContent>
                  <div className="p-6 pt-0">
                    <Button onClick={() => handleGetStarted('neighborhood-surveillance')} className="w-full rounded-xl bg-[#20603D] text-white hover:bg-[#20603D]/90">Get Started</Button>
                  </div>
                </Card>
                <Card className="glass-card group hover:-translate-y-1 transition-transform duration-500 overflow-hidden flex flex-col h-full">
                  <div className="relative w-full h-80 border-b border-[#20603D]/10">
                    <Image src="/images/smart-community.png" alt="Make Community Smart" fill className="object-cover" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl md:text-2xl font-bold">Make Community Smart</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground leading-relaxed text-xs md:text-sm flex-grow">
                    Scalable urban IoT applications, including smart lighting, waste analytics, and environmental hazard tracking.
                  </CardContent>
                  <div className="p-6 pt-0">
                    <Button onClick={() => handleGetStarted('smart-community')} className="w-full rounded-xl bg-[#20603D] text-white hover:bg-[#20603D]/90">Get Started</Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* 3. How It Works */}
        <section className="py-24 bg-[#F5F5F7] dark:bg-muted/10 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-16 animate-reveal">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-headline font-extrabold mb-4">Simplicity in Motion.</h2>
              <p className="text-sm md:text-base lg:text-lg text-muted-foreground font-light">We handle the technical complexity so you can focus on what matters most.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: <Cpu className="w-8 h-8 md:w-10 md:h-10" />,
                  title: "Deploy Hardware Nodes",
                  desc: "Plug-and-play IoT sensors, trackers, and gateway devices seamlessly installed."
                },
                {
                  icon: <Database className="w-8 h-8 md:w-10 md:h-10" />,
                  title: "Monitor the Stream",
                  desc: "Data channels route securely into our centralized cloud system with zero downtime."
                },
                {
                  icon: <Bell className="w-8 h-8 md:w-10 md:h-10" />,
                  title: "Receive Live Alerts",
                  desc: "Get instant mobile notifications and view metrics on your control panel."
                }
              ].map((step, idx) => (
                <div key={idx} className="relative group text-center flex flex-col items-center animate-reveal" style={{ animationDelay: `${idx * 0.15}s` }}>
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center mb-6 shadow-xl shadow-primary/20 group-hover:rotate-3 transition-transform">
                    {step.icon}
                  </div>
                  <h4 className="text-lg md:text-xl font-bold mb-2">{step.title}</h4>
                  <p className="text-muted-foreground leading-relaxed text-xs md:text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Interactive Live Metric Showcase */}
        <section className="py-24" id="demo">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="animate-reveal">
                <Badge variant="outline" className="mb-4 px-3 py-1 border-primary text-primary font-bold text-xs uppercase tracking-widest">PHYSICAL VALIDATION</Badge>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-headline font-extrabold mb-6 tracking-tighter leading-tight">Live Capability Stream.</h2>
                <p className="text-base md:text-lg text-muted-foreground mb-10 font-light leading-relaxed">
                  Our platform delivers real-world protection in real-time. This interactive showcase demonstrates our active deployments.
                </p>
                <div className="space-y-4">
                  {metrics.map((metric) => (
                    <div key={metric.id} className="flex items-center justify-between p-4 glass-card rounded-xl hover:border-primary/50 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#20603D] animate-pulse-soft shadow-[0_0_10px_rgba(32,96,61,0.6)]" />
                        <span className="text-sm font-medium">{metric.label}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold font-mono text-primary">{metric.value}</span>
                        <Badge variant="secondary" className="px-2 py-0.5 uppercase text-[10px] font-bold tracking-widest">{metric.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative group rounded-[2rem] overflow-hidden border border-white/5 shadow-[0_0_60px_rgba(37,99,235,0.1)] aspect-square lg:aspect-video animate-reveal">
                <div className="absolute inset-0 z-0">
                  {communityImg && (
                    <Image 
                      src={communityImg.imageUrl} 
                      alt="Smart City Map" 
                      fill 
                      className="object-cover opacity-30 grayscale group-hover:scale-105 transition-transform duration-1000"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background" />
                </div>
                
                <div className="relative z-10 w-full h-full p-8 flex flex-col justify-between backdrop-blur-[2px]">
                  <div className="flex justify-between items-start">
                    <div className="glass-card p-4 rounded-2xl border-white/20 max-w-[220px]">
                      <div className="flex items-center gap-2 mb-3 text-[10px] font-bold text-primary uppercase tracking-tighter">
                        <MapIcon className="w-3.5 h-3.5" />
                        Active Node: Zone B-4
                      </div>
                      <div className="h-20 w-full rounded-lg bg-primary/20 animate-pulse mb-3 flex items-center justify-center">
                        <Activity className="w-6 h-6 text-primary/40" />
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">32 Node Handshakes verified.</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className="bg-[#20603D] text-white border-none text-[10px] py-0.5">ONLINE</Badge>
                      <Badge variant="secondary" className="bg-white/10 text-white backdrop-blur-md border-white/20 uppercase tracking-widest text-[8px] py-0.5">EXCELLENT</Badge>
                    </div>
                  </div>
                  
                  <div className="bg-black/80 backdrop-blur-2xl p-4 rounded-xl font-mono text-[10px] border border-white/10 overflow-hidden shadow-2xl">
                    <div className="space-y-1 text-accent font-bold">
                      <div className="flex gap-2">
                        <span className="opacity-40">[{mounted ? currentTime : '--:--:--'}]</span>
                        <span className="text-primary font-bold">INFO:</span>
                        <span className="text-white font-normal">Node_128 Handshake Success.</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="opacity-40">[{mounted ? currentTime : '--:--:--'}]</span>
                        <span className="text-[#20603D] font-bold">METRIC:</span>
                        <span className="text-white font-normal">Methane detection: {metrics[0].value}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Final Closing CTA Section */}
        <section className="py-24 relative overflow-hidden bg-primary text-white">
          <div className="absolute top-0 left-0 w-full h-full">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px] pointer-events-none" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="animate-reveal">
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-headline font-extrabold mb-6 tracking-tighter leading-tight">Ready to Secure Your Piece of Tomorrow?</h2>
                <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 font-light leading-relaxed">
                  Contact our technical deployment team today for a tailored residential or community security assessment.
                </p>
                <div className="flex items-center gap-8">
                   <div className="flex -space-x-3">
                     {[1,2,3,4,5].map(i => (
                       <div key={i} className="w-8 h-8 rounded-full border-2 border-primary bg-white/20 backdrop-blur-md" />
                     ))}
                   </div>
                   <div className="font-bold text-base md:text-lg">
                     1,200+ <span className="text-primary-foreground/60 font-light block text-xs">Active Deployments</span>
                   </div>
                </div>
              </div>

              <Card className="bg-white/5 backdrop-blur-2xl p-8 rounded-[2rem] border-white/10 shadow-2xl animate-reveal reveal-delay-2">
                <CardHeader className="px-0 pt-0 mb-6">
                  <CardTitle className="text-xl md:text-2xl font-headline font-bold text-white">Request Assessment</CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-4">
                  <Input placeholder="Full Name" className="bg-white/10 border-white/10 h-12 rounded-xl text-sm focus-visible:ring-white/20 text-white placeholder:text-white/40" />
                  <Input placeholder="Email Address" type="email" className="bg-white/10 border-white/10 h-12 rounded-xl text-sm focus-visible:ring-white/20 text-white placeholder:text-white/40" />
                  <Select>
                    <SelectTrigger className="bg-white/10 border-white/10 h-12 rounded-xl text-sm text-white focus:ring-white/20">
                      <SelectValue placeholder="Service Interest" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="child">Child Protection</SelectItem>
                      <SelectItem value="home">Smart Home Security</SelectItem>
                      <SelectItem value="community">Community Infrastructure</SelectItem>
                      <SelectItem value="assets">High-Value Asset Tracking</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12 rounded-xl text-base font-bold shadow-xl transition-all hover:scale-[1.02]">
                    Submit Inquiry
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-16 border-t border-border bg-background relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-12">
            <div className="max-w-xs">
              <div className="flex items-center gap-3 group mb-6">
                <Signal className="w-6 h-6 text-primary" />
                <span className="text-2xl font-headline font-extrabold tracking-tighter">SafeRwanda</span>
              </div>
              <p className="text-muted-foreground leading-relaxed font-light text-sm">
                Engineering a safer future through advanced IoT, real-time analytics, and community-first architecture.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12 lg:gap-24">
              <div className="space-y-4">
                <h5 className="font-bold text-xs uppercase tracking-[0.2em] text-primary">Ecosystem</h5>
                <ul className="space-y-3 text-sm font-medium">
                  <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">IoT Stack</Link></li>
                  <li><Link href="/services" className="text-muted-foreground hover:text-primary transition-colors">Our Services</Link></li>
                  <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Hardware</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h5 className="font-bold text-xs uppercase tracking-[0.2em] text-primary">Company</h5>
                <ul className="space-y-3 text-sm font-medium">
                  <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Our Vision</Link></li>
                  <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Global Partners</Link></li>
                  <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Careers</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h5 className="font-bold text-xs uppercase tracking-[0.2em] text-primary">Portal</h5>
                <ul className="space-y-3 text-sm font-medium">
                  <li><Link href="/auth" className="text-muted-foreground hover:text-primary transition-colors">Login</Link></li>
                  <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Support</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-xs text-muted-foreground font-bold tracking-widest uppercase">
              © {new Date().getFullYear()} SafeRwanda IoT Labs. Secure by Design.
            </div>
            <div className="flex gap-8">
              <Link href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors font-bold uppercase">Privacy</Link>
              <Link href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors font-bold uppercase">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
