'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useUser, useFirestore, useAuth } from '@/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { 
  Shield, 
  Loader2, 
  Settings, 
  Bell, 
  Activity, 
  Smartphone, 
  Download, 
  CheckCircle2, 
  AlertTriangle,
  Mail,
  Phone,
  Wrench,
  Wifi,
  Zap,
  Target,
  LayoutDashboard,
  ShoppingCart,
  Plus,
  ChevronLeft,
  FileText,
  Info,
  MapPin,
  User as UserIcon,
  Navigation,
  CreditCard,
  Heart,
  Signal,
  Tag,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

// Device details for the shop
const DEVICE_CATALOG: Record<string, any> = {
  "child-protection": {
    name: "SafeWatch Pro",
    standardImages: [
      "/images/Child-GPS-Device.png",
      "/images/Child-GPS-Device-Features.png",
      "/images/Child-GPS-Device-Label.png"
    ],
    advancedImages: [
      "/images/Child-GPS-&-Health-Monitoring-Device.png",
      "/images/Child-GPS-&-Health-Monitoring-Device-Features.png",
      "/images/Child-GPS-&-Health-Monitoring-Device-Label.png"
    ],
    standardBuyPrice: "76,500 RWF",
    standardLeasePrice: "38,250 RWF",
    advancedBuyPrice: "112,000 RWF",
    advancedLeasePrice: "56,000 RWF",
    standardDescription: "Give your loved ones the ultimate safety protection with the Y41 4G Mini GPS Tracker! Featuring adjustable fall down alerts, one-click SOS, real-time triple positioning and all-day two-way calls, it’s the perfect guardian for elders and kids. With IP67 waterproof, 5-6 days long battery life, wearable design and offers worry-free 24/7 monitoring.",
    standardFeatures: [
      "Multi-network & Triple Precise Positioning (GPS+LBS+WiFi)",
      "Intelligent Safety Alerts (Fall Detection, SOS, Medicine)",
      "Two-way Voice Communication & Safe Calling",
      "IP67 Waterproof & Durable Build",
      "Long Battery Life (5-6 days) & Safe Charging",
      "Compact Wearable Design (37.3g)",
      "Lifetime Free APP & Smart Management",
      "One-button SOS Emergency Operation"
    ],
    standardSpecifications: {
      "Chipset": "ASR3603S",
      "Material": "PC+ABS+Silicon",
      "Size": "51.80*41.20*15.60mm",
      "Weight": "37.3g",
      "Positioning": "GPS+LBS+Wifi hotspots",
      "Battery": "1000mAh polymer",
      "Network": "4G/3G/2G",
      "Sim": "Nano sim",
      "Waterproof": "IP67",
      "Working Time": "5-6 days",
      "Accuracy": "< 5M",
      "Charging": "1m magnetic"
    },
    standardFaq: [
      { q: "What devices is the Y41 suitable for?", a: "It's ideal for elders, kids and personal asset tracking; with 37.3g ultra-light weight and multiple options." },
      { q: "How does the emergency SOS work?", a: "Press and hold the one-key Power/SOS button for emergency calls to preset contacts." },
      { q: "How long does the battery last?", a: "Built-in 1000mAh polymer battery, normal use lasts 5-6 days." }
    ],
    advancedDescription: "Give your kids the gift of safety, connection and smart living! Choose the Y48 4G Student Smart Watch—with precise GPS tracking, 24/7 health monitoring, parental control and free valuable perks. Order today and let every day be a safe, fun adventure for your little ones!",
    advancedFeatures: [
      "4G Full-Network Connectivity & Detachable Design",
      "High-Precision Real-Time Positioning & Geo-Fence",
      "24/7 All-Round Health Monitoring (HR, BP, SPO2)",
      "Intensive Parental Control & Safety Protection",
      "HD Communication & Interactive Functions",
      "Durable Hardware & Practical Daily Functions"
    ],
    advancedSpecifications: {
      "Chipset": "ASR8601C",
      "OS": "Android 8.1",
      "Positioning": "GPS+LBS+Wifi",
      "Battery": "730mAh polymer",
      "Memory": "1GB+8GB",
      "Network": "4G/3G/2G",
      "Camera": "2M",
      "Screen": "1.76\" IPS (368*448px)",
      "Waterproof": "IP67",
      "Colors": "Black, Blue, Pink"
    },
    advancedFaq: [
      { q: "Does it support global 4G networks?", a: "Yes, it's compatible with mainstream 4G frequency bands worldwide, enabling stable calls and data transmission in most countries and regions." },
      { q: "How to set the geo-fence and get safety alerts?", a: "Connect your device to this platform, customize safe zones (home/school); instant push alerts will be sent to your phone once the wearer crosses the fence." },
      { q: "Is the watch waterproof, and can it be worn while swimming?", a: "It has daily waterproof & shockproof performance (resists splashes/sweating/collisions), but is not suitable for swimming, bathing or long-time water immersion." },
      { q: "What free accessories are included with the purchase?", a: "Each order comes with a complimentary EU/UL charger, dock station, tempered glass screen protector and cleaning wipes with no extra cost." },
      { q: "How does the class mode work, and can it be remotely set?", a: "Yes, set multi-period class mode via your dashboard on this platform, after connecting the device. It disables non-essential functions (avoid classroom distractions), and functions recover automatically after class." }
    ]
  },
  "elderly-care": {
    name: "SafeLink D44S GPS Watch",
    images: [
      "/images/Elderly-Health-Monitoring-Device.png",
      "/images/Elderly-Health-Monitoring-Device-Features.png",
      "/images/Elderly-Health-Monitoring-Device-Label.png"
    ],
    buyPrice: "85,000 RWF",
    leasePrice: "42,500 RWF",
    description: "The D44S 4G elderly GPS watch is tailored for seniors' safety and health, featuring IP67 waterproofing, 4G full-network connectivity, and GPS+LBS+WiFi triple positioning (≤5M). It highlights a medicine reminder, SOS emergency call, heart rate monitoring, and 830mAh long battery life.",
    specifications: {
      "Color": "Black only",
      "Chipset": "ASR3603S",
      "Material": "PC+ABS",
      "Operation System": "RT system",
      "Positioning": "GPS+LBS+WiFi hotspots",
      "Battery Capacity": "830mAh polymer",
      "Charging Time": "4-5 hours",
      "Battery Life": "2-3 days",
      "Memory": "128MB+128MB",
      "Network": "4G/3G/2G",
      "Waterproof": "IP67",
      "Screen": "1.83inch IPS (240*284px)"
    },
    features: [
      "All-Round Health Monitoring (HR, BP, SPO2, Temp)",
      "Precise Multi-Mode Positioning (GPS+WiFi+LBS)",
      "3-second Long-Press SOS Button",
      "Fall Down Detection with Alerts",
      "Customizable Medicine Reminders",
      "Two-way Voice/Video Calls",
      "Unknown Call Rejection",
      "Remote Snapshot/Caregiver Control"
    ],
    faq: [
      { q: "How does the SOS button work?", a: "Press and hold for 3 seconds to auto-dial pre-set contacts and send SMS alerts." },
      { q: "What metrics does it track?", a: "Real-time heart rate, blood pressure, oxygen (SPO2), and body temperature." },
      { q: "Can it detect falls?", a: "Yes, it triggers immediate SMS alerts to contacts and the caregiver app." }
    ]
  },
  "fire-prevention": {
    name: "SafeGuard Methane LW302D-CH4",
    images: [
      "/images/ZoneWu-LoRa-CH4-Sensor.png",
      "/images/ZoneWu-LoRa-CH4-Sensor-Label.png"
    ],
    buyPrice: "325,000 RWF",
    leasePrice: "162,500 RWF",
    description: "Core Technical Specifications: Model LW302D-CH4 Target Gas Parameter: Methane (CH₄) / Natural Gas. The sensor employs a Non-Dispersive Infrared (NDIR) core design, enabling precise detection without oxygen reliance. Industrial-grade polycarbonate enclosure with anti-corrosion layer suitable for long-term harsh environments.",
    features: [
      "Zero Oxygen Reliance NDIR Detection",
      "Cross-Interference Mitigation industrial metal diffusion",
      "Native LoRaWAN Class A Protocol",
      "Rugged Polycarbonate Enclosure",
      "Dual-mode DC and Internal Power Options",
      "Industrial safety & Municipal pipeline ready",
      "Integrated Temp and Humidity secondary metrics",
      "Type-C Engineering Hub interface"
    ],
    specifications: {
      "Model": "LW302D-CH4",
      "Target Gas": "Methane (CH4) / Natural Gas",
      "Measuring Range": "0 ~ 100% LEL",
      "Accuracy": "±3% Full Scale",
      "Resolution": "1 ppm (0.1% LEL)",
      "Mechanism": "Non-Dispersive Infrared (NDIR)",
      "Temp Range": "-20°C to 60°C (±0.3°C)",
      "Humidity": "0 to 99.9% RH",
      "Wireless": "LoRaWAN Class A (EU868/US915/AS923)",
      "Enclosure": "Polycarbonate with wall-mount ears",
      "Antenna": "Internal Embedded Subsystem",
      "Interface": "Type-C Engineering Hub"
    }
  },
  "property-security": {
    name: "SafeGuard Smart Lock",
    images: ["https://picsum.photos/seed/prop1/600/400"],
    buyPrice: "55,000 RWF",
    leasePrice: "5,000 RWF",
    description: "A secure smart lock for your main gate and doors.",
    features: ["Remote Unlock", "Entry Logs", "Tamper Alerts", "Bluetooth Connectivity"]
  },
  "asset-protection": {
    name: "SafeTrack Asset",
    images: ["https://picsum.photos/seed/asset1/600/400"],
    buyPrice: "60,000 RWF",
    leasePrice: "5,500 RWF",
    description: "A heavy-duty GPS tracker for vehicles and high-value equipment.",
    features: ["4G LTE Tracking", "Movement History", "Magnetic Mount", "Long Battery Life"]
  },
  "neighborhood-surveillance": {
    name: "SafeMesh Hub",
    images: ["https://picsum.photos/seed/neigh1/600/400"],
    buyPrice: "75,000 RWF",
    leasePrice: "7,000 RWF",
    description: "A security hub that connects you with your neighbors' safety network.",
    features: ["Community Alerts", "Camera Integration", "Emergency Broadcast", "Night Vision Support"]
  },
  "smart-community": {
    name: "SafeCity Node",
    images: ["https://picsum.photos/seed/smart1/600/400"],
    buyPrice: "85,000 RWF",
    leasePrice: "8,000 RWF",
    description: "A community device for smart street lighting and hazard tracking.",
    features: ["Streetlight Control", "Waste Analytics", "Environmental Sensors", "Mesh Network"]
  }
};

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState<string>(searchParams.get('tab') || 'overview');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [childOption, setChildOption] = useState<'option1' | 'option2' | null>(null);
  const [stagingStep, setStagingStep] = useState<'list' | 'instructions' | 'child-options' | 'get-device' | 'checkout' | 'setup'>('list');

  const [deviceIdInput, setDeviceIdInput] = useState('');
  const [deviceNameInput, setDeviceNameInput] = useState('');
  const [alertPhone, setAlertPhone] = useState('');
  const [alertEmail, setAlertEmail] = useState('');
  const [subType, setSubType] = useState('monthly');

  // Checkout Form State
  const [checkoutData, setCheckoutData] = useState({
    fullName: '',
    email: '',
    phone: '',
    province: '',
    district: '',
    sector: '',
    cell: '',
    village: '',
    street: '',
    buildingNo: '',
    country: 'Rwanda',
    quantity: 1,
    color: ''
  });
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [tempSelection, setTempSelection] = useState<'purchased' | 'leased' | null>(null);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    if (!loading && !userLoading) {
      const timer = setTimeout(() => {
        const revealElements = document.querySelectorAll('.animate-reveal');
        revealElements.forEach((el) => {
          el.classList.add('reveal-visible');
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeTab, stagingStep, loading, userLoading]);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.replace('/auth');
      return;
    }
    const fetchProfile = async () => {
      try {
        if (!db) return;
        const docRef = doc(db, 'users', user.uid);
        const res = await getDoc(docRef);
        if (res.exists()) {
          const data = res.data();
          setProfile(data);
          setAlertEmail(data.alertEmail || user.email || '');
          setAlertPhone(data.alertPhone || '');
          setDeviceIdInput(data.deviceId || '');
          setDeviceNameInput(data.deviceName || '');
          setCheckoutData(prev => ({
            ...prev,
            fullName: data.fullName || '',
            email: data.email || ''
          }));
        } else {
          router.replace('/onboarding');
        }
      } catch (err) {
        console.error("Dashboard profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, userLoading, db, router]);

  const updateProfileData = async (newData: any) => {
    if (!user || !db) return;
    setUpdating(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, newData);
      setProfile((prev: any) => ({ ...prev, ...newData }));
      if (newData.deviceId) {
        setIsRegisterOpen(false);
        setIsSubscriptionOpen(true);
      }
    } catch (err) {
      console.error("Update error:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeviceSelection = (status: 'purchased' | 'leased') => {
    setTempSelection(status);
    setStagingStep('checkout');
  };

  const handleGetCurrentLocation = () => {
    setIsLocating(true);
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const isInRwanda = latitude >= -2.84 && latitude <= -1.04 && longitude >= 28.86 && longitude <= 30.89;
        
        if (!isInRwanda) {
          setLocationError("current location not in Rwanda");
        } else {
          setCheckoutData(prev => ({
            ...prev,
            province: "Kigali City",
            district: "Nyarugenge",
            sector: "Nyarugenge",
            cell: "Kiyovu",
            village: "Ubumwe",
            street: "KN 2 St",
            buildingNo: "M. Peace Plaza"
          }));
          setLocationError(null);
        }
        setIsLocating(false);
      },
      (error) => {
        setLocationError("Unable to retrieve location. Please check your permissions.");
        setIsLocating(false);
      }
    );
  };

  const handleCompleteCheckout = () => {
    if (tempSelection) {
      updateProfileData({ 
        purchaseStatus: tempSelection, 
        hasPaidSetupFee: tempSelection === 'purchased',
        deliveryInfo: checkoutData
      });
      setStagingStep('setup');
    }
  };

  const handleDownloadGuide = () => {
    toast({
      title: "Generating Technical Guide",
      description: "Preparing your branded deployment manual...",
    });

    setTimeout(() => {
      const pdfContent = `
        SafeRwanda Technical Deployment Guide
        --------------------------------------
        Service: ${selectedServiceId?.replace('-', ' ')}
        Hardware Node ID: [Awaiting Activation]
        
        Steps:
        1. Tactical Positioning
        2. Signal Validation
        3. Network Link Initiation
        4. Central Monitoring Grid Sync
      `;
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SafeRwanda-${selectedServiceId}-Guide.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Complete",
        description: "Your guide has been successfully generated.",
      });
    }, 1500);
  };

  const getSelectedDeviceData = () => {
    if (!selectedServiceId) return null;
    const baseData = DEVICE_CATALOG[selectedServiceId];
    if (selectedServiceId !== 'child-protection') return baseData;

    if (childOption === 'option1') {
      return {
        ...baseData,
        buyPrice: baseData.standardBuyPrice,
        leasePrice: baseData.standardLeasePrice,
        description: baseData.standardDescription,
        features: baseData.standardFeatures,
        specifications: baseData.standardSpecifications,
        faq: baseData.standardFaq,
        images: baseData.standardImages
      };
    } else {
      return {
        ...baseData,
        buyPrice: baseData.advancedBuyPrice,
        leasePrice: baseData.advancedLeasePrice,
        description: baseData.advancedDescription,
        features: baseData.advancedFeatures,
        specifications: baseData.advancedSpecifications,
        faq: baseData.advancedFaq,
        images: baseData.advancedImages
      };
    }
  };

  const activeDeviceData = getSelectedDeviceData();

  // Color options logic
  const getColorOptions = () => {
    if (selectedServiceId === 'elderly-care') return ['Black'];
    if (selectedServiceId === 'fire-prevention') return ['Cream White'];
    if (selectedServiceId === 'child-protection') {
      if (childOption === 'option1') return ['Silver on Black'];
      if (childOption === 'option2') return ['Black'];
    }
    return ['Black', 'White', 'Silver'];
  };

  if (loading || userLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Loading Your Security Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <main className="flex-grow pt-32 pb-24 relative z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center border border-primary/20 shadow-2xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={cn(
                    "font-black uppercase tracking-widest text-[8px] px-2 py-0.5",
                    profile?.subscriptionActive ? "border-rwanda-green text-rwanda-green bg-rwanda-green/5" : "border-amber-500 text-amber-500 bg-amber-500/5"
                  )}>
                    {profile?.subscriptionActive ? 'Monitoring Active' : 'Waiting for Start'}
                  </Badge>
                  {profile?.deviceId && (
                    <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 font-black uppercase tracking-widest text-[8px]">
                      {profile.deviceName || 'Device Connected'}
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-headline font-black tracking-tight leading-none">Security Center</h1>
                <p className="text-muted-foreground text-xs mt-1 uppercase tracking-[0.2em] font-bold opacity-60">Welcome, {profile?.fullName || 'User'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-secondary/30 backdrop-blur-xl p-2 rounded-[1.5rem] border border-border shadow-inner">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl"><Bell className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl"><Settings className="w-4 h-4" /></Button>
              <div className="h-6 w-px bg-border mx-1" />
              
              <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-xl font-bold px-6 h-10 gap-2 bg-primary hover:bg-primary/90 shadow-lg">
                    <Plus className="w-4 h-4" />
                    Connect Device
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] sm:max-w-[520px] p-0 border-border/50 bg-background shadow-2xl rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden">
                  <ScrollArea className="max-h-[95vh] w-full">
                    <div className="relative p-6 sm:p-10 pt-12">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-rwanda-green" />
                      <DialogHeader className="mb-8">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Smartphone className="w-7 h-7 text-primary" />
                          </div>
                          <div>
                            <DialogTitle className="text-3xl font-black tracking-tight leading-none">Connect Device</DialogTitle>
                            <DialogDescription className="text-sm mt-2 opacity-70">
                              Enter the details from your device to start receiving safety alerts.
                            </DialogDescription>
                          </div>
                        </div>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <Label htmlFor="deviceName" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Device Name</Label>
                          <div className="relative">
                            <Input 
                              id="deviceName" 
                              placeholder="e.g. Living Room Sensor" 
                              value={deviceNameInput} 
                              onChange={(e) => setDeviceNameInput(e.target.value)}
                              className="h-16 rounded-2xl border-border bg-secondary/30 px-6 pl-12"
                            />
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="actualNodeId" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Node Identification</Label>
                          <Input 
                            id="actualNodeId" 
                            placeholder="SAFE-NODE-XXXX" 
                            value={deviceIdInput} 
                            onChange={(e) => setDeviceIdInput(e.target.value)}
                            className="h-16 rounded-2xl border-border bg-secondary/30 font-mono px-6"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="alertPhone" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Alert Phone Number</Label>
                            <div className="relative">
                              <Input 
                                id="alertPhone" 
                                placeholder="+250 7XX XXX XXX" 
                                value={alertPhone} 
                                onChange={(e) => setAlertPhone(e.target.value)}
                                className="h-16 rounded-2xl border-border bg-secondary/30 px-6 pl-12"
                              />
                              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="alertEmail" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Alert Email Address</Label>
                            <div className="relative">
                              <Input 
                                id="alertEmail" 
                                type="email"
                                placeholder="you@email.com" 
                                value={alertEmail} 
                                onChange={(e) => setAlertEmail(e.target.value)}
                                className="h-16 rounded-2xl border-border bg-secondary/30 px-6 pl-12"
                              />
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-10">
                        <Button 
                          onClick={() => updateProfileData({ 
                            deviceId: deviceIdInput, 
                            deviceName: deviceNameInput,
                            alertPhone, 
                            alertEmail 
                          })}
                          className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-sm"
                          disabled={updating || !deviceIdInput || !deviceNameInput || !alertPhone || !alertEmail}
                        >
                          {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Connect Device"}
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-12">
            <TabsList className="grid grid-cols-2 h-auto p-1.5 bg-secondary/40 rounded-[1.5rem] border border-border/50 shadow-xl">
              <TabsTrigger value="overview" className="rounded-xl py-3 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-[10px] md:text-sm">
                <LayoutDashboard className="w-4 h-4 mr-2" /> Overview
              </TabsTrigger>
              <TabsTrigger value="staging" className="rounded-xl py-3 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-[10px] md:text-sm">
                <ShoppingCart className="w-4 h-4 mr-2" /> My Services
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8 animate-reveal outline-none">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 bg-card/40 border-border rounded-[2.5rem] shadow-2xl shadow-black/5">
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-2xl font-black">Status</CardTitle>
                    <CardDescription>A live look at your security network.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                      {[
                        { label: 'Devices', val: profile?.deviceId ? '01' : '00', icon: Smartphone, color: 'text-primary' },
                        { label: 'Signal', val: profile?.deviceId ? '98%' : '0%', icon: Wifi, color: 'text-rwanda-green' },
                        { label: 'Health', val: profile?.deviceId ? 'Active' : 'Offline', icon: Activity, color: 'text-accent' },
                        { label: 'Alerts', val: '0', icon: Bell, color: 'text-muted-foreground' }
                      ].map((stat, i) => (
                        <div key={i} className="bg-secondary/20 p-6 rounded-[2rem] border border-border/50 text-center">
                          <stat.icon className={cn("w-5 h-5 mx-auto mb-3 opacity-60", stat.color)} />
                          <div className="text-3xl font-black">{stat.val}</div>
                          <div className="text-[9px] uppercase font-black tracking-widest text-muted-foreground mt-1">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20 rounded-[2.5rem] flex flex-col">
                  <CardHeader className="p-8 pb-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      <span className="text-xl font-black">Next Step</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 flex-grow flex flex-col justify-between">
                    <p className="text-sm text-muted-foreground font-light leading-relaxed">
                      {!profile?.purchaseStatus || profile?.purchaseStatus === 'none'
                        ? "You haven't set up your devices yet. Go to 'My Services' to start the process."
                        : !profile?.deviceId 
                          ? "Your hardware is being prepared. Once it arrives, use 'Connect Device' at the top."
                          : !profile?.subscriptionActive 
                            ? "Your device is connected! Now choose a plan to start the 24/7 monitoring."
                            : "Everything is set up! We are monitoring your safety around the clock."}
                    </p>
                    <Button 
                      onClick={() => {
                        if (!profile?.purchaseStatus || profile.purchaseStatus === 'none') setActiveTab('staging');
                        else if (!profile?.deviceId) setIsRegisterOpen(true);
                        else setIsSubscriptionOpen(true);
                      }}
                      className="w-full mt-6 rounded-2xl h-14 font-black uppercase tracking-widest text-xs bg-primary"
                    >
                      {(!profile?.purchaseStatus || profile.purchaseStatus === 'none') ? 'Go to My Services' : profile?.deviceId ? 'Activate Monitoring' : 'Connect Device'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="staging" className="space-y-8 outline-none">
              {stagingStep === 'list' && (
                <Card className="bg-card/60 border-border rounded-[3rem] shadow-2xl animate-reveal">
                  <CardHeader className="p-12 pb-6 border-b border-border/50">
                    <CardTitle className="text-4xl font-black">My Services</CardTitle>
                    <CardDescription className="text-lg font-light">Pick a service below to start set up.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {profile?.servicesSelected?.length > 0 ? (
                        profile.servicesSelected.map((serviceId: string) => (
                          <div key={serviceId} className="p-8 rounded-[2.5rem] border bg-background border-border shadow-sm flex flex-col justify-between hover:border-primary transition-all relative overflow-hidden">
                            <div className="relative z-10">
                              <h4 className="font-black text-xl capitalize mb-3">{serviceId.replace('-', ' ')}</h4>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-8">
                                Status: {profile?.purchaseStatus !== 'none' ? 'Hardware Pending' : 'Initialization Required'}
                              </p>
                            </div>
                            <Button 
                              onClick={() => {
                                setSelectedServiceId(serviceId);
                                setStagingStep('instructions');
                              }}
                              className="w-full rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white border-none font-black text-[10px] uppercase tracking-widest h-12"
                            >
                              Start Set Up
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full py-24 text-center border-2 border-dashed border-border rounded-[2.5rem]">
                          <h4 className="text-2xl font-black mb-2">No Services Yet</h4>
                          <p className="text-muted-foreground mb-8">You haven't picked any safety services yet.</p>
                          <Button onClick={() => router.push('/services')} className="rounded-2xl h-14 px-10 font-black bg-primary">Browse Services</Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {stagingStep === 'instructions' && selectedServiceId && (
                <Card className="max-w-4xl mx-auto rounded-[3rem] border-border bg-card/60 shadow-2xl animate-reveal">
                  <CardHeader className="p-12 pb-6 border-b border-border/50 bg-primary/5">
                    <Button variant="ghost" className="w-fit mb-6 rounded-xl gap-2 font-bold" onClick={() => setStagingStep('list')}>
                      <ChevronLeft className="w-4 h-4" /> Back to My Services
                    </Button>
                    <CardTitle className="text-4xl font-black">How it Works</CardTitle>
                    <CardDescription className="text-lg font-light mt-2">Professional guidance for your security journey.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-8">
                        <h3 className="text-2xl font-black">Steps to Install</h3>
                        <div className="space-y-6">
                           {[
                             { step: "1. Hardware Acquisition", desc: "Select whether to buy or lease your professional SafeRwanda device." },
                             { step: "2. Strategic Delivery", desc: "Your hardware is shipped via secured courier to your registered location." },
                             { step: "3. Deployment", desc: "Follow the technical guide to mount and activate your sensor node." },
                             { step: "4. Network Link", desc: "Connect your device to our 24/7 monitoring grid using your Device ID." }
                           ].map((item, i) => (
                             <div key={i} className="flex gap-4">
                               <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                 <span className="text-primary font-bold text-sm">{i+1}</span>
                               </div>
                               <div className="space-y-1">
                                 <h4 className="font-bold text-base">{item.step}</h4>
                                 <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                               </div>
                             </div>
                           ))}
                        </div>
                        <Button 
                          onClick={handleDownloadGuide}
                          className="h-16 rounded-2xl font-black uppercase tracking-widest text-xs bg-primary gap-2 w-full"
                        >
                          <Download className="w-4 h-4" /> Download Guide (PDF)
                        </Button>
                      </div>

                      <div className="bg-primary/5 rounded-[2.5rem] border border-primary/10 p-10 flex flex-col justify-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                          <ShoppingCart className="w-8 h-8 text-primary" />
                        </div>
                        <h4 className="text-2xl font-black mb-4">Start Your Protection</h4>
                        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                          Your security is our priority. Once you have reviewed the instructions, proceed to select your hardware options.
                        </p>
                        <Button 
                          onClick={() => {
                            if (selectedServiceId === 'child-protection') setStagingStep('child-options');
                            else setStagingStep('get-device');
                          }}
                          className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-sm shadow-xl"
                        >
                          Continue to Get Device
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {stagingStep === 'child-options' && (
                <div className="space-y-12 animate-reveal">
                  <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-4">
                    <Button variant="ghost" className="rounded-xl gap-2 font-bold" onClick={() => setStagingStep('instructions')}>
                      <ChevronLeft className="w-4 h-4" /> Back to Instructions
                    </Button>
                    <h2 className="text-4xl font-black">Child Protection Options</h2>
                    <p className="text-muted-foreground">Select the protection tier for your SafeWatch node.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    <Card 
                      className="group cursor-pointer hover:border-primary transition-all p-10 rounded-[2.5rem] bg-card/60 border-2 border-border shadow-xl flex flex-col justify-between"
                      onClick={() => {
                        setChildOption('option1');
                        setStagingStep('get-device');
                      }}
                    >
                      <div>
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                          <Signal className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-2xl font-black mb-4">Option 1: Standard</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Real-time tracking and geofencing for safe school commutes. Includes a one-touch SOS panic button and a silent audio callback to instantly hear your child's surroundings.
                        </p>
                      </div>
                      <Button className="mt-8 w-full rounded-xl font-bold bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white border-none">Select Option 1</Button>
                    </Card>

                    <Card 
                      className="group cursor-pointer hover:border-accent transition-all p-10 rounded-[2.5rem] bg-card/60 border-2 border-border shadow-xl flex flex-col justify-between"
                      onClick={() => {
                        setChildOption('option2');
                        setStagingStep('get-device');
                      }}
                    >
                      <div>
                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                          <Heart className="w-6 h-6 text-accent" />
                        </div>
                        <h3 className="text-2xl font-black mb-4">Option 2: Advanced</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Everything in Option 1 plus advanced health monitoring for heart rate, blood pressure, and oxygen saturation, specifically targeting early malaria detection and wellness tracking.
                        </p>
                      </div>
                      <Button className="mt-8 w-full rounded-xl font-bold bg-accent/5 text-accent group-hover:bg-accent group-hover:text-accent-foreground border-none">Select Option 2</Button>
                    </Card>
                  </div>
                </div>
              )}

              {stagingStep === 'get-device' && selectedServiceId && activeDeviceData && (
                <div className="space-y-12 animate-reveal">
                  <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-4">
                    <Button variant="ghost" className="rounded-xl gap-2 font-bold" onClick={() => {
                      if (selectedServiceId === 'child-protection') setStagingStep('child-options');
                      else setStagingStep('instructions');
                    }}>
                      <ChevronLeft className="w-4 h-4" /> Back to Selection
                    </Button>
                    <h2 className="text-4xl font-black">Get Your Device</h2>
                    <p className="text-muted-foreground">Select your hardware for {selectedServiceId.replace('-', ' ')}.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
                    {/* Buy Option */}
                    <Card className="rounded-[3.5rem] overflow-hidden border-4 border-border bg-card/60 transition-all shadow-2xl">
                      <div 
                        className="relative h-[500px] w-full cursor-pointer group" 
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest('button')) return;
                          setIsPreviewOpen(true);
                        }}
                      >
                        <Carousel className="w-full h-full">
                          <CarouselContent>
                            {activeDeviceData.images?.map((imgUrl: string, idx: number) => (
                              <CarouselItem key={idx}>
                                <div className="relative h-[500px] w-full">
                                  <Image src={imgUrl} alt={`${activeDeviceData.name} view ${idx + 1}`} fill className="object-contain" />
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          {activeDeviceData.images?.length > 1 && (
                            <>
                              <CarouselPrevious className="left-4" />
                              <CarouselNext className="right-4" />
                            </>
                          )}
                        </Carousel>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                        <div className="absolute bottom-8 left-8 pointer-events-none">
                          <h4 className="text-3xl font-black text-white">Buy Hardware</h4>
                          <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Ownership + Secured Shipping</p>
                        </div>
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-black/50 backdrop-blur-md p-2 rounded-full text-white">
                            <Maximize2 className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-10 space-y-6">
                        <p className="text-sm text-muted-foreground leading-relaxed font-bold whitespace-pre-line">{activeDeviceData.description}</p>
                        
                        {activeDeviceData.features && (
                          <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Core Features</p>
                            <ul className="grid grid-cols-1 gap-1">
                              {activeDeviceData.features.map((f: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-[10px] font-medium text-muted-foreground">
                                  <CheckCircle2 className="w-3 h-3 mt-0.5 text-rwanda-green shrink-0" />
                                  {f}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {activeDeviceData.specifications && (
                          <div className="space-y-3 bg-secondary/20 p-6 rounded-2xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                              <Info className="w-3 h-3" /> Technical Specifications
                            </p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                              {Object.entries(activeDeviceData.specifications).map(([k, v]: [any, any]) => (
                                <div key={k} className="flex flex-col">
                                  <span className="text-[8px] uppercase text-muted-foreground font-black">{k}</span>
                                  <span className="text-[10px] font-bold">{v}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="space-y-4 p-6 rounded-3xl bg-background border border-border">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quantity</Label>
                              <Select 
                                value={checkoutData.quantity.toString()} 
                                onValueChange={(v) => setCheckoutData({...checkoutData, quantity: parseInt(v)})}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 99 }, (_, i) => i + 1).map(n => (
                                    <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Color</Label>
                              <Select 
                                value={checkoutData.color} 
                                onValueChange={(v) => setCheckoutData({...checkoutData, color: v})}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Color" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getColorOptions().map(c => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="pt-4 border-t border-border flex justify-between items-center">
                            <div>
                              <p className="text-[8px] font-black uppercase text-muted-foreground">Total Amount ({checkoutData.quantity} units)</p>
                              <p className="text-2xl font-black">
                                {(parseInt(activeDeviceData.buyPrice.replace(/[^0-9]/g, '')) * checkoutData.quantity).toLocaleString()} RWF
                              </p>
                            </div>
                          </div>
                        </div>

                        <Button 
                          onClick={() => handleDeviceSelection('purchased')}
                          disabled={!checkoutData.color}
                          className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-sm bg-primary"
                        >
                          Order & Buy
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Lease Option */}
                    <Card className="rounded-[3.5rem] overflow-hidden border-4 border-border bg-card/60 transition-all shadow-2xl">
                      <div 
                        className="relative h-[500px] w-full cursor-pointer group" 
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest('button')) return;
                          setIsPreviewOpen(true);
                        }}
                      >
                        <Carousel className="w-full h-full">
                          <CarouselContent>
                            {activeDeviceData.images?.map((imgUrl: string, idx: number) => (
                              <CarouselItem key={idx}>
                                <div className="relative h-[500px] w-full">
                                  <Image src={imgUrl} alt={`${activeDeviceData.name} view ${idx + 1}`} fill className="object-contain" />
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          {activeDeviceData.images?.length > 1 && (
                            <>
                              <CarouselPrevious className="left-4" />
                              <CarouselNext className="right-4" />
                            </>
                          )}
                        </Carousel>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                        <div className="absolute bottom-8 left-8 pointer-events-none">
                          <h4 className="text-3xl font-black text-white">
                            {(selectedServiceId === 'elderly-care' || selectedServiceId === 'child-protection' || selectedServiceId === 'fire-prevention') ? 'Lease to Own' : 'Rent Hardware'}
                          </h4>
                          <p className="text-white/60 text-xs font-bold uppercase tracking-widest">
                            {(selectedServiceId === 'elderly-care' || selectedServiceId === 'child-protection' || selectedServiceId === 'fire-prevention') ? 'Quarterly Installments' : 'Flexible Monthly Leasing'}
                          </p>
                        </div>
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-black/50 backdrop-blur-md p-2 rounded-full text-white">
                            <Maximize2 className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-10 space-y-6">
                        <p className="text-sm text-muted-foreground leading-relaxed font-bold whitespace-pre-line">{activeDeviceData.description}</p>
                        
                        {activeDeviceData.features && (
                          <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Core Features</p>
                            <ul className="grid grid-cols-1 gap-1">
                              {activeDeviceData.features.map((f: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-[10px] font-medium text-muted-foreground">
                                  <CheckCircle2 className="w-3 h-3 mt-0.5 text-rwanda-green shrink-0" />
                                  {f}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {activeDeviceData.specifications && (
                          <div className="space-y-3 bg-secondary/20 p-6 rounded-2xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                              <Info className="w-3 h-3" /> Technical Specifications
                            </p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                              {Object.entries(activeDeviceData.specifications).map(([k, v]: [any, any]) => (
                                <div key={k} className="flex flex-col">
                                  <span className="text-[8px] uppercase text-muted-foreground font-black">{k}</span>
                                  <span className="text-[10px] font-bold">{v}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {(selectedServiceId === 'elderly-care' || selectedServiceId === 'child-protection' || selectedServiceId === 'fire-prevention') && (
                          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-xs font-bold text-primary leading-relaxed">
                            It's a lease with option to buy. The price is {activeDeviceData.leasePrice} per 3 months for a year (4 installments), after which you own the device.
                          </div>
                        )}

                        <div className="space-y-4 p-6 rounded-3xl bg-background border border-border">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quantity</Label>
                              <Select 
                                value={checkoutData.quantity.toString()} 
                                onValueChange={(v) => setCheckoutData({...checkoutData, quantity: parseInt(v)})}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 99 }, (_, i) => i + 1).map(n => (
                                    <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Color</Label>
                              <Select 
                                value={checkoutData.color} 
                                onValueChange={(v) => setCheckoutData({...checkoutData, color: v})}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Color" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getColorOptions().map(c => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="pt-4 border-t border-border flex justify-between items-center">
                            <div>
                              <p className="text-[8px] font-black uppercase text-muted-foreground">
                                Total {(selectedServiceId === 'elderly-care' || selectedServiceId === 'fire-prevention' || (selectedServiceId === 'child-protection' && (childOption === 'option1' || childOption === 'option2'))) ? 'Quarterly' : 'Monthly'} Amount
                              </p>
                              <p className="text-2xl font-black">
                                {(parseInt(activeDeviceData.leasePrice.replace(/[^0-9]/g, '')) * checkoutData.quantity).toLocaleString()} RWF
                              </p>
                            </div>
                          </div>
                        </div>

                        <Button 
                          variant="outline" 
                          onClick={() => handleDeviceSelection('leased')}
                          disabled={!checkoutData.color}
                          className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-sm"
                        >
                          {(selectedServiceId === 'elderly-care' || (selectedServiceId === 'child-protection' && childOption === 'option1')) ? 'Start Lease to Own' : 'Activate Lease'}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* FAQ Section for Hardware */}
                  {activeDeviceData.faq && (
                    <Card className="max-w-4xl mx-auto rounded-[2.5rem] border-border bg-card/40 p-10">
                      <h3 className="text-2xl font-black mb-8">Hardware FAQ</h3>
                      <div className="space-y-6">
                        {activeDeviceData.faq.map((item: any, i: number) => (
                          <div key={i} className="space-y-2">
                            <h4 className="font-bold text-sm text-primary">Q: {item.q}</h4>
                            <p className="text-sm text-muted-foreground">A: {item.a}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {stagingStep === 'checkout' && selectedServiceId && (
                <Card className="max-w-4xl mx-auto rounded-[3rem] border-border bg-card/60 shadow-2xl animate-reveal">
                  <CardHeader className="p-12 pb-6 border-b border-border/50 bg-primary/5">
                    <Button variant="ghost" className="w-fit mb-6 rounded-xl gap-2 font-bold" onClick={() => setStagingStep('get-device')}>
                      <ChevronLeft className="w-4 h-4" /> Back to Selection
                    </Button>
                    <CardTitle className="text-4xl font-black">Checkout</CardTitle>
                    <CardDescription className="text-lg font-light mt-2">Provide delivery details for your SafeRwanda hardware.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-12 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                          <div className="relative">
                            <Input 
                              placeholder="Your full name" 
                              value={checkoutData.fullName}
                              onChange={(e) => setCheckoutData({...checkoutData, fullName: e.target.value})}
                              className="h-14 rounded-xl border-border bg-secondary/20 pl-12" 
                            />
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                          <div className="relative">
                            <Input 
                              type="email"
                              placeholder="you@email.com" 
                              value={checkoutData.email}
                              onChange={(e) => setCheckoutData({...checkoutData, email: e.target.value})}
                              className="h-14 rounded-xl border-border bg-secondary/20 pl-12" 
                            />
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</Label>
                          <div className="relative">
                            <Input 
                              placeholder="+250 7XX XXX XXX" 
                              value={checkoutData.phone}
                              onChange={(e) => setCheckoutData({...checkoutData, phone: e.target.value})}
                              className="h-14 rounded-xl border-border bg-secondary/20 pl-12" 
                            />
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Delivery Region Validation</Label>
                          <Button 
                            variant="outline" 
                            className="w-full h-14 rounded-xl gap-2 font-bold border-dashed border-primary/40 text-primary"
                            onClick={handleGetCurrentLocation}
                            disabled={isLocating}
                          >
                            {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                            {isLocating ? "Validating Coordinates..." : "Get My Current Location"}
                          </Button>
                          {locationError ? (
                            <p className="text-[10px] text-destructive font-bold mt-1 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> {locationError}
                            </p>
                          ) : !isLocating && navigator.geolocation && (
                            <p className="text-[10px] text-rwanda-green font-bold mt-1 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Location validated within Rwanda service area.
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Country</Label>
                          <Input value="Rwanda" disabled className="h-14 rounded-xl border-border bg-secondary/40 font-bold" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Province</Label>
                        <Input 
                          placeholder="e.g. Kigali" 
                          value={checkoutData.province}
                          onChange={(e) => setCheckoutData({...checkoutData, province: e.target.value})}
                          className="h-12 rounded-xl border-border bg-secondary/20" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">District</Label>
                        <Input 
                          placeholder="District" 
                          value={checkoutData.district}
                          onChange={(e) => setCheckoutData({...checkoutData, district: e.target.value})}
                          className="h-12 rounded-xl border-border bg-secondary/20" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Sector</Label>
                        <Input 
                          placeholder="Sector" 
                          value={checkoutData.sector}
                          onChange={(e) => setCheckoutData({...checkoutData, sector: e.target.value})}
                          className="h-12 rounded-xl border-border bg-secondary/20" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Cell</Label>
                        <Input 
                          placeholder="Cell" 
                          value={checkoutData.cell}
                          onChange={(e) => setCheckoutData({...checkoutData, cell: e.target.value})}
                          className="h-12 rounded-xl border-border bg-secondary/20" 
                        />
                      </div>
                    </div>

                    {/* Summary Section */}
                    <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-8 mb-8 space-y-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Service Tier</p>
                          <p className="text-xl font-black capitalize">
                            {checkoutData.quantity}x {selectedServiceId?.replace('-', ' ')} {childOption === 'option1' ? '(Standard)' : childOption === 'option2' ? '(Advanced)' : ''}
                          </p>
                          <p className="text-[10px] font-bold text-primary mt-1">Color: {checkoutData.color}</p>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Transaction Type</p>
                          <Badge variant="outline" className="border-primary text-primary font-bold px-3 py-1">
                            {tempSelection === 'purchased' ? 'Full Purchase' : 'Lease to Own'}
                          </Badge>
                        </div>
                      </div>

                      <div className="h-px w-full bg-primary/10" />

                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-center sm:text-left">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                            {tempSelection === 'purchased' ? 'One-time Payment' : 'Payment Schedule'}
                          </p>
                          <p className="text-sm font-bold">
                            {tempSelection === 'purchased' 
                              ? 'Full ownership upon delivery' 
                              : (selectedServiceId === 'elderly-care' || selectedServiceId === 'fire-prevention' || (selectedServiceId === 'child-protection' && (childOption === 'option1' || childOption === 'option2')))
                                ? '4 Installments (1 Year Plan)' 
                                : 'Monthly Subscription'}
                          </p>
                        </div>
                        <div className="text-center sm:text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                            {tempSelection === 'purchased' ? 'Total Amount' : 'Amount per Installment'}
                          </p>
                          <p className="text-3xl font-black text-primary">
                            {(parseInt((tempSelection === 'purchased' ? activeDeviceData?.buyPrice : activeDeviceData?.leasePrice).replace(/[^0-9]/g, '')) * checkoutData.quantity).toLocaleString()} RWF
                          </p>
                          {tempSelection === 'leased' && (selectedServiceId === 'elderly-care' || selectedServiceId === 'fire-prevention' || (selectedServiceId === 'child-protection' && (childOption === 'option1' || childOption === 'option2'))) && (
                            <p className="text-[10px] text-muted-foreground font-bold mt-1">Pay every 3 months</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-8">
                      <Button 
                        onClick={handleCompleteCheckout}
                        disabled={
                          !checkoutData.fullName || 
                          !checkoutData.email || 
                          !checkoutData.phone || 
                          !checkoutData.province || 
                          !checkoutData.district || 
                          !checkoutData.street ||
                          !!locationError ||
                          isLocating
                        }
                        className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-sm shadow-xl"
                      >
                        Proceed to Payment
                      </Button>
                      <p className="text-[9px] text-center text-muted-foreground mt-4 uppercase font-bold tracking-widest">
                        By clicking proceed, you agree to our terms of hardware service and deployment.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {stagingStep === 'setup' && selectedServiceId && (
                <Card className="bg-card/60 border-border rounded-[3rem] overflow-hidden shadow-2xl animate-reveal">
                  <CardHeader className="p-12 pb-6 border-b border-border/50 bg-secondary/20">
                    <Button variant="ghost" className="w-fit mb-6 rounded-xl gap-2 font-bold" onClick={() => setStagingStep('list')}>
                      <ChevronLeft className="w-4 h-4" /> Back to My Services
                    </Button>
                    <CardTitle className="text-4xl font-black uppercase">Setting Up Your {selectedServiceId.replace('-', ' ')}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-12 space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-8">
                        <h3 className="text-2xl font-black">Final Steps to Protect</h3>
                        <div className="space-y-6">
                          {[
                            { step: "01", title: "Deployment", desc: "Mount your hardware in the recommended tactical position." },
                            { step: "02", title: "Activation", desc: "Power on the device and wait for the green network link light." },
                            { step: "03", title: "Digital Link", desc: "Use the 'Connect Device' button at the top to register your Device ID." },
                            { step: "04", title: "Grid Sync", desc: "Once linked, our central monitor will begin tracking 24/7." }
                          ].map((item, i) => (
                            <div key={i} className="flex gap-6 items-start">
                              <span className="text-primary font-black text-3xl opacity-20">{item.step}</span>
                              <div>
                                <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                                <p className="text-sm text-muted-foreground font-light">{item.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button 
                          onClick={handleDownloadGuide}
                          className="h-16 rounded-2xl font-black uppercase tracking-widest text-xs bg-primary gap-2 w-full md:w-auto"
                        >
                          <Download className="w-5 h-5" /> Download Technical Guide (PDF)
                        </Button>
                      </div>
                      <div className="bg-primary/5 rounded-[2.5rem] border border-primary/10 p-10 flex flex-col justify-center text-center">
                        <FileText className="w-20 h-20 text-primary mx-auto mb-6 opacity-20" />
                        <h4 className="text-2xl font-black mb-4">Strategic Onboarding</h4>
                        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                          {profile?.hasPaidSetupFee 
                            ? "SafeRwanda Technical Staff will handle the physical deployment. Use the guide on the left to understand your system."
                            : "Follow the technical steps to link your hardware. Once connected, monitoring begins immediately."}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Subscription Popup Dialog */}
          <Dialog open={isSubscriptionOpen} onOpenChange={setIsSubscriptionOpen}>
            <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden border-border/50 bg-background shadow-2xl rounded-[3rem]">
              <div className="relative p-12">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rwanda-green via-primary to-accent" />
                <DialogHeader className="mb-10 text-center">
                  <div className="w-24 h-24 rounded-[2.5rem] bg-rwanda-green/10 flex items-center justify-center mx-auto mb-6">
                    <Zap className="w-12 h-12 text-rwanda-green" />
                  </div>
                  <DialogTitle className="text-5xl font-black tracking-tight">Activate Monitoring</DialogTitle>
                  <DialogDescription className="text-lg mt-4 font-light max-w-lg mx-auto">
                    Device connected successfully! Select a plan to start your 24/7 strategic security monitoring for <b>{profile?.deviceName || 'your device'}</b>.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-10">
                  <RadioGroup value={subType} onValueChange={setSubType} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { id: 'weekly', label: 'Weekly Guard', price: 'RWF 5,000', note: 'Flexible Protection' },
                      { id: 'monthly', label: 'Standard Guard', price: 'RWF 18,000', note: 'Full Coverage' },
                      { id: 'yearly', label: 'Elite Guard', price: 'RWF 180,000', note: 'Strategic Value' }
                    ].map((plan) => (
                      <div 
                        key={plan.id}
                        onClick={() => setSubType(plan.id)}
                        className={cn(
                          "p-8 rounded-[2.5rem] border-4 transition-all cursor-pointer flex flex-col justify-between text-center relative overflow-hidden group",
                          subType === plan.id ? 'border-primary bg-primary/[0.03] shadow-2xl shadow-primary/10' : 'border-border bg-background hover:border-primary/40'
                        )}
                      >
                        <RadioGroupItem value={plan.id} id={plan.id} className="sr-only" />
                        <div>
                          <p className="text-[9px] font-black uppercase text-muted-foreground mb-4 opacity-60">{plan.note}</p>
                          <h4 className="font-black text-xl tracking-tighter mb-2">{plan.label}</h4>
                          <div className="text-2xl font-black text-primary mt-4">{plan.price}</div>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>

                  <div className="pt-6">
                    <Button 
                      onClick={() => {
                        updateProfileData({ subscriptionActive: true, subscriptionType: subType });
                        setIsSubscriptionOpen(false);
                        toast({
                          title: "Monitoring Active",
                          description: `Protection grid is now live for ${profile?.deviceName || 'your device'}.`,
                        });
                      }}
                      className="w-full h-20 rounded-[1.5rem] bg-primary text-2xl font-black shadow-xl"
                      disabled={updating}
                    >
                      {updating ? <Loader2 className="w-8 h-8 animate-spin" /> : "Activate Guard"}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Full-screen Image Preview Dialog */}
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogContent className="max-w-[100vw] w-screen h-screen p-0 m-0 border-none bg-black/95 rounded-none flex items-center justify-center [&>button]:text-white">
              <div className="sr-only">
                <DialogTitle>Hardware Preview</DialogTitle>
                <DialogDescription>Viewing full-screen images of the security device.</DialogDescription>
              </div>
              <div className="relative w-full max-w-5xl h-[80vh] px-4">
                <Carousel className="w-full h-full">
                  <CarouselContent>
                    {activeDeviceData?.images?.map((imgUrl: string, idx: number) => (
                      <CarouselItem key={idx}>
                        <div className="relative h-[80vh] w-full">
                          <Image src={imgUrl} alt={`${activeDeviceData.name} preview ${idx + 1}`} fill className="object-contain" />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {activeDeviceData?.images?.length > 1 && (
                    <>
                      <CarouselPrevious className="left-4 bg-white/10 hover:bg-white/20 text-white border-white/20" />
                      <CarouselNext className="right-4 bg-white/10 hover:bg-white/20 text-white border-white/20" />
                    </>
                  )}
                </Carousel>
              </div>
            </DialogContent>
          </Dialog>

        </div>
      </main>

      <footer className="py-16 border-t border-border/50 bg-background/50 backdrop-blur-md relative z-10">
        <div className="container mx-auto px-4 text-center">
           <p className="text-[10px] text-muted-foreground font-black tracking-[0.2em] uppercase opacity-30">
             © {new Date().getFullYear()} SafeRwanda Security. Strategic Operations Grid.
           </p>
        </div>
      </footer>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
