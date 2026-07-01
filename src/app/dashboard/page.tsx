
'use client';

import { useEffect, useState, useRef } from 'react';
import { useUser, useFirestore, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
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
  ArrowRight,
  Wrench,
  Wifi,
  Zap,
  Globe,
  Target,
  LayoutDashboard,
  ShoppingCart,
  Cpu,
  FileText,
  ChevronLeft,
  Plus,
  Info
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
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import Image from 'next/image';

// Service hardware metadata for procurement
const HARDWARE_CATALOG: Record<string, any> = {
  "child-protection": {
    name: "SafeWatch Pro",
    image: "https://picsum.photos/seed/child1/600/400",
    buyPrice: "45,000 RWF",
    leasePrice: "4,000 RWF/mo",
    description: "A smart GPS tracker with an emergency button and health monitoring."
  },
  "elderly-care": {
    name: "SafeLink Vital",
    image: "https://picsum.photos/seed/elder1/600/400",
    buyPrice: "38,000 RWF",
    leasePrice: "3,500 RWF/mo",
    description: "Medical alert device with fall detection and heart rate monitoring."
  },
  "fire-prevention": {
    name: "SafeHome Heat Sensor",
    image: "https://picsum.photos/seed/fire1/600/400",
    buyPrice: "25,000 RWF",
    leasePrice: "2,500 RWF/mo",
    description: "A smart smoke and gas leak detector for your home."
  },
  "property-security": {
    name: "SafeGuard Smart Lock",
    image: "https://picsum.photos/seed/prop1/600/400",
    buyPrice: "55,000 RWF",
    leasePrice: "5,000 RWF/mo",
    description: "Smart lock and alarm for gates and doors."
  },
  "asset-protection": {
    name: "SafeTrack Asset",
    image: "https://picsum.photos/seed/asset1/600/400",
    buyPrice: "60,000 RWF",
    leasePrice: "5,500 RWF/mo",
    description: "Tough GPS tracker for cars and valuable equipment."
  },
  "neighborhood-surveillance": {
    name: "SafeMesh Gate",
    image: "https://picsum.photos/seed/neigh1/600/400",
    buyPrice: "75,000 RWF",
    leasePrice: "7,000 RWF/mo",
    description: "Security hub to connect with neighbor safety groups."
  },
  "smart-community": {
    name: "SafeCity Node",
    image: "https://picsum.photos/seed/smart1/600/400",
    buyPrice: "85,000 RWF",
    leasePrice: "8,000 RWF/mo",
    description: "Community device for smart lighting and environment monitoring."
  }
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [stagingStep, setStagingStep] = useState<'list' | 'instructions' | 'procurement' | 'setup'>('list');

  const [deviceIdInput, setDeviceIdInput] = useState('');
  const [alertPhone, setAlertPhone] = useState('');
  const [alertEmail, setAlertEmail] = useState('');
  const [subType, setSubType] = useState('monthly');

  useEffect(() => {
    const observerOptions = { threshold: 0.05, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('reveal-visible');
      });
    }, observerOptions);
    const revealElements = document.querySelectorAll('.animate-reveal');
    revealElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [activeTab, loading, stagingStep]);

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

  const handleProcurementSelection = (status: 'purchased' | 'leased') => {
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
                    {profile?.subscriptionActive ? 'Active Service' : 'Waiting for Subscription'}
                  </Badge>
                  {profile?.deviceId && (
                    <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 font-black uppercase tracking-widest text-[8px]">
                      Device Linked
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
                    Connect Your Device
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
                    <CardTitle className="text-2xl font-black">Status Dashboard</CardTitle>
                    <CardDescription>How your security system is doing right now.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                      {[
                        { label: 'Devices', val: profile?.deviceId ? '01' : '00', icon: Smartphone, color: 'text-primary' },
                        { label: 'Connection', val: profile?.deviceId ? '98%' : '0%', icon: Wifi, color: 'text-rwanda-green' },
                        { label: 'Uptime', val: profile?.deviceId ? '99.9%' : '0%', icon: Activity, color: 'text-accent' },
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
                    <CardTitle className="text-xl font-black flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Next Step
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 flex-grow flex flex-col justify-between">
                    <p className="text-sm text-muted-foreground font-light leading-relaxed">
                      {!profile?.purchaseStatus || profile?.purchaseStatus === 'none'
                        ? "You haven't initialized your services yet. Go to 'My Services' to begin."
                        : !profile?.deviceId 
                          ? "Your hardware is on its way or ready. Use 'Connect Your Device' to link it."
                          : !profile?.subscriptionActive 
                            ? "Your device is linked! Now activate your service to start monitoring."
                            : "Everything is working! We are monitoring your safety 24/7."}
                    </p>
                    <Button 
                      onClick={() => {
                        if (!profile?.purchaseStatus || profile.purchaseStatus === 'none') setActiveTab('staging');
                        else if (!profile?.deviceId) setIsRegisterOpen(true);
                        else setActiveTab('activation');
                      }}
                      className="w-full mt-6 rounded-2xl h-14 font-black uppercase tracking-widest text-xs bg-primary"
                    >
                      {(!profile?.purchaseStatus || profile.purchaseStatus === 'none') ? 'Initialize My Services' : profile?.deviceId ? 'Go to Subscription' : 'Connect Device'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="staging" className="space-y-8 animate-reveal outline-none">
              {stagingStep === 'list' && (
                <Card className="bg-card/60 border-border rounded-[3rem] shadow-2xl">
                  <CardHeader className="p-12 pb-6 border-b border-border/50">
                    <CardTitle className="text-4xl font-black">My Selected Services</CardTitle>
                    <CardDescription className="text-lg font-light">Choose a service below to begin your setup journey.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {profile?.servicesSelected?.length > 0 ? (
                        profile.servicesSelected.map((serviceId: string) => (
                          <div key={serviceId} className="p-8 rounded-[2.5rem] border bg-background border-border shadow-sm flex flex-col justify-between hover:border-primary transition-all relative overflow-hidden">
                            <div className="relative z-10">
                              <h4 className="font-black text-xl capitalize mb-3">{serviceId.replace('-', ' ')}</h4>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-8">Status: {profile?.purchaseStatus !== 'none' ? 'In Progress' : 'Pending Initialization'}</p>
                            </div>
                            <Button 
                              onClick={() => {
                                setSelectedServiceId(serviceId);
                                setStagingStep(profile?.purchaseStatus !== 'none' ? 'setup' : 'instructions');
                              }}
                              className="w-full rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white border-none font-black text-[10px] uppercase tracking-widest h-12"
                            >
                              Initialize Setup
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full py-24 text-center border-2 border-dashed border-border rounded-[2.5rem]">
                          <h4 className="text-2xl font-black mb-2">No Services Selected</h4>
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
                      <ChevronLeft className="w-4 h-4" /> Back
                    </Button>
                    <CardTitle className="text-4xl font-black">How Your Setup Works</CardTitle>
                    <CardDescription className="text-lg font-light mt-2">Before we get your hardware, here is how the process will go.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-12 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {[
                         { step: "1. Hardware Choice", desc: "You'll choose to either buy your device or rent it for a monthly fee." },
                         { step: "2. Shipping & Delivery", desc: "We'll deliver your SafeRwanda gadget directly to your location." },
                         { step: "3. Professional Setup", desc: "Follow our simple guide or let our staff install it for you." },
                         { step: "4. Digital Linking", desc: "Register your device ID in this dashboard to start receiving alerts." }
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

                    <div className="p-8 rounded-3xl bg-secondary/30 border border-border flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <FileText className="w-10 h-10 text-primary opacity-50" />
                        <div>
                           <h4 className="font-black text-sm uppercase">SafeRwanda Strategic Manual</h4>
                           <p className="text-xs text-muted-foreground">Download the full instructions for your records.</p>
                        </div>
                      </div>
                      <Button variant="outline" className="rounded-xl h-12 gap-2 border-primary/20 hover:bg-primary/5">
                        <Download className="w-4 h-4" /> Download Manual (PDF)
                      </Button>
                    </div>

                    <Button 
                      onClick={() => setStagingStep('procurement')}
                      className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-sm"
                    >
                      Continue to Procurement
                    </Button>
                  </CardContent>
                </Card>
              )}

              {stagingStep === 'procurement' && selectedServiceId && (
                <div className="space-y-12 animate-reveal">
                  <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-4">
                    <Button variant="ghost" className="rounded-xl gap-2 font-bold" onClick={() => setStagingStep('instructions')}>
                      <ChevronLeft className="w-4 h-4" /> Back to Instructions
                    </Button>
                    <h2 className="text-4xl font-black">Choose Your Device Plan</h2>
                    <p className="text-muted-foreground">Select how you would like to receive your {HARDWARE_CATALOG[selectedServiceId]?.name}.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
                    <Card className="rounded-[3.5rem] overflow-hidden border-4 border-border bg-card/60 cursor-pointer hover:-translate-y-2 transition-all shadow-2xl" onClick={() => handleProcurementSelection('purchased')}>
                      <div className="relative h-72 w-full">
                        <Image src={HARDWARE_CATALOG[selectedServiceId]?.image} alt="Device" fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-8 left-8">
                          <h4 className="text-3xl font-black text-white">Buy Device</h4>
                          <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Ownership & Full Access</p>
                        </div>
                      </div>
                      <CardContent className="p-10 space-y-6">
                        <p className="text-sm text-muted-foreground leading-relaxed">{HARDWARE_CATALOG[selectedServiceId]?.description}</p>
                        <div className="flex justify-between items-center p-6 rounded-3xl bg-background border border-border">
                          <div>
                            <p className="text-[8px] font-black uppercase text-muted-foreground">One-Time Price + Delivery</p>
                            <p className="text-2xl font-black">{HARDWARE_CATALOG[selectedServiceId]?.buyPrice}</p>
                          </div>
                        </div>
                        <Button className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs bg-primary">Select & Buy</Button>
                      </CardContent>
                    </Card>

                    <Card className="rounded-[3.5rem] overflow-hidden border-4 border-border bg-card/60 cursor-pointer hover:-translate-y-2 transition-all shadow-2xl" onClick={() => handleProcurementSelection('leased')}>
                      <div className="relative h-72 w-full">
                        <Image src={HARDWARE_CATALOG[selectedServiceId]?.image} alt="Device" fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-8 left-8">
                          <h4 className="text-3xl font-black text-white">Rent Device</h4>
                          <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Flexible Monthly Plan</p>
                        </div>
                      </div>
                      <CardContent className="p-10 space-y-6">
                        <p className="text-sm text-muted-foreground leading-relaxed">Lower entry cost. Use the professional SafeRwanda hardware for a small monthly fee instead of buying.</p>
                        <div className="flex justify-between items-center p-6 rounded-3xl bg-background border border-border">
                          <div>
                            <p className="text-[8px] font-black uppercase text-muted-foreground">Monthly Rental Fee</p>
                            <p className="text-2xl font-black">{HARDWARE_CATALOG[selectedServiceId]?.leasePrice}</p>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs">Select & Rent</Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {stagingStep === 'setup' && selectedServiceId && (
                <Card className="bg-card/60 border-border rounded-[3rem] overflow-hidden shadow-2xl animate-reveal">
                  <CardHeader className="p-12 pb-6 border-b border-border/50 bg-secondary/20">
                    <Button variant="ghost" className="w-fit mb-6 rounded-xl gap-2 font-bold" onClick={() => setStagingStep('list')}>
                      <ChevronLeft className="w-4 h-4" /> Back to My Services
                    </Button>
                    <CardTitle className="text-4xl font-black uppercase">How to Set Up Your {selectedServiceId.replace('-', ' ')} Device</CardTitle>
                  </CardHeader>
                  <CardContent className="p-12 space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-8">
                        <h3 className="text-2xl font-black">Steps to Install</h3>
                        <div className="space-y-6">
                          {[
                            { step: "01", title: "Power Up", desc: "Follow the provided manual to mount and power on your hardware." },
                            { step: "02", title: "Check Connectivity", desc: "Ensure your device is in an area with clear signal for best performance." },
                            { step: "03", title: "Link Your App", desc: "Use the 'Connect Your Device' button at the top of the dashboard to link your Device ID." },
                            { step: "04", title: "Start Protection", desc: "Once linked, your alerts will be active and monitored 24/7." }
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
                      </div>
                      <div className="bg-primary/5 rounded-[2.5rem] border border-primary/10 p-10 flex flex-col justify-center text-center">
                        <FileText className="w-20 h-20 text-primary mx-auto mb-6 opacity-20" />
                        <h4 className="text-2xl font-black mb-4">Branded Setup Manual</h4>
                        <p className="text-sm text-muted-foreground mb-8">
                          {profile?.hasPaidSetupFee 
                            ? "SafeRwanda staff will handle this installation. Download this guide to understand how the system works."
                            : "Download this guide to help you set up the device and connect it to your dashboard."}
                        </p>
                        <Button className="h-16 rounded-2xl font-black uppercase tracking-widest text-xs bg-primary gap-2">
                          <Download className="w-5 h-5" /> Download Manual (PDF)
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="activation" className="animate-reveal outline-none">
              <Card className="max-w-4xl mx-auto rounded-[4rem] border-rwanda-green/20 overflow-hidden shadow-2xl">
                <CardHeader className="p-16 text-center bg-gradient-to-b from-rwanda-green/[0.05] to-transparent border-b border-rwanda-green/10">
                  <div className="w-24 h-24 rounded-[2.5rem] bg-rwanda-green/10 flex items-center justify-center mx-auto mb-8">
                    <Zap className="w-12 h-12 text-rwanda-green" />
                  </div>
                  <CardTitle className="text-6xl font-black">Choose a Plan</CardTitle>
                  <CardDescription className="text-xl mt-6 font-light max-w-lg mx-auto">Select a subscription plan to activate your continuous monitoring service.</CardDescription>
                </CardHeader>
                <CardContent className="p-16">
                  <RadioGroup value={subType} onValueChange={setSubType} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { id: 'weekly', label: 'Weekly Plan', price: 'RWF 5,000', note: 'Flexible Monitoring' },
                      { id: 'monthly', label: 'Monthly Plan', price: 'RWF 18,000', note: 'Standard Protection' },
                      { id: 'yearly', label: 'Yearly Plan', price: 'RWF 180,000', note: 'Best Value Security' }
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
                    {updating ? <Loader2 className="w-8 h-8 animate-spin" /> : "Activate Service"}
                  </Button>
                  {!profile?.deviceId && (
                    <div className="flex items-center justify-center gap-3 text-destructive font-black uppercase text-[10px] bg-destructive/10 py-5 px-10 rounded-[1.5rem] border border-destructive/20">
                      <AlertTriangle className="w-5 h-5" /> Link your hardware first to activate
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
             © {new Date().getFullYear()} SafeRwanda Security. All Rights Reserved.
           </p>
        </div>
      </footer>
    </div>
  );
}
