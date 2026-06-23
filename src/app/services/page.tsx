
"use client"

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Shield, Heart, Flame, Home, Box, Eye, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function ServicesPage() {
  const router = useRouter();

  const services = [
    {
      id: "child-protection",
      title: "Protect Your Child",
      shortNote: "Smart wearables for school safety.",
      description: "Comprehensive school-safety infrastructure featuring real-time tracking, safe-zone geofencing, and a dedicated SOS button for emergency response.",
      icon: <Shield className="w-10 h-10 text-accent" />,
      imageUrl: "https://picsum.photos/seed/safe2/600/400",
      imageHint: "child safety tracker",
      theme: "bg-primary/5 border-primary/20",
    },
    {
      id: "elderly-care",
      title: "Elderly Care",
      shortNote: "Fall detection & health monitors.",
      description: "Advanced health-monitoring mesh network for seniors, incorporating fall detection, vitals tracking, and automated emergency alerts for caretakers.",
      icon: <Heart className="w-10 h-10 text-primary" />,
      imageUrl: "https://picsum.photos/seed/safe3/600/400",
      imageHint: "elderly health monitor",
      theme: "bg-accent/5 border-accent/20",
    },
    {
      id: "fire-prevention",
      title: "Fire Prevention",
      shortNote: "Smart thermal & gas sensors.",
      description: "Intelligent thermal and gas leak detection systems that provide instant mobile alerts and community-wide fire outbreak warnings in real-time.",
      icon: <Flame className="w-10 h-10 text-red-500" />,
      imageUrl: "https://picsum.photos/seed/safe4/600/400",
      imageHint: "fire safety system",
      theme: "bg-red-500/5 border-red-500/20",
    },
    {
      id: "property-security",
      title: "Property Security",
      shortNote: "Connected smart locks & sensors.",
      description: "A complete residential perimeter security solution with connected smart locks, entry logs, and high-frequency breach detection sensors.",
      icon: <Home className="w-10 h-10 text-primary" />,
      imageUrl: "https://picsum.photos/seed/safe5/600/400",
      imageHint: "home security cameras",
      theme: "bg-primary/5 border-primary/20",
    },
    {
      id: "asset-protection",
      title: "Asset Protection",
      shortNote: "High-precision hardware tracking.",
      description: "Precision-engineered GPS nodes designed for high-value asset protection, offering real-time transit history and theft-recovery assistance.",
      icon: <Box className="w-10 h-10 text-accent" />,
      imageUrl: "https://picsum.photos/seed/safe6/600/400",
      imageHint: "gps asset tracker",
      theme: "bg-accent/5 border-accent/20",
    },
    {
      id: "neighborhood-surveillance",
      title: "Neighborhood Surveillance",
      shortNote: "AI-powered community watch.",
      description: "Integrated community surveillance network that uses AI to detect suspicious activities and foster collaborative neighborhood safety protocols.",
      icon: <Eye className="w-10 h-10 text-[#20603D]" />,
      imageUrl: "https://picsum.photos/seed/safe7/600/400",
      imageHint: "neighborhood security camera",
      theme: "bg-[#20603D]/5 border-[#20603D]/20",
    }
  ];

  const handleGetStarted = (serviceId: string) => {
    localStorage.setItem('temp_initial_service', serviceId);
    router.push(`/onboarding?id=${serviceId}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mb-16 animate-fade-in text-center mx-auto">
            <Badge variant="outline" className="mb-4 px-3 py-1 border-primary text-primary font-bold text-xs uppercase tracking-widest bg-primary/5">
              Secure Your Piece of Tomorrow
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline font-extrabold mb-6 tracking-tighter leading-tight">
              Our <span className="text-gradient">Core Services</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
              SafeRwanda offers a specialized suite of protection services designed to integrate seamlessly into your life and community infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div 
                key={service.id} 
                className={`group relative flex flex-col overflow-hidden rounded-[2rem] border transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${service.theme}`}
              >
                <div className="relative h-80 w-full overflow-hidden">
                  <Image
                    src={service.imageUrl}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-1000 brightness-[0.7] saturate-[0.8]"
                    data-ai-hint={service.imageHint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                  <div className="absolute top-6 left-6 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                    {service.icon}
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-grow">
                  <Badge variant="secondary" className="w-fit mb-3 text-[10px] uppercase font-bold tracking-widest bg-primary/10 text-primary border-none">
                    {service.shortNote}
                  </Badge>
                  <h3 className="text-2xl font-headline font-extrabold mb-3 tracking-tight">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 font-light leading-relaxed flex-grow">
                    {service.description}
                  </p>
                  <Button 
                    onClick={() => handleGetStarted(service.id)}
                    className="w-full h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 group"
                  >
                    Get Started <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
