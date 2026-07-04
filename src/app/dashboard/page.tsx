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
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import Image from 'next/image';

// Device details for the shop
const DEVICE_CATALOG: Record<string, any> = {
  "child-protection": {
    name: "SafeWatch Pro",
    image: "https://picsum.photos/seed/child1/600/400",
    buyPrice: "45,000 RWF",
    leasePrice: "4,000 RWF/mo",
    description: "A smart GPS watch with an emergency button and health tracking for kids.",
    features: ["Real-time Tracking", "SOS Panic Button", "Geofencing Alerts", "Health Monitoring"]
  },
  "elderly-care": {
    name: "SafeLink D44S GPS Watch",
    image: "https://picsum.photos/seed/elder1/600/400",
    buyPrice: "85,000 RWF",
    leasePrice: "42,500 RWF",
    description: "The D44S 4G elderly GPS watch is tailored for seniors' safety and health, featuring IP67 waterproofing, 4G full-network connectivity, and GPS+LBS+WiFi triple positioning (≤5M). It highlights a medicine reminder, SOS emergency call, heart rate monitoring, and 830mAh long battery life.",
    specifications: {
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
    name: "SafeHome Heat Sensor",
    image: "https://picsum.photos/seed/fire1/600/400",
    buyPrice: "25,000 RWF",
    leasePrice: "2,500 RWF/mo",
    description: "A smart smoke and gas leak detector for your kitchen and home.",
    features: ["Gas Leak Detection", "Thermal Monitoring", "Instant App Alerts", "Loud Alarm Siren"]
  },
  "property-security": {
    name: "SafeGuard Smart Lock",
    image: "https://picsum.photos/seed/prop1/600/400",
    buyPrice: "55,000 RWF",
    leasePrice: "5,000 RWF/mo",
    description: "A secure smart lock for your main gate and doors.",
    features: ["Remote Unlock", "Entry Logs", "Tamper Alerts", "Bluetooth Connectivity"]
  },
  "asset-protection": {
    name: "SafeTrack Asset",
    image: "https://picsum.photos/seed/asset1/600/400",
    buyPrice: "60,000 RWF",
    leasePrice: "5,500 RWF/mo",
    description: "A heavy-duty GPS tracker for vehicles and high-value equipment.",
    features: ["4G LTE Tracking", "Movement History", "Magnetic Mount", "Long Battery Life"]
  },
  "neighborhood-surveillance": {
    name: "SafeMesh Hub",
    image: "https://picsum.photos/seed/neigh1/600/400",
    buyPrice: "75,000 RWF",
    leasePrice: "7,000 RWF/mo",
    description: "A security hub that connects you with your neighbors' safety network.",
    features: ["Community Alerts", "Camera Integration", "Emergency Broadcast", "Night Vision Support"]
  },
  "smart-community": {
    name: "SafeCity Node",
    image: "https://picsum.photos/seed/smart1/600/400",
    buyPrice: "85,000 RWF",
    leasePrice: "8,000 RWF/mo",
    description: "A community device for smart street lighting and hazard tracking.",
    features: ["Streetlight Control", "Waste Analytics", "Environmental Sensors", "Mesh Network"]
  }
};

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState<string>(searchParams.get('tab') || 'overview');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [stagingStep, setStagingStep] = useState<'list' | 'instructions' | 'get-device' | 'setup'>('list');

  const [deviceIdInput, setDeviceIdInput] = useState('');
  const [alertPhone, setAlertPhone] = useState('');
  const [alertEmail, setAlertEmail] = useState('');
  const [subType, setSubType] = useState('monthly');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const revealElements = document.querySelectorAll('.animate-reveal');
      revealElements.forEach((el) => {
        el.classList.add('reveal-visible');
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [activeTab, stagingStep]);

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
      if (newData.deviceId) setIsRegisterOpen(false);
    } catch (err) {
      console.error("Update error:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeviceSelection = (status: 'purchased' | 'leased') => {
    updateProfileData({ purchaseStatus: status, hasPaidSetupFee: status === 'purchased' });
    setStagingStep('setup');
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
                      Device Connected
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
                <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden border-border/50 bg-background shadow-2xl rounded-[2.5rem]">
                  <div className="relative p-10 pt-12">
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
                        <Label htmlFor="nodeId" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Device ID Number</Label>
                        <div className="relative">
                          <Input 
                            id="nodeId" 
                            placeholder="SAFE-XXXX-XXXX" 
                            value={deviceIdInput} 
                            onChange={(e) => setDeviceIdInput(e.target.value)}
                            className="h-16 rounded-2xl border-border bg-secondary/30 font-mono text-lg tracking-widest px-6"
                          />
                        </div>
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
                        onClick={() => updateProfileData({ deviceId: deviceIdInput, alertPhone, alertEmail })}
                        className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-sm"
                        disabled={updating || !deviceIdInput || !alertPhone || !alertEmail}
                      >
                        {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Connect Device"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-12">
            <TabsList className="grid grid-cols-3 h-auto p-1.5 bg-secondary/40 rounded-[1.5rem] border border-border/50 sticky top-24 z-[50] shadow-xl">
              <TabsTrigger value="overview" className="rounded-xl py-3 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-[10px] md:text-sm">
                <LayoutDashboard className="w-4 h-4 mr-2" /> Overview
              </TabsTrigger>
              <TabsTrigger value="staging" className="rounded-xl py-3 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-[10px] md:text-sm">
                <ShoppingCart className="w-4 h-4 mr-2" /> My Services
              </TabsTrigger>
              <TabsTrigger value="activation" className="rounded-xl py-3 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-[10px] md:text-sm">
                <Zap className="w-4 h-4 mr-2" /> Subscription
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
                        else setActiveTab('activation');
                      }}
                      className="w-full mt-6 rounded-2xl h-14 font-black uppercase tracking-widest text-xs bg-primary"
                    >
                      {(!profile?.purchaseStatus || profile.purchaseStatus === 'none') ? 'Go to My Services' : profile?.deviceId ? 'See Plans' : 'Connect Device'}
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
                        <Button className="h-16 rounded-2xl font-black uppercase tracking-widest text-xs bg-primary gap-2 w-full">
                          <Download className="w-4 h-4" /> Download Branded Guide (PDF)
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
                          onClick={() => setStagingStep('get-device')}
                          className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-sm shadow-xl"
                        >
                          Continue to Get Device
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {stagingStep === 'get-device' && selectedServiceId && (
                <div className="space-y-12 animate-reveal">
                  <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-4">
                    <Button variant="ghost" className="rounded-xl gap-2 font-bold" onClick={() => setStagingStep('instructions')}>
                      <ChevronLeft className="w-4 h-4" /> Back to Instructions
                    </Button>
                    <h2 className="text-4xl font-black">Get Your Device</h2>
                    <p className="text-muted-foreground">Select your hardware for {selectedServiceId.replace('-', ' ')}.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
                    {/* Buy Option */}
                    <Card className="rounded-[3.5rem] overflow-hidden border-4 border-border bg-card/60 cursor-pointer hover:-translate-y-2 transition-all shadow-2xl" onClick={() => handleDeviceSelection('purchased')}>
                      <div className="relative h-72 w-full">
                        <Image src={DEVICE_CATALOG[selectedServiceId]?.image} alt="Device" fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-8 left-8">
                          <h4 className="text-3xl font-black text-white">Buy Hardware</h4>
                          <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Ownership + Secured Shipping</p>
                        </div>
                      </div>
                      <CardContent className="p-10 space-y-6">
                        <p className="text-sm text-muted-foreground leading-relaxed font-bold">{DEVICE_CATALOG[selectedServiceId]?.description}</p>
                        
                        {DEVICE_CATALOG[selectedServiceId]?.specifications && (
                          <div className="space-y-3 bg-secondary/20 p-6 rounded-2xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                              <Info className="w-3 h-3" /> Technical Specifications
                            </p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                              {Object.entries(DEVICE_CATALOG[selectedServiceId].specifications).map(([k, v]: [any, any]) => (
                                <div key={k} className="flex flex-col">
                                  <span className="text-[8px] uppercase text-muted-foreground font-black">{k}</span>
                                  <span className="text-[10px] font-bold">{v}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {DEVICE_CATALOG[selectedServiceId]?.features && (
                          <div className="space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Core Capabilities</p>
                            <ul className="grid grid-cols-1 gap-2">
                              {DEVICE_CATALOG[selectedServiceId].features.map((feature: string, fIdx: number) => (
                                <li key={fIdx} className="flex items-start gap-2 text-[10px] text-muted-foreground font-medium">
                                  <CheckCircle2 className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex justify-between items-center p-6 rounded-3xl bg-background border border-border">
                          <div>
                            <p className="text-[8px] font-black uppercase text-muted-foreground">Unit Price + Delivery</p>
                            <p className="text-2xl font-black">{DEVICE_CATALOG[selectedServiceId]?.buyPrice}</p>
                          </div>
                        </div>
                        <Button className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs bg-primary">Order & Buy</Button>
                      </CardContent>
                    </Card>

                    {/* Lease Option */}
                    <Card className="rounded-[3.5rem] overflow-hidden border-4 border-border bg-card/60 cursor-pointer hover:-translate-y-2 transition-all shadow-2xl" onClick={() => handleDeviceSelection('leased')}>
                      <div className="relative h-72 w-full">
                        <Image src={DEVICE_CATALOG[selectedServiceId]?.image} alt="Device" fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-8 left-8">
                          <h4 className="text-3xl font-black text-white">
                            {selectedServiceId === 'elderly-care' ? 'Lease to Own' : 'Rent Hardware'}
                          </h4>
                          <p className="text-white/60 text-xs font-bold uppercase tracking-widest">
                            {selectedServiceId === 'elderly-care' ? 'Quarterly Installments' : 'Flexible Monthly Leasing'}
                          </p>
                        </div>
                      </div>
                      <CardContent className="p-10 space-y-6">
                        <p className="text-sm text-muted-foreground leading-relaxed font-bold">{DEVICE_CATALOG[selectedServiceId]?.description}</p>
                        
                        {selectedServiceId === 'elderly-care' && (
                          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-xs font-bold text-primary leading-relaxed">
                            It's a lease with option to buy and the elderly care price is 42,500 per 3 months for a year (that's a 4 time installment payment), after that they own the device.
                          </div>
                        )}

                        {DEVICE_CATALOG[selectedServiceId]?.specifications && (
                          <div className="space-y-3 bg-secondary/20 p-6 rounded-2xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                              <Info className="w-3 h-3" /> Technical Specifications
                            </p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                              {Object.entries(DEVICE_CATALOG[selectedServiceId].specifications).map(([k, v]: [any, any]) => (
                                <div key={k} className="flex flex-col">
                                  <span className="text-[8px] uppercase text-muted-foreground font-black">{k}</span>
                                  <span className="text-[10px] font-bold">{v}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {DEVICE_CATALOG[selectedServiceId]?.features && (
                          <div className="space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Core Capabilities</p>
                            <ul className="grid grid-cols-1 gap-2">
                              {DEVICE_CATALOG[selectedServiceId].features.map((feature: string, fIdx: number) => (
                                <li key={fIdx} className="flex items-start gap-2 text-[10px] text-muted-foreground font-medium">
                                  <CheckCircle2 className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex justify-between items-center p-6 rounded-3xl bg-background border border-border">
                          <div>
                            <p className="text-[8px] font-black uppercase text-muted-foreground">
                              {selectedServiceId === 'elderly-care' ? 'Quarterly Payment' : 'Monthly Service Fee'}
                            </p>
                            <p className="text-2xl font-black">{DEVICE_CATALOG[selectedServiceId]?.leasePrice}</p>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs">
                          {selectedServiceId === 'elderly-care' ? 'Start Lease to Own' : 'Activate Lease'}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* FAQ Section for Hardware */}
                  {DEVICE_CATALOG[selectedServiceId]?.faq && (
                    <Card className="max-w-4xl mx-auto rounded-[2.5rem] border-border bg-card/40 p-10">
                      <h3 className="text-2xl font-black mb-8">Hardware FAQ</h3>
                      <div className="space-y-6">
                        {DEVICE_CATALOG[selectedServiceId].faq.map((item: any, i: number) => (
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
                        <Button className="h-16 rounded-2xl font-black uppercase tracking-widest text-xs bg-primary gap-2 w-full md:w-auto">
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

            <TabsContent value="activation" className="outline-none">
              <Card className="max-w-4xl mx-auto rounded-[4rem] border-rwanda-green/20 overflow-hidden shadow-2xl animate-reveal">
                <CardHeader className="p-16 text-center bg-gradient-to-b from-rwanda-green/[0.05] to-transparent border-b border-rwanda-green/10">
                  <div className="w-24 h-24 rounded-[2.5rem] bg-rwanda-green/10 flex items-center justify-center mx-auto mb-8">
                    <Zap className="w-12 h-12 text-rwanda-green" />
                  </div>
                  <CardTitle className="text-6xl font-black">Subscription Plan</CardTitle>
                  <CardDescription className="text-xl mt-6 font-light max-w-lg mx-auto">Select a plan to start your 24/7 strategic security monitoring.</CardDescription>
                </CardHeader>
                <CardContent className="p-16">
                  <RadioGroup value={subType} onValueChange={setSubType} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { id: 'weekly', label: 'Weekly Guard', price: 'RWF 5,000', note: 'Flexible Protection' },
                      { id: 'monthly', label: 'Standard Guard', price: 'RWF 18,000', note: 'Full Coverage' },
                      { id: 'yearly', label: 'Elite Guard', price: 'RWF 180,000', note: 'Strategic Value' }
                    ].map((plan) => (
                      <div 
                        key={plan.id}
                        onClick={() => setSubType(plan.id)}
                        className={cn(
                          "p-10 rounded-[3rem] border-4 transition-all cursor-pointer flex flex-col justify-between text-center relative overflow-hidden group",
                          subType === plan.id ? 'border-primary bg-primary/[0.03] shadow-2xl shadow-primary/10' : 'border-border bg-background hover:border-primary/40'
                        )}
                      >
                        <div>
                          <p className="text-[10px] font-black uppercase text-muted-foreground mb-6 opacity-60">{plan.note}</p>
                          <h4 className="font-black text-2xl tracking-tighter mb-2">{plan.label}</h4>
                          <div className="text-3xl font-black text-primary mt-6">{plan.price}</div>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
                <CardFooter className="p-16 pt-0 flex flex-col gap-10 text-center">
                  <Button 
                    onClick={() => updateProfileData({ subscriptionActive: true, subscriptionType: subType })}
                    className="w-full h-24 rounded-[2rem] bg-primary text-3xl font-black shadow-xl"
                    disabled={updating || !profile?.deviceId}
                  >
                    {updating ? <Loader2 className="w-8 h-8 animate-spin" /> : "Activate Guard"}
                  </Button>
                  {!profile?.deviceId && (
                    <div className="flex items-center justify-center gap-3 text-destructive font-black uppercase text-[10px] bg-destructive/10 py-5 px-10 rounded-[1.5rem] border border-destructive/20">
                      <AlertTriangle className="w-5 h-5" /> Link your hardware node first to activate monitoring
                    </div>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>

          </Tabs>
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