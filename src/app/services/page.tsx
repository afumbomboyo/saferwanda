
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Shield, Heart, Flame, Home, Box, Eye, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/app/lib/placeholder-images';

export default function ServicesPage() {
  const router = useRouter();

  const services = [
    {
      id: "child-protection",
      title: "Child Protection",
      shortNote: "Real-time school tracking & SOS alerts.",
      description: "Our child safety infrastructure integrates high-precision GPS wearables with a centralized monitoring node. Parents receive instant geofencing alerts, safe-commute tracking, and one-touch SOS distress signals.",
      icon: <Shield className="w-10 h-10 text-accent" />,
      imageUrl: PlaceHolderImages.find(img => img.id === 'child-protection')?.imageUrl || "https://picsum.photos/seed/child/600/400",
      imageHint: "child safety tracker",
      theme: "bg-primary/5 border-primary/20",
    },
    {
      id: "elderly-care",
      title: "Elderly Care",
      shortNote: "Health vitals & fall detection mesh.",
      description: "Advanced monitoring systems for seniors that track heart rate, blood pressure, and movement. Our AI-driven fall detection automatically notifies designated family nodes the moment an incident is detected.",
      icon: <Heart className="w-10 h-10 text-primary" />,
      imageUrl: PlaceHolderImages.find(img => img.id === 'elderly-care')?.imageUrl || "https://picsum.photos/seed/elder/600/400",
      imageHint: "elderly health monitor",
      theme: "bg-accent/5 border-accent/20",
    },
    {
      id: "fire-prevention",
      title: "Fire Prevention",
      shortNote: "Thermal leak & gas detection protocols.",
      description: "Industrial-grade thermal sensors and gas leak detectors providing 24/7 protection. Our IoT mesh sends instant thermal warnings to prevent outbreaks before they escalate into dangerous fires.",
      icon: <Flame className="w-10 h-10 text-destructive" />,
      imageUrl: PlaceHolderImages.find(img => img.id === 'fire-prevention')?.imageUrl || "https://picsum.photos/seed/fire/600/400",
      imageHint: "fire safety system",
      theme: "bg-destructive/5 border-destructive/20",
    },
    {
      id: "property-security",
      title: "Property Security",
      shortNote: "Smart locks & perimeter breach audit.",
      description: "Comprehensive residential security including connected smart locks, perimeter breach sensors, and an intelligent entry log. Control access to your premise from anywhere in the world.",
      icon: <Home className="w-10 h-10 text-primary" />,
      imageUrl: PlaceHolderImages.find(img => img.id === 'property-security')?.imageUrl || "https://picsum.photos/seed/home/600/400",
      imageHint: "home security cameras",
      theme: "bg-primary/5 border-primary/20",
    },
    {
      id: "asset-protection",
      title: "Asset Protection",
      shortNote: "Hardware tracking for high-value nodes.",
      description: "Securing your equipment and vehicles with ruggedized, long-life tracking hardware. Monitor transit paths and set digital perimeters for high-value assets across the national network.",
      icon: <Box className="w-10 h-10 text-accent" />,
      imageUrl: PlaceHolderImages.find(img => img.id === 'asset-protection')?.imageUrl || "https://picsum.photos/seed/asset/600/400",
      imageHint: "gps asset tracker",
      theme: "bg-accent/5 border-accent/20",
    },
    {
      id: "neighborhood-surveillance",
      title: "Neighborhood Surveillance",
      shortNote: "Collaborative pattern detection network.",
      description: "Join a decentralized community safety net. We deploy neighborhood-wide monitoring nodes that use AI pattern detection to flag suspicious activity to shared community watch groups.",
      icon: <Eye className="w-10 h-10 text-rwanda-green" />,
      imageUrl: PlaceHolderImages.find(img => img.id === 'neighborhood-surveillance')?.imageUrl || "https://picsum.photos/seed/neighborhood/600/400",
      imageHint: "neighborhood security camera",
      theme: "bg-rwanda-green/5 border-rwanda-green/20",
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
              SafeRwanda offers specialized protection tiers engineered for modern safety needs. Select a primary service to begin your onboarding.
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
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
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
