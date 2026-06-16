import Image from 'next/image';
import Navbar from '@/components/navbar';
import {PlaceHolderImages} from '@/app/lib/placeholder-images';
import {Shield, Heart, Flame, Home, Box, Eye, Network} from 'lucide-react';

export default function ServicesPage() {
  const services = [
    {
      id: "child-protection",
      title: "Child Protection",
      description: "Smart wearables and geo-fencing solutions to ensure your children are always within reach and safe.",
      icon: <Shield className="w-8 h-8 text-accent" />,
      image: PlaceHolderImages.find(img => img.id === 'child-protection'),
      size: "bento-large"
    },
    {
      id: "elderly-care",
      title: "Elderly Care",
      description: "Dedicated fall detection and health monitoring for your loved ones, with direct emergency response.",
      icon: <Heart className="w-8 h-8 text-primary" />,
      image: PlaceHolderImages.find(img => img.id === 'elderly-care'),
      size: "bento-wide"
    },
    {
      id: "fire-prevention",
      title: "Fire Prevention",
      description: "Advanced thermal sensors and autonomous suppression systems to stop fire before it spreads.",
      icon: <Flame className="w-8 h-8 text-accent" />,
      image: PlaceHolderImages.find(img => img.id === 'fire-prevention'),
      size: "bento-normal"
    },
    {
      id: "property-security",
      title: "Property Security",
      description: "Comprehensive home intrusion detection and 24/7 armed response coordination.",
      icon: <Home className="w-8 h-8 text-primary" />,
      image: PlaceHolderImages.find(img => img.id === 'property-security'),
      size: "bento-normal"
    },
    {
      id: "asset-protection",
      title: "Asset Protection",
      description: "High-value asset tracking and secure storage solutions for your most precious belongings.",
      icon: <Box className="w-8 h-8 text-accent" />,
      image: PlaceHolderImages.find(img => img.id === 'asset-protection'),
      size: "bento-normal"
    },
    {
      id: "neighborhood-surveillance",
      title: "Neighborhood Surveillance",
      description: "AI-powered cameras that detect suspicious patterns and alert community safety officers.",
      icon: <Eye className="w-8 h-8 text-primary" />,
      image: PlaceHolderImages.find(img => img.id === 'neighborhood-surveillance'),
      size: "bento-wide"
    },
    {
      id: "smart-community",
      title: "Smart Community Integration",
      description: "Unifying various security protocols into a single, cohesive dashboard for community leaders.",
      icon: <Network className="w-8 h-8 text-accent" />,
      image: PlaceHolderImages.find(img => img.id === 'smart-community'),
      size: "bento-normal"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-extrabold mb-4">Our Core Services</h1>
            <p className="text-base md:text-lg text-muted-foreground">
              SafeRwanda offers a specialized suite of protection services designed to integrate seamlessly into your life and community.
            </p>
          </div>

          <div className="bento-grid">
            {services.map((service) => (
              <div 
                key={service.id} 
                className={`group relative overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 ${service.size}`}
              >
                <div className="absolute inset-0 z-0">
                  {service.image && (
                    <Image
                      src={service.image.imageUrl}
                      alt={service.image.description}
                      fill
                      className="object-cover opacity-20 group-hover:scale-110 transition-transform duration-700"
                      data-ai-hint={service.image.imageHint}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                </div>
                
                <div className="relative z-10 p-6 md:p-8 flex flex-col h-full justify-end">
                  <div className="mb-4 inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-secondary/80 backdrop-blur-sm border border-border group-hover:border-primary transition-colors">
                    {service.icon}
                  </div>
                  <h3 className="text-xl md:text-2xl font-headline font-bold mb-2 md:mb-3">{service.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
