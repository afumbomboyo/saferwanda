
"use client"

import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Shield, Heart, Flame, Home, Box, Eye, ArrowRight, Network } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function ServicesPage() {
  const router = useRouter();

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

  const services = [
    {
      id: "child-protection",
      title: "Protect Your Child",
      shortNote: "Smart wearables for school safety.",
      description: "Option 1: Real-time tracking and geofencing for safe school commutes. Includes a one-touch SOS panic button for immediate distress alerts and a silent audio callback to instantly hear your child’s surroundings.<br/> Option 2: Option 1 + Advanced health monitoring for temperature and oxygen saturation, specifically targeting early malaria detection.",
      icon: <Shield className="w-10 h-10 text-accent" />,
      imageUrl: "/images/child.png",
      imageHint: "child safety tracker",
      theme: "bg-primary/5 border-primary/20",
      accentColor: "text-accent"
    },
    {
      id: "elderly-care",
      title: "Elderly Care",
      shortNote: "Fall detection & health monitors.",
      description: "Dedicated fall detection and health monitoring for seniors. Features automatic alerts for body temperature, blood pressure, and heart rate irregularities, instantly notifying family contacts.",
      icon: <Heart className="w-10 h-10 text-primary" />,
      imageUrl: "/images/elder.png",
      imageHint: "elderly health monitor",
      theme: "bg-accent/5 border-accent/20",
      accentColor: "text-primary"
    },
    {
      id: "fire-prevention",
      title: "Fire Prevention",
      shortNote: "Smart thermal & gas sensors.",
      description: "Advanced gas, thermal, and humidity sensors that continuously monitor surroundings to deliver instant feedback on leakage warnings, high temperatures, and active fire outbreaks.",
      icon: <Flame className="w-10 h-10 text-red-500" />,
      imageUrl: "/images/fire.png",
      imageHint: "fire safety system",
      theme: "bg-red-500/5 border-red-500/20",
      accentColor: "text-red-500"
    },
    {
      id: "property-security",
      title: "Property Security",
      shortNote: "Connected smart locks & sensors.",
      description: "Comprehensive home intrusion detection featuring smart locks, perimeter breach detectors, and intelligent entry logs for residences and secure compounds.",
      icon: <Home className="w-10 h-10 text-primary" />,
      imageUrl: "https://mecsecurity.com/news/wp-content/uploads/2018/11/6.jpg",
      imageHint: "home security cameras",
      theme: "bg-primary/5 border-primary/20",
      accentColor: "text-primary"
    },
    {
      id: "asset-protection",
      title: "Asset Protection",
      shortNote: "High-precision hardware tracking.",
      description: "Robust tracking nodes built to safeguard high-value equipment and vehicles with real-time GPS precision and movement history analytics.",
      icon: <Box className="w-10 h-10 text-accent" />,
      imageUrl: "https://i5.walmartimages.com/seo/EON-Odyssey-18-Month-Long-Life-GPS-Tracker-Vehicles-Assets-Fleet-Hidden-Magnetic-GPS-Tracking-Device-Track-Years-Single-Charge-4G-LTE-Real-Time-Track_ddc51730-ff5f-4363-afc6-70c6686ebb84.bb45370a23c0677c87767a2e8b848bf3.jpeg?odnHeight=328&odnWidth=328&odnBg=FFFFFF",
      imageHint: "gps asset tracker",
      theme: "bg-accent/5 border-accent/20",
      accentColor: "text-accent"
    },
    {
      id: "neighborhood-surveillance",
      title: "Neighborhood Surveillance",
      shortNote: "AI-powered community watch.",
      description: "Decentralized network gateway monitoring nodes linking neighborhood watch loops together, using AI to detect suspicious patterns and alert officers.",
      icon: <Eye className="w-10 h-10 text-[#20603D]" />,
      imageUrl: "https://images.unsplash.com/photo-1589935447067-5531094415d1?w=800&auto=format&fit=crop&q=80",
      imageHint: "neighborhood security camera",
      theme: "bg-[#20603D]/5 border-[#20603D]/20",
      accentColor: "text-[#20603D]"
    },
    {
      id: "smart-community",
      title: "Smart Community Integration",
      description: "Scalable urban IoT applications, including smart lighting, waste analytics, water hygiene and environmental hazard tracking.",
      icon: <Network className="w-10 h-10 text-[#20603D]" />,
      imageUrl: "/images/smart-community.png",
      imageHint: "smart city infrastructure",
      shortNote: "Scalable urban IoT solutions.",
      theme: "bg-[#20603D]/5 border-[#20603D]/20",
      accentColor: "text-[#20603D]"
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
          <div className="max-w-4xl mb-16 animate-reveal text-center mx-auto">
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
            {services.map((service, idx) => (
              <div 
                key={service.id} 
                className={`group relative flex flex-col overflow-hidden rounded-[2rem] border transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 animate-reveal ${service.theme}`}
                style={{ animationDelay: `${idx * 0.1}s` }}
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
                  <p className="text-sm text-muted-foreground mb-6 font-light leading-relaxed flex-grow" dangerouslySetInnerHTML={{ __html: service.description }} />
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
