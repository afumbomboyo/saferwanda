import Image from 'next/image';
import { PlaceHolderImages } from '@/app/lib/placeholder-images';
import { Shield, Heart, Flame, Home, Box, Eye, Network, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ServicesPage() {
  const services = [
    {
      id: "child-protection",
      title: "Protect Your Child",
      description: "Smart wearables and geo-fencing solutions to ensure your children are always within reach and safe.",
      icon: <Shield className="w-10 h-10 text-accent" />,
      image: PlaceHolderImages.find(img => img.id === 'child-protection'),
      className: "md:col-span-2 md:row-span-2",
      theme: "bg-primary/5 border-primary/20"
    },
    {
      id: "elderly-care",
      title: "Elderly Care",
      description: "Dedicated fall detection and health monitoring for your loved ones.",
      icon: <Heart className="w-10 h-10 text-primary" />,
      image: PlaceHolderImages.find(img => img.id === 'elderly-care'),
      className: "md:col-span-1 md:row-span-1",
      theme: "bg-accent/5 border-accent/20"
    },
    {
      id: "fire-prevention",
      title: "Fire Prevention",
      description: "Advanced thermal sensors and autonomous suppression systems.",
      icon: <Flame className="w-10 h-10 text-red-500" />,
      image: PlaceHolderImages.find(img => img.id === 'fire-prevention'),
      className: "md:col-span-1 md:row-span-1",
      theme: "bg-red-500/5 border-red-500/20"
    },
    {
      id: "property-security",
      title: "Property Security",
      description: "Comprehensive home intrusion detection and response coordination.",
      icon: <Home className="w-10 h-10 text-primary" />,
      image: PlaceHolderImages.find(img => img.id === 'property-security'),
      className: "md:col-span-1 md:row-span-1",
      theme: "bg-primary/5 border-primary/20"
    },
    {
      id: "asset-protection",
      title: "Asset Protection",
      description: "High-value asset tracking and secure storage solutions.",
      icon: <Box className="w-10 h-10 text-accent" />,
      image: PlaceHolderImages.find(img => img.id === 'asset-protection'),
      className: "md:col-span-1 md:row-span-1",
      theme: "bg-accent/5 border-accent/20"
    },
    {
      id: "neighborhood-surveillance",
      title: "Neighborhood Surveillance",
      description: "AI-powered cameras that detect suspicious patterns and alert community safety officers.",
      icon: <Eye className="w-10 h-10 text-[#20603D]" />,
      image: PlaceHolderImages.find(img => img.id === 'neighborhood-surveillance'),
      className: "md:col-span-2 md:row-span-1",
      theme: "bg-[#20603D]/5 border-[#20603D]/20"
    },
    {
      id: "smart-community",
      title: "Smart Community Integration",
      description: "Unifying various security protocols into a single, cohesive dashboard.",
      icon: <Network className="w-10 h-10 text-[#20603D]" />,
      image: PlaceHolderImages.find(img => img.id === 'smart-community'),
      className: "md:col-span-1 md:row-span-1",
      theme: "bg-[#20603D]/5 border-[#20603D]/20"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mb-16 animate-fade-in">
            <Badge variant="outline" className="mb-4 px-3 py-1 border-primary text-primary font-bold text-xs uppercase tracking-widest">
              Strategic Security
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline font-extrabold mb-6 tracking-tighter leading-tight">
              Our <span className="text-gradient">Core Services</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl leading-relaxed">
              SafeRwanda offers a specialized suite of protection services designed to integrate seamlessly into your life and community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[300px] gap-6">
            {services.map((service) => (
              <div 
                key={service.id} 
                className={`group relative overflow-hidden rounded-[2.5rem] border transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${service.className} ${service.theme}`}
              >
                {/* Background Image Container */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  {service.image && (
                    <Image
                      src={service.image.imageUrl}
                      alt={service.image.description}
                      fill
                      className="object-cover opacity-30 saturate-[0.8] brightness-[0.4] group-hover:scale-105 group-hover:opacity-40 transition-all duration-1000"
                      data-ai-hint={service.image.imageHint}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                </div>
                
                {/* Content */}
                <div className="relative z-10 p-8 flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start">
                    <div className="p-4 rounded-2xl bg-background/50 backdrop-blur-md border border-white/10 group-hover:border-primary/50 transition-colors duration-300">
                      {service.icon}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                      <ArrowUpRight className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-headline font-extrabold mb-4 leading-none tracking-tighter text-white">
                      {service.title}
                    </h3>
                    <p className="text-sm md:text-base text-white/70 font-light leading-relaxed max-w-sm">
                      {service.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
