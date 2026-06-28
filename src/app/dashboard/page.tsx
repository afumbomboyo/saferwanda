
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
  LogOut, 
  Bell, 
  Activity, 
  Smartphone, 
  Download, 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle,
  Mail,
  Phone,
  ArrowRight,
  ListChecks,
  Package,
  Wrench,
  Wifi,
  Zap,
  Globe,
  Lock,
  Target,
  LayoutDashboard,
  ShoppingCart,
  Cpu,
  FileText,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// Service hardware metadata for procurement
const HARDWARE_CATALOG: Record<string, any> = {
  "child-protection": {
    name: "SR-Tracker Pro",
    image: "https://picsum.photos/seed/child1/600/400",
    buyPrice: "45,000 RWF",
    leasePrice: "4,000 RWF/mo",
    description: "Multi-band GPS node with SOS override and silent audio channel."
  },
  "elderly-care": {
    name: "SR-Vital Link",
    image: "https://picsum.photos/seed/elder1/600/400",
    buyPrice: "38,000 RWF",
    leasePrice: "3,500 RWF/mo",
    description: "Medical-grade sensor suite with fall detection and vitals telemetry."
  },
  "fire-prevention": {
    name: "SR-Thermal Node",
    image: "https://picsum.photos/seed/fire1/600/400",
    buyPrice: "25,000 RWF",
    leasePrice: "2,500 RWF/mo",
    description: "Gas and thermal leak detector with 10-year node battery."
  },
  "property-security": {
    name: "SR-Entry Guard",
    image: "https://picsum.photos/seed/prop1/600/400",
    buyPrice: "55,000 RWF",
    leasePrice: "5,000 RWF/mo",
    description: "Smart lock and perimeter breach node for secure compounds."
  },
  "asset-protection": {
    name: "SR-Asset Beacon",
    image: "https://picsum.photos/seed/asset1/600/400",
    buyPrice: "60,000 RWF",
    leasePrice: "5,500 RWF/mo",
    description: "Hardened industrial tracker for vehicles and heavy equipment."
  },
  "neighborhood-surveillance": {
    name: "SR-Mesh Gateway",
    image: "https://picsum.photos/seed/neigh1/600/400",
    buyPrice: "75,000 RWF",
    leasePrice: "7,000 RWF/mo",
    description: "High-capacity network hub for community mesh integrity."
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
  
  // Tab state: 'overview' | 'staging' | 'setup' | 'activation'
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Staging Sub-state
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [stagingStep, setStagingStep] = useState<'list' | 'instructions' | 'procurement'>('list');

  // Form states
  const [deviceIdInput, setDeviceIdInput] = useState('');
  const [alertPhone, setAlertPhone] = useState('');
  const [alertEmail, setAlertEmail] = useState('');
  const [subType, setSubType] = useState('monthly');

  useEffect(() => {
    const observerOptions = {
      threshold: 0.05,
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

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateProfileData = async (newData: any) => {
    if (!user || !db) return;
    setUpdating(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, newData);
      setProfile((prev: any) => ({ ...prev, ...newData }));
    } catch (err) {
      console.error("Update profile error:", err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading || userLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Initializing Command Center...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <main className="flex-grow pt-32 pb-24 relative z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center border border-primary/20 shadow-2xl shadow-primary/20">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={cn(
                    "font-black uppercase tracking-widest text-[8px] px-2 py-0.5",
                    profile?.subscriptionActive ? "border-rwanda-green text-rwanda-green bg-rwanda-green/5" : "border-amber-500 text-amber-500 bg-amber-500/5"
                  )}>
                    {profile?.subscriptionActive ? 'System Live' : 'Activation Pending'}
                  </Badge>
                  {profile?.deviceId && (
                    <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 font-black uppercase tracking-widest text-[8px]">
                      Node Linked
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-headline font-black tracking-tight leading-none">Command Center</h1>
                <p className="text-muted-foreground text-xs mt-1 uppercase tracking-[0.2em] font-bold opacity-60">Operator: {profile?.fullName || 'Anonymous Agent'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-secondary/30 backdrop-blur-xl p-2 rounded-[1.5rem] border border-border shadow-inner">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl"><Bell className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl"><Settings className="w-4 h-4" /></Button>
              <div className="h-6 w-px bg-border mx-1" />
              <Button 
                variant="destructive" 
                size="sm"
                className="rounded-xl font-bold px-4 h-10 gap-2" 
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-12">
            <TabsList className="grid grid-cols-4 h-auto p-1.5 bg-secondary/40 backdrop-blur-2xl rounded-[1.5rem] border border-border/50 sticky top-24 z-[50] shadow-xl">
              {[
                { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
                { id: 'staging', icon: ShoppingCart, label: 'Staging' },
                { id: 'setup', icon: Wrench, label: 'Integration' },
                { id: 'activation', icon: Zap, label: 'Activation' },
              ].map((tab) => (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id} 
                  className="rounded-xl py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all font-bold flex flex-col md:flex-row items-center justify-center gap-2 text-[10px] md:text-sm"
                >
                  <tab.icon className="w-4 h-4" /> 
                  <span className="hidden md:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* TAB 1: OVERVIEW */}
            <TabsContent value="overview" className="space-y-8 animate-reveal outline-none">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 bg-card/40 backdrop-blur-md border-border rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/5">
                  <CardHeader className="p-8 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl font-black tracking-tight">System Telemetry</CardTitle>
                        <CardDescription>Real-time node integrity and network signal strength.</CardDescription>
                      </div>
                      <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                        <Globe className="w-6 h-6" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                      {[
                        { label: 'Active Nodes', val: profile?.deviceId ? '01' : '00', icon: Smartphone, color: 'text-primary' },
                        { label: 'Signal', val: profile?.deviceId ? '98%' : '0%', icon: Wifi, color: 'text-rwanda-green' },
                        { label: 'Uptime', val: profile?.deviceId ? '99.9%' : '0%', icon: Activity, color: 'text-accent' },
                        { label: 'Alerts', val: '0', icon: Bell, color: 'text-muted-foreground' }
                      ].map((stat, i) => (
                        <div key={i} className="bg-secondary/20 p-6 rounded-[2rem] border border-border/50 text-center hover:bg-secondary/40 transition-colors">
                          <stat.icon className={cn("w-5 h-5 mx-auto mb-3 opacity-60", stat.color)} />
                          <div className="text-3xl font-black tracking-tighter">{stat.val}</div>
                          <div className="text-[9px] uppercase font-black tracking-widest text-muted-foreground mt-1">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20 rounded-[2.5rem] shadow-2xl shadow-primary/5 flex flex-col">
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Next Objective
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 flex-grow flex flex-col justify-between">
                    <p className="text-sm text-muted-foreground font-light leading-relaxed">
                      {!profile?.deviceId 
                        ? "Your Command Center is operational, but no hardware nodes are linked. Proceed to Staging to initialize your first device."
                        : !profile?.subscriptionActive 
                          ? "Node linked successfully. Finalize your strategic activation to begin receiving live telemetry and distress alerts."
                          : "All systems operational. Monitoring active security mesh."}
                    </p>
                    <Button 
                      onClick={() => setActiveTab(profile?.deviceId ? 'activation' : 'staging')}
                      className="w-full mt-6 rounded-2xl h-14 font-black uppercase tracking-widest text-xs bg-primary shadow-xl shadow-primary/20"
                    >
                      {profile?.deviceId ? 'Go to Activation' : 'Initialize Setup'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 2: STAGING (CART + PROCUREMENT FLOW) */}
            <TabsContent value="staging" className="space-y-8 animate-reveal outline-none">
              {stagingStep === 'list' && (
                <Card className="bg-card/60 backdrop-blur-xl border-border rounded-[3rem] overflow-hidden shadow-2xl shadow-black/5">
                  <CardHeader className="p-12 pb-6 border-b border-border/50">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-4 rounded-[1.5rem] bg-accent/10 text-accent border border-accent/10 shadow-inner">
                        <ShoppingCart className="w-8 h-8" />
                      </div>
                      <div>
                        <CardTitle className="text-4xl font-black tracking-tighter">Strategic Staging</CardTitle>
                        <CardDescription className="text-lg font-light">Your operational roadmap for hardware deployment.</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {profile?.servicesSelected?.length > 0 ? (
                        profile.servicesSelected.map((serviceId: string) => (
                          <div key={serviceId} className="p-8 rounded-[2.5rem] border bg-background border-border shadow-sm flex flex-col justify-between group hover:border-primary hover:shadow-2xl hover:shadow-primary/5 transition-all h-full relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                              <Shield className="w-20 h-20" />
                            </div>
                            <div className="relative z-10">
                              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 border border-primary/5 shadow-inner group-hover:scale-105 transition-transform">
                                <Shield className="w-7 h-7 text-primary" />
                              </div>
                              <h4 className="font-black text-xl capitalize mb-3 tracking-tight">{serviceId.replace('-', ' ')}</h4>
                              <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase tracking-widest mb-8 opacity-60">Status: Staged for Deployment</p>
                            </div>
                            <Button 
                              onClick={() => {
                                setSelectedServiceId(serviceId);
                                setStagingStep('instructions');
                              }}
                              className="w-full rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white border-none text-[10px] font-black tracking-widest uppercase px-3 py-1"
                            >
                              Initialize Setup
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full py-24 text-center border-2 border-dashed border-border rounded-[2.5rem] bg-secondary/5">
                          <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-10" />
                          <h4 className="text-2xl font-black tracking-tight mb-2">Staging Empty</h4>
                          <p className="text-muted-foreground font-medium mb-8 max-w-sm mx-auto leading-relaxed">You haven't initialized any security domains. Explore our services to build your protection roadmap.</p>
                          <Button onClick={() => router.push('/services')} className="rounded-2xl h-14 px-10 font-black bg-primary shadow-xl shadow-primary/20 text-sm uppercase tracking-widest">Browse Services</Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {stagingStep === 'instructions' && selectedServiceId && (
                <Card className="bg-card/60 backdrop-blur-xl border-border rounded-[3rem] overflow-hidden shadow-2xl shadow-black/5 animate-reveal">
                  <CardHeader className="p-12 pb-6 border-b border-border/50">
                    <Button variant="ghost" className="w-fit mb-6 rounded-xl gap-2 font-bold" onClick={() => setStagingStep('list')}>
                      <ChevronLeft className="w-4 h-4" /> Back to Staging
                    </Button>
                    <div className="flex items-center gap-4">
                      <div className="p-4 rounded-[1.5rem] bg-primary/10 text-primary border border-primary/10 shadow-inner">
                        <FileText className="w-8 h-8" />
                      </div>
                      <div>
                        <CardTitle className="text-4xl font-black tracking-tighter uppercase">Deployment Protocol</CardTitle>
                        <CardDescription className="text-lg font-light">Service ID: {selectedServiceId.toUpperCase()}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-12 space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-8">
                        <h3 className="text-2xl font-black tracking-tight">How It Works</h3>
                        <div className="space-y-6">
                          {[
                            { step: "01", title: "Hardware Procurement", desc: "Select between strategic ownership or flexible leasing for your IoT node." },
                            { step: "02", title: "Physical Integration", desc: "Follow the provided manual to mount and power your physical node." },
                            { step: "03", title: "Node Registry", desc: "Link your device serial ID to the command center to verify integrity." },
                            { step: "04", title: "Distress Configuration", desc: "Define your alert contacts to receive real-time notifications." }
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
                        <Button className="h-14 px-8 rounded-xl font-bold bg-secondary text-foreground hover:bg-primary hover:text-white transition-all gap-2">
                          <Download className="w-5 h-5" /> Download Strategic Manual (PDF)
                        </Button>
                      </div>
                      <div className="bg-primary/5 rounded-[2.5rem] border border-primary/10 p-10 flex flex-col justify-center text-center">
                        <Cpu className="w-20 h-20 text-primary mx-auto mb-6 opacity-20" />
                        <h4 className="text-2xl font-black tracking-tight mb-4">Ready for Hardware?</h4>
                        <p className="text-sm text-muted-foreground font-light mb-8">Proceeding to procurement will allow you to select your node model and shipping protocols.</p>
                        <Button onClick={() => setStagingStep('procurement')} className="h-16 rounded-2xl font-black uppercase tracking-widest text-xs bg-primary shadow-2xl shadow-primary/30">
                          Proceed to Procurement
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {stagingStep === 'procurement' && selectedServiceId && (
                <div className="space-y-12 animate-reveal">
                  <div className="flex items-center justify-between">
                    <Button variant="ghost" className="rounded-xl gap-2 font-bold" onClick={() => setStagingStep('instructions')}>
                      <ChevronLeft className="w-4 h-4" /> Back to Instructions
                    </Button>
                    <Badge className="bg-primary text-white font-black tracking-widest px-4 py-1 uppercase">{selectedServiceId.replace('-', ' ')}</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
                    {/* Ownership Model */}
                    <Card className={cn(
                      "rounded-[3.5rem] overflow-hidden border-4 transition-all cursor-pointer group hover:-translate-y-2 relative shadow-2xl",
                      profile?.purchaseStatus === 'purchased' ? 'border-primary bg-primary/[0.03]' : 'border-border bg-card/60'
                    )} onClick={() => updateProfileData({ purchaseStatus: 'purchased', hasPaidSetupFee: true })}>
                      <div className="relative h-64 w-full">
                        <Image src={HARDWARE_CATALOG[selectedServiceId]?.image} alt="Hardware" fill className="object-cover brightness-75 group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-8 left-8">
                          <Badge className="bg-primary text-white mb-2 uppercase tracking-widest text-[8px]">{HARDWARE_CATALOG[selectedServiceId]?.name}</Badge>
                          <h4 className="text-3xl font-black text-white tracking-tighter">Strategic Ownership</h4>
                        </div>
                      </div>
                      <CardContent className="p-10 space-y-6">
                        <p className="text-sm text-muted-foreground leading-relaxed font-light">{HARDWARE_CATALOG[selectedServiceId]?.description}</p>
                        <div className="flex justify-between items-center p-6 rounded-3xl bg-background border border-border">
                          <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Asset Cost + Shipping</p>
                            <p className="text-2xl font-black tracking-tighter">{HARDWARE_CATALOG[selectedServiceId]?.buyPrice}</p>
                          </div>
                          <CheckCircle2 className={cn("w-8 h-8", profile?.purchaseStatus === 'purchased' ? "text-primary" : "text-muted opacity-20")} />
                        </div>
                        <Button className={cn(
                          "w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs transition-all",
                          profile?.purchaseStatus === 'purchased' ? "bg-primary shadow-xl shadow-primary/20" : "bg-secondary"
                        )}>
                          Select Ownership
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Leasing Model */}
                    <Card className={cn(
                      "rounded-[3.5rem] overflow-hidden border-4 transition-all cursor-pointer group hover:-translate-y-2 relative shadow-2xl",
                      profile?.purchaseStatus === 'leased' ? 'border-accent bg-accent/[0.03]' : 'border-border bg-card/60'
                    )} onClick={() => updateProfileData({ purchaseStatus: 'leased', hasPaidSetupFee: false })}>
                      <div className="relative h-64 w-full">
                        <Image src={HARDWARE_CATALOG[selectedServiceId]?.image} alt="Hardware" fill className="object-cover brightness-75 group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-8 left-8">
                          <Badge className="bg-accent text-accent-foreground mb-2 uppercase tracking-widest text-[8px]">{HARDWARE_CATALOG[selectedServiceId]?.name}</Badge>
                          <h4 className="text-3xl font-black text-white tracking-tighter">Mesh Leasing</h4>
                        </div>
                      </div>
                      <CardContent className="p-10 space-y-6">
                        <p className="text-sm text-muted-foreground leading-relaxed font-light">Flexible monthly hardware access with full remote support and digital manuals.</p>
                        <div className="flex justify-between items-center p-6 rounded-3xl bg-background border border-border">
                          <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Monthly Service Fee</p>
                            <p className="text-2xl font-black tracking-tighter">{HARDWARE_CATALOG[selectedServiceId]?.leasePrice}</p>
                          </div>
                          <CheckCircle2 className={cn("w-8 h-8", profile?.purchaseStatus === 'leased' ? "text-accent" : "text-muted opacity-20")} />
                        </div>
                        <Button variant="outline" className={cn(
                          "w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs transition-all",
                          profile?.purchaseStatus === 'leased' ? "border-accent text-accent bg-accent/5" : "border-border"
                        )}>
                          Select Leasing
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {profile?.purchaseStatus !== 'none' && (
                    <div className="flex justify-center mt-12">
                      <Button onClick={() => setActiveTab('setup')} className="h-16 px-12 rounded-[1.5rem] font-black uppercase tracking-widest text-xs bg-primary shadow-2xl shadow-primary/30 flex items-center gap-4 group">
                        Proceed to Node Integration <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* TAB 3: SETUP & REGISTRY */}
            <TabsContent value="setup" className="space-y-10 animate-reveal outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <Card className="rounded-[3rem] bg-card/60 backdrop-blur-xl border-border overflow-hidden shadow-2xl shadow-black/5">
                  <CardHeader className="p-10 pb-8 border-b border-border/50 bg-secondary/20">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-rwanda-green/10 flex items-center justify-center shadow-inner border border-rwanda-green/5">
                        <Wrench className="w-8 h-8 text-rwanda-green" />
                      </div>
                      <Badge className="bg-rwanda-green/10 text-rwanda-green border-none text-[10px] font-black tracking-widest uppercase py-1 px-4">Tactical Manual</Badge>
                    </div>
                    <CardTitle className="text-4xl font-black tracking-tighter">Setup Protocol</CardTitle>
                    <CardDescription className="text-lg mt-2 font-light">Deploy your nodes with strategic precision across your zone.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 space-y-8">
                    <div className="p-8 rounded-[2.5rem] bg-background/50 border border-border leading-relaxed text-muted-foreground font-light italic text-base relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-1 h-full bg-rwanda-green/40" />
                      {profile?.hasPaidSetupFee 
                        ? "SafeRwanda technicians have been dispatched to your zone. They will handle all physical node linking and perimeter verification. Operation pending technician arrival."
                        : "Initialize your mesh network by following the official SafeRwanda Deployment Guide. This protocol ensures optimal node density and signal integrity across your secure location."}
                    </div>

                    {!profile?.hasPaidSetupFee && (
                      <Button variant="secondary" className="w-full h-20 rounded-[1.75rem] font-black uppercase tracking-[0.2em] text-xs gap-3 shadow-xl group">
                        <Download className="w-6 h-6 group-hover:translate-y-1 transition-transform" /> Download Strategic Manual
                      </Button>
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-[3rem] bg-card/60 backdrop-blur-xl border-primary/20 shadow-2xl shadow-primary/5">
                  <CardHeader className="p-10 pb-8 border-b border-border/50">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center mb-8 border border-primary/5 shadow-inner">
                      <Smartphone className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-4xl font-black tracking-tighter">Node Registry</CardTitle>
                    <CardDescription className="text-lg mt-2 font-light">Link your physical node serial ID to the Command Center.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 space-y-10">
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <Label htmlFor="nodeId" className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Node Serial Identifier</Label>
                        <Input 
                          id="nodeId" 
                          placeholder="SR-NODE-XXXX-XXXX" 
                          value={deviceIdInput} 
                          onChange={(e) => setDeviceIdInput(e.target.value)}
                          className="h-16 rounded-[1.25rem] px-8 bg-background/50 border-border text-xl font-mono tracking-widest focus:ring-primary/20 focus:border-primary/40 transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <Label htmlFor="alertPhone" className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Alert Phone</Label>
                          <div className="relative">
                            <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground opacity-50" />
                            <Input 
                              id="alertPhone" 
                              placeholder="+250 7XX XXX XXX" 
                              value={alertPhone} 
                              onChange={(e) => setAlertPhone(e.target.value)}
                              className="h-16 rounded-[1.25rem] pl-16 bg-background/50 border-border font-bold tracking-tight"
                            />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <Label htmlFor="alertEmail" className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Alert Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground opacity-50" />
                            <Input 
                              id="alertEmail" 
                              type="email"
                              placeholder="agent.alerts@safe.rw" 
                              value={alertEmail} 
                              onChange={(e) => setAlertEmail(e.target.value)}
                              className="h-16 rounded-[1.25rem] pl-16 bg-background/50 border-border font-bold tracking-tight"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => updateProfileData({ deviceId: deviceIdInput, alertPhone, alertEmail })}
                      className="w-full h-20 rounded-[1.75rem] font-black text-sm uppercase tracking-[0.2em] bg-primary shadow-2xl shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all"
                      disabled={updating || !deviceIdInput || !alertPhone || !alertEmail}
                    >
                      {updating ? <Loader2 className="w-6 h-6 animate-spin" /> : "Authenticate & Link Node"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 4: ACTIVATION */}
            <TabsContent value="activation" className="animate-reveal outline-none">
              <Card className="max-w-4xl mx-auto rounded-[4rem] border-rwanda-green/20 overflow-hidden shadow-2xl shadow-black/10">
                <CardHeader className="p-16 text-center bg-gradient-to-b from-rwanda-green/[0.05] to-transparent border-b border-rwanda-green/10">
                  <div className="w-24 h-24 rounded-[2.5rem] bg-rwanda-green/10 flex items-center justify-center mx-auto mb-8 shadow-inner border border-rwanda-green/5">
                    <Zap className="w-12 h-12 text-rwanda-green" />
                  </div>
                  <Badge className="bg-rwanda-green text-white border-none text-[10px] font-black tracking-[0.5em] uppercase py-2 px-6 mb-6 mx-auto w-fit">Strategic Activation</Badge>
                  <CardTitle className="text-6xl font-black tracking-tighter">Mission Control</CardTitle>
                  <CardDescription className="text-xl mt-6 font-light max-w-lg mx-auto leading-relaxed">Authorize your 24/7 mesh monitoring protocols and maintain real-time strategic coverage.</CardDescription>
                </CardHeader>
                <CardContent className="p-16">
                  <RadioGroup value={subType} onValueChange={setSubType} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { id: 'weekly', label: 'Tactical Weekly', price: 'RWF 5,000', note: 'Short-term coverage' },
                      { id: 'monthly', label: 'Strategic Monthly', price: 'RWF 18,000', note: 'Continuous protection' },
                      { id: 'yearly', label: 'Annual Mastery', price: 'RWF 180,000', note: 'Maximized mesh loyalty' }
                    ].map((plan) => (
                      <div 
                        key={plan.id}
                        onClick={() => setSubType(plan.id)}
                        className={cn(
                          "p-10 rounded-[3rem] border-4 transition-all cursor-pointer flex flex-col justify-between text-center relative overflow-hidden group",
                          subType === plan.id ? 'border-primary bg-primary/[0.03] shadow-2xl shadow-primary/10' : 'border-border bg-background hover:border-primary/40'
                        )}
                      >
                         {subType === plan.id && (
                          <div className="absolute top-6 right-6">
                            <RadioGroupItem value={plan.id} id={plan.id} className="sr-only" />
                            <CheckCircle2 className="w-8 h-8 text-primary" />
                          </div>
                        )}
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 opacity-60">{plan.note}</p>
                          <h4 className="font-black text-2xl tracking-tighter mb-2">{plan.label}</h4>
                          <div className="text-3xl font-black text-primary tracking-tighter mt-6">{plan.price}</div>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
                <CardFooter className="p-16 pt-0 flex flex-col gap-10 text-center">
                  <Button 
                    onClick={() => updateProfileData({ subscriptionActive: true, subscriptionType: subType })}
                    className="w-full h-24 rounded-[2rem] bg-primary text-3xl font-black shadow-[0_0_60px_rgba(37,99,235,0.4)] hover:scale-[1.01] active:scale-[0.99] transition-all"
                    disabled={updating || !profile?.deviceId}
                  >
                    {updating ? <Loader2 className="w-8 h-8 animate-spin" /> : "Authorize Activation"}
                  </Button>
                  {!profile?.deviceId && (
                    <div className="flex items-center justify-center gap-3 text-destructive font-black uppercase tracking-[0.3em] text-[10px] bg-destructive/10 py-5 px-10 rounded-[1.5rem] border border-destructive/20 animate-pulse">
                      <AlertTriangle className="w-5 h-5" /> Authenticate hardware before system activation
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
           <div className="flex items-center justify-center gap-3 mb-6">
             <Shield className="w-5 h-5 text-primary opacity-40" />
             <span className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground opacity-50">SafeRwanda Infrastructure Network</span>
           </div>
           <p className="text-[10px] text-muted-foreground font-black tracking-[0.2em] uppercase opacity-30">
             © {new Date().getFullYear()} Strategic Operator Registry. All Rights Reserved.
           </p>
        </div>
      </footer>
    </div>
  );
}
