
'use client';

import { useEffect, useState } from 'react';
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
  PlusCircle,
  Cpu,
  LayoutDashboard,
  ShoppingCart,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Tab state: 'overview' | 'staging' | 'procurement' | 'setup' | 'activation'
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Form states
  const [deviceIdInput, setDeviceIdInput] = useState('');
  const [alertPhone, setAlertPhone] = useState('');
  const [alertEmail, setAlertEmail] = useState('');
  const [subType, setSubType] = useState('monthly');

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.replace('/auth');
      return;
    }

    const fetchProfile = async () => {
      try {
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
      {/* Visual background flares */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      <main className="flex-grow pt-32 pb-24 relative z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 animate-fade-in">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/5">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <Badge variant="outline" className={cn(
                    "font-bold uppercase tracking-widest text-[9px] px-2 py-0.5 mb-1",
                    profile?.subscriptionActive ? "border-rwanda-green text-rwanda-green bg-rwanda-green/5" : "border-amber-500 text-amber-500 bg-amber-500/5"
                  )}>
                    {profile?.subscriptionActive ? 'System Active' : 'Activation Required'}
                  </Badge>
                  <h1 className="text-3xl md:text-5xl font-headline font-extrabold tracking-tight">Agent {profile?.fullName?.split(' ')[0] || 'Operator'}</h1>
                </div>
              </div>
              <p className="text-muted-foreground text-sm md:text-base font-light">SafeRwanda strategic operations dashboard.</p>
            </div>
            <div className="flex items-center gap-3 bg-card/50 backdrop-blur-md p-2 rounded-2xl border border-border shadow-sm">
              <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl hover:bg-primary/10 hover:text-primary"><Bell className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl hover:bg-primary/10 hover:text-primary"><Settings className="w-5 h-5" /></Button>
              <div className="h-8 w-px bg-border mx-1" />
              <Button variant="destructive" className="h-11 px-6 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-destructive/10" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
                Authenticate Out
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-10">
            <TabsList className="flex h-auto p-1.5 bg-secondary/50 backdrop-blur-xl rounded-[1.75rem] border border-border/50 sticky top-24 z-50 overflow-x-auto no-scrollbar">
              {[
                { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
                { id: 'staging', icon: ShoppingCart, label: 'Protocol Staging' },
                { id: 'procurement', icon: Package, label: 'Procurement' },
                { id: 'setup', icon: Wrench, label: 'Registry & Setup' },
                { id: 'activation', icon: Zap, label: 'Activation' },
              ].map((tab) => (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id} 
                  className="rounded-2xl py-3.5 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl data-[state=active]:shadow-primary/20 transition-all font-bold flex items-center gap-2.5 min-w-fit"
                >
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* TAB 1: OVERVIEW */}
            <TabsContent value="overview" className="space-y-8 animate-reveal">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-primary/[0.03] border-primary/20 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow group overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500" />
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Live Nodes</CardTitle>
                    <Cpu className="w-4 h-4 text-primary" />
                  </CardHeader>
                  <CardContent><div className="text-5xl font-black tracking-tighter">{profile?.deviceId ? '01' : '00'}</div></CardContent>
                </Card>
                <Card className="bg-accent/[0.03] border-accent/20 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow group overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500" />
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Staged Domains</CardTitle>
                    <ListChecks className="w-4 h-4 text-accent" />
                  </CardHeader>
                  <CardContent><div className="text-5xl font-black tracking-tighter">{profile?.servicesSelected?.length || 0}</div></CardContent>
                </Card>
                <Card className="bg-rwanda-green/[0.03] border-rwanda-green/20 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow group overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-rwanda-green/10 rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500" />
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-rwanda-green">Signal Strength</CardTitle>
                    <Wifi className="w-4 h-4 text-rwanda-green" />
                  </CardHeader>
                  <CardContent><div className="text-5xl font-black tracking-tighter">{profile?.deviceId ? '98%' : '0%'}</div></CardContent>
                </Card>
                <Card className="bg-secondary/20 border-border rounded-[2rem] shadow-sm group overflow-hidden relative">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Alert History</CardTitle>
                    <Activity className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent><div className="text-5xl font-black tracking-tighter">0</div></CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 bg-card/60 backdrop-blur-sm border-border rounded-[2.5rem] overflow-hidden shadow-xl shadow-black/5">
                  <CardHeader className="p-8 pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl font-bold">Hardware Inventory</CardTitle>
                      <CardDescription className="text-sm">Manage physical security mesh nodes linked to your profile.</CardDescription>
                    </div>
                    <Button variant="outline" className="rounded-2xl font-bold gap-2 border-primary/20 text-primary bg-primary/5 h-11" onClick={() => setActiveTab('setup')}>
                      <PlusCircle className="w-4 h-4" /> Register Node
                    </Button>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 space-y-6">
                    {profile?.deviceId ? (
                      <div className="p-8 rounded-[2rem] bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-6">
                          <div className="h-20 w-20 rounded-[1.75rem] bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                            <Smartphone className="w-10 h-10 text-primary" />
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] mb-1 block">Primary Command Node</span>
                            <span className="font-bold text-3xl font-mono block tracking-tighter text-gradient">{profile.deviceId}</span>
                            <div className="flex items-center gap-4 mt-2">
                               <div className="flex items-center gap-1.5">
                                 <div className="w-2 h-2 rounded-full bg-rwanda-green animate-pulse shadow-[0_0_8px_rgba(32,96,61,0.6)]" />
                                 <span className="text-[10px] font-bold text-rwanda-green uppercase tracking-widest">Encrypted Stream Active</span>
                               </div>
                            </div>
                          </div>
                        </div>
                        <Button variant="secondary" className="rounded-xl h-11 font-bold">Configure Protocols</Button>
                      </div>
                    ) : (
                      <div className="py-20 text-center border-2 border-dashed border-border rounded-[2.5rem] bg-secondary/10">
                        <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Smartphone className="w-10 h-10 text-muted-foreground opacity-20" />
                        </div>
                        <h4 className="text-xl font-bold mb-2">No Active Hardware</h4>
                        <p className="text-muted-foreground max-w-xs mx-auto text-sm mb-8 leading-relaxed">Your command center is awaiting hardware integration. Proceed to procurement to initialize your mesh.</p>
                        <Button variant="primary" onClick={() => setActiveTab('procurement')} className="rounded-2xl h-12 px-8 font-bold bg-primary shadow-lg shadow-primary/20">Explore Procurement</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-card/60 backdrop-blur-sm border-border rounded-[2.5rem] overflow-hidden shadow-xl shadow-black/5">
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-2xl font-bold">Deployment Staging</CardTitle>
                    <CardDescription className="text-sm">Protocols staged for hardware linking.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 space-y-4">
                    {profile?.servicesSelected?.length > 0 ? (
                      <div className="space-y-3">
                        {profile.servicesSelected.slice(0, 4).map((s: string) => (
                          <div key={s} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-border group hover:border-primary/30 transition-colors">
                            <div className="flex items-center gap-3">
                              <Shield className="w-4 h-4 text-primary opacity-60" />
                              <span className="capitalize font-bold text-sm">{s.replace('-', ' ')}</span>
                            </div>
                            <CheckCircle2 className="w-4 h-4 text-rwanda-green" />
                          </div>
                        ))}
                        {profile.servicesSelected.length > 4 && (
                          <p className="text-[10px] text-center text-muted-foreground font-bold tracking-widest uppercase">+{profile.servicesSelected.length - 4} More Active Protocols</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic text-center py-12">No domains selected during onboarding.</p>
                    )}
                    <Button variant="ghost" onClick={() => setActiveTab('staging')} className="w-full text-primary font-bold hover:bg-primary/5 rounded-2xl h-11 mt-4">Manage Staging Area</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 2: STAGING (THE CART) */}
            <TabsContent value="staging" className="space-y-8 animate-reveal">
              <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/5">
                <CardHeader className="p-10 border-b border-border bg-gradient-to-r from-secondary/50 to-transparent">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-3xl font-extrabold tracking-tight">Deployment Staging Area</CardTitle>
                  </div>
                  <CardDescription className="text-base">Review the strategic security protocols currently associated with your operator profile.</CardDescription>
                </CardHeader>
                <CardContent className="p-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {profile?.servicesSelected?.length > 0 ? (
                      profile.servicesSelected.map((serviceId: string) => (
                        <div key={serviceId} className="p-8 rounded-[2rem] border bg-background border-border shadow-sm flex flex-col justify-between group hover:border-primary hover:shadow-xl hover:shadow-primary/5 transition-all h-full relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Shield className="w-16 h-16" />
                          </div>
                          <div className="relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/5">
                              <Shield className="w-7 h-7 text-primary" />
                            </div>
                            <h4 className="font-extrabold text-xl capitalize mb-2">{serviceId.replace('-', ' ')}</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed font-light mb-6">Strategic domain prioritized for your account. Hardware linking required for live telemetry.</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black tracking-widest uppercase py-1">Ready for Node</Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-24 text-center border-2 border-dashed border-border rounded-[2.5rem] bg-secondary/5">
                        <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-10" />
                        <h4 className="text-2xl font-bold mb-2">Staging Area Empty</h4>
                        <p className="text-muted-foreground font-medium mb-8 max-w-sm mx-auto leading-relaxed">You haven't initialized any security domains. Explore our services to build your protection roadmap.</p>
                        <Button onClick={() => router.push('/services')} className="rounded-2xl h-14 px-10 font-bold bg-primary shadow-xl shadow-primary/20 text-lg">Browse Service Catalog</Button>
                      </div>
                    )}
                  </div>
                  
                  {profile?.servicesSelected?.length > 0 && (
                    <div className="flex flex-col md:flex-row items-center justify-between p-10 bg-primary/5 rounded-[2.5rem] border border-primary/10 gap-8">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[1.25rem] bg-primary/20 flex items-center justify-center shrink-0">
                          <Package className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-2xl font-extrabold mb-1">Commit to Procurement</h4>
                          <p className="text-sm text-muted-foreground font-light">Your protocols are staged. Select a hardware procurement model to continue deployment.</p>
                        </div>
                      </div>
                      <Button onClick={() => setActiveTab('procurement')} className="h-16 px-10 rounded-2xl font-bold text-lg bg-primary shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-3">
                        Proceed to Procurement <ArrowRight className="w-5 h-5" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: PROCUREMENT */}
            <TabsContent value="procurement" className="space-y-12 animate-reveal">
               <div className="text-center max-w-2xl mx-auto mb-4">
                <h2 className="text-4xl font-extrabold tracking-tight mb-4">Hardware Procurement Models</h2>
                <p className="text-muted-foreground text-lg font-light leading-relaxed">Choose the node deployment strategy that aligns with your security architecture.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
                {/* Ownership Model */}
                <Card className={cn(
                  "rounded-[3rem] overflow-hidden border-4 transition-all cursor-pointer group hover:-translate-y-2 relative",
                  profile?.purchaseStatus === 'purchased' ? 'border-primary bg-primary/[0.02]' : 'border-border bg-card/60 backdrop-blur-sm'
                )} onClick={() => updateProfileData({ purchaseStatus: 'purchased', hasPaidSetupFee: true })}>
                  {profile?.purchaseStatus === 'purchased' && (
                    <div className="absolute top-8 right-8 text-primary">
                      <CheckCircle2 className="w-8 h-8 fill-primary text-white" />
                    </div>
                  )}
                  <CardHeader className="p-12 pb-6">
                    <div className="w-20 h-20 rounded-[2rem] bg-primary/10 flex items-center justify-center mb-8 border border-primary/5 shadow-inner">
                      <Package className="w-10 h-10 text-primary" />
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className="bg-primary text-white border-none text-[9px] font-black tracking-widest">PREMIUM</Badge>
                      <span className="text-xs font-bold text-primary uppercase tracking-widest">Strategic Asset</span>
                    </div>
                    <CardTitle className="text-4xl font-black tracking-tighter">Ownership Model</CardTitle>
                    <CardDescription className="text-lg mt-4 leading-relaxed font-light">Buy nodes outright with professional setup and white-glove maintenance.</CardDescription>
                  </CardHeader>
                  <CardContent className="px-12 pb-12 space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 border border-border">
                        <Wrench className="w-5 h-5 text-primary" />
                        <span className="text-sm font-bold">White-Glove Tech Installation</span>
                      </div>
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 border border-border">
                        <Shield className="w-5 h-5 text-primary" />
                        <span className="text-sm font-bold">Lifetime Node Hardware Warranty</span>
                      </div>
                    </div>
                    <Button className={cn(
                      "w-full h-16 rounded-2xl font-bold text-xl transition-all shadow-xl",
                      profile?.purchaseStatus === 'purchased' ? 'bg-primary shadow-primary/20' : 'bg-secondary text-foreground hover:bg-primary hover:text-white'
                    )}>
                      {profile?.purchaseStatus === 'purchased' ? 'Selected Protocol' : 'Choose Ownership'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Leasing Model */}
                <Card className={cn(
                  "rounded-[3rem] overflow-hidden border-4 transition-all cursor-pointer group hover:-translate-y-2 relative",
                  profile?.purchaseStatus === 'leased' ? 'border-accent bg-accent/[0.02]' : 'border-border bg-card/60 backdrop-blur-sm'
                )} onClick={() => updateProfileData({ purchaseStatus: 'leased', hasPaidSetupFee: false })}>
                   {profile?.purchaseStatus === 'leased' && (
                    <div className="absolute top-8 right-8 text-accent">
                      <CheckCircle2 className="w-8 h-8 fill-accent text-white" />
                    </div>
                  )}
                  <CardHeader className="p-12 pb-6">
                    <div className="w-20 h-20 rounded-[2rem] bg-accent/10 flex items-center justify-center mb-8 border border-accent/5 shadow-inner">
                      <CreditCard className="w-10 h-10 text-accent" />
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className="bg-accent text-accent-foreground border-none text-[9px] font-black tracking-widest">FLEXIBLE</Badge>
                      <span className="text-xs font-bold text-accent uppercase tracking-widest">Subscription Asset</span>
                    </div>
                    <CardTitle className="text-4xl font-black tracking-tighter">Leasing Model</CardTitle>
                    <CardDescription className="text-lg mt-4 leading-relaxed font-light">Flexible monthly hardware subscription with self-service setup protocols.</CardDescription>
                  </CardHeader>
                  <CardContent className="px-12 pb-12 space-y-8">
                     <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 border border-border">
                        <Download className="w-5 h-5 text-accent" />
                        <span className="text-sm font-bold">Comprehensive Self-Setup Guides</span>
                      </div>
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 border border-border">
                        <CreditCard className="w-5 h-5 text-accent" />
                        <span className="text-sm font-bold">Zero Upfront Hardware Capital</span>
                      </div>
                    </div>
                    <Button variant="outline" className={cn(
                      "w-full h-16 rounded-2xl font-bold text-xl transition-all shadow-xl",
                      profile?.purchaseStatus === 'leased' ? 'border-accent text-accent bg-accent/5 shadow-accent/10' : 'border-border text-foreground hover:border-accent hover:text-accent'
                    )}>
                      {profile?.purchaseStatus === 'leased' ? 'Selected Protocol' : 'Choose Leasing'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 4: SETUP & REGISTRY */}
            <TabsContent value="setup" className="space-y-10 animate-reveal">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <Card className="rounded-[3rem] bg-card/60 backdrop-blur-sm border-border overflow-hidden shadow-2xl shadow-black/5">
                  <CardHeader className="p-10 pb-8 border-b border-border/50 bg-secondary/20">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-rwanda-green/10 flex items-center justify-center shadow-inner border border-rwanda-green/5">
                        <Wrench className="w-7 h-7 text-rwanda-green" />
                      </div>
                      <Badge className="bg-rwanda-green/10 text-rwanda-green border-none text-[10px] font-black tracking-widest uppercase py-1">Tactical Guide</Badge>
                    </div>
                    <CardTitle className="text-4xl font-black tracking-tighter">Setup Protocols</CardTitle>
                    <CardDescription className="text-lg mt-2 font-light">Deploy your hardware nodes with strategic precision.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 space-y-8">
                    <div className="p-8 rounded-[2rem] bg-background/50 border border-border leading-relaxed text-muted-foreground font-light italic text-base">
                      {profile?.hasPaidSetupFee 
                        ? "SafeRwanda elite technicians have been dispatched to your operational zone. They will handle all physical node linking and perimeter verification. You do not need to perform manual setup."
                        : "Initialize your mesh network by following the comprehensive SafeRwanda Deployment Guide. This protocol ensures optimal node density and perimeter integrity across your secure location."}
                    </div>

                    {!profile?.hasPaidSetupFee && (
                      <Button variant="secondary" className="w-full h-16 rounded-2xl font-bold text-lg gap-3 shadow-lg group">
                        <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" /> Download Strategic Manual (PDF)
                      </Button>
                    )}

                    {profile?.hasPaidSetupFee && (
                      <div className="flex items-center gap-4 p-6 rounded-2xl bg-rwanda-green/10 border border-rwanda-green/20 text-rwanda-green font-bold shadow-inner">
                        <div className="p-2 rounded-xl bg-rwanda-green/20">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div className="text-sm">
                          <p className="font-black uppercase tracking-widest text-[10px] mb-1">Status: Operational</p>
                          <p>Technician Dispatch Authorized & Confirmed</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-[3rem] bg-card/60 backdrop-blur-sm border-primary/20 shadow-2xl shadow-primary/5">
                  <CardHeader className="p-10 pb-8 border-b border-border/50">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/5 shadow-inner">
                      <Smartphone className="w-7 h-7 text-primary" />
                    </div>
                    <CardTitle className="text-4xl font-black tracking-tighter">Node Registry</CardTitle>
                    <CardDescription className="text-lg mt-2 font-light">Authenticate and link your physical nodes to the Command Center.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 space-y-8">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="nodeId" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Physical Device Serial ID</Label>
                        <Input 
                          id="nodeId" 
                          placeholder="SR-NODE-XXXX-XXXX" 
                          value={deviceIdInput} 
                          onChange={(e) => setDeviceIdInput(e.target.value)}
                          className="h-16 rounded-2xl px-6 bg-background/50 border-border text-lg font-mono tracking-wider focus:ring-primary/20"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="alertPhone" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Distress Alert Phone</Label>
                          <div className="relative">
                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input 
                              id="alertPhone" 
                              placeholder="+250 7XX XXX XXX" 
                              value={alertPhone} 
                              onChange={(e) => setAlertPhone(e.target.value)}
                              className="h-16 rounded-2xl pl-14 bg-background/50 border-border font-bold"
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="alertEmail" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Distress Alert Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input 
                              id="alertEmail" 
                              type="email"
                              placeholder="agent.alert@safe.rw" 
                              value={alertEmail} 
                              onChange={(e) => setAlertEmail(e.target.value)}
                              className="h-16 rounded-2xl pl-14 bg-background/50 border-border font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => updateProfileData({ deviceId: deviceIdInput, alertPhone, alertEmail })}
                      className="w-full h-16 rounded-2xl font-extrabold text-xl bg-primary shadow-2xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                      disabled={updating || !deviceIdInput || !alertPhone || !alertEmail}
                    >
                      {updating ? <Loader2 className="w-6 h-6 animate-spin" /> : "Authenticate & Link Node"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 5: ACTIVATION */}
            <TabsContent value="activation" className="animate-reveal">
              <Card className="max-w-4xl mx-auto rounded-[3.5rem] border-rwanda-green/20 overflow-hidden shadow-2xl shadow-black/10">
                <CardHeader className="p-12 text-center bg-gradient-to-b from-rwanda-green/[0.05] to-transparent border-b border-rwanda-green/10">
                  <div className="w-20 h-20 rounded-[2rem] bg-rwanda-green/10 flex items-center justify-center mx-auto mb-6 shadow-inner border border-rwanda-green/5">
                    <Zap className="w-10 h-10 text-rwanda-green" />
                  </div>
                  <Badge className="bg-rwanda-green text-white border-none text-[10px] font-black tracking-[0.3em] uppercase py-1 px-4 mb-4">Strategic Activation</Badge>
                  <CardTitle className="text-5xl font-black tracking-tighter">Mission Control Activation</CardTitle>
                  <CardDescription className="text-xl mt-4 font-light max-w-lg mx-auto leading-relaxed">Authorize your 24/7 mesh monitoring protocols and maintain real-time strategic coverage.</CardDescription>
                </CardHeader>
                <CardContent className="p-12">
                  <RadioGroup value={subType} onValueChange={setSubType} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { id: 'weekly', label: 'Tactical Weekly', price: 'RWF 5,000', note: 'Short-term coverage' },
                      { id: 'monthly', label: 'Strategic Monthly', price: 'RWF 18,000', note: 'Continuous protection' },
                      { id: 'yearly', label: 'Annual Mastery', price: 'RWF 180,000', note: 'Maximized mesh loyalty' }
                    ].map((plan) => (
                      <div 
                        key={plan.id}
                        onClick={() => setSubType(plan.id)}
                        className={cn(
                          "p-8 rounded-[2.5rem] border-4 transition-all cursor-pointer flex flex-col justify-between text-center relative overflow-hidden group",
                          subType === plan.id ? 'border-primary bg-primary/[0.03] shadow-xl shadow-primary/5' : 'border-border bg-background hover:border-primary/30'
                        )}
                      >
                         {subType === plan.id && (
                          <div className="absolute top-4 right-4">
                            <RadioGroupItem value={plan.id} id={plan.id} className="sr-only" />
                            <CheckCircle2 className="w-6 h-6 text-primary" />
                          </div>
                        )}
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 opacity-60">{plan.note}</p>
                          <h4 className="font-black text-2xl tracking-tighter mb-1">{plan.label}</h4>
                          <div className="text-3xl font-black text-primary tracking-tighter mt-4">{plan.price}</div>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
                <CardFooter className="p-12 pt-0 flex flex-col gap-8 text-center">
                  <Button 
                    onClick={() => updateProfileData({ subscriptionActive: true, subscriptionType: subType })}
                    className="w-full h-20 rounded-[1.75rem] bg-primary text-2xl font-black shadow-2xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                    disabled={updating || !profile?.deviceId}
                  >
                    {updating ? <Loader2 className="w-6 h-6 animate-spin" /> : "Authorize & Activate Mission Control"}
                  </Button>
                  {!profile?.deviceId && (
                    <div className="flex items-center justify-center gap-2 text-destructive font-black uppercase tracking-[0.2em] text-[10px] bg-destructive/10 py-3 px-6 rounded-2xl border border-destructive/20 animate-pulse">
                      <AlertTriangle className="w-4 h-4" /> Link a physical node before system activation
                    </div>
                  )}
                  <div className="space-y-2">
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em]">Secure Strategic Processing • AES-256 Quantum Encrypted</p>
                    <div className="flex justify-center gap-4 opacity-30 grayscale contrast-125">
                      <div className="h-4 w-12 bg-muted rounded" />
                      <div className="h-4 w-12 bg-muted rounded" />
                      <div className="h-4 w-12 bg-muted rounded" />
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      </main>

      <footer className="py-12 border-t border-border/50 bg-background/50 backdrop-blur-md relative z-10">
        <div className="container mx-auto px-4 text-center">
           <div className="flex items-center justify-center gap-2 mb-4">
             <Shield className="w-4 h-4 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">SafeRwanda Strategic Infrastructure</span>
           </div>
           <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase opacity-40">
             © {new Date().getFullYear()} Operator Registry Labs. All Nodes Secured.
           </p>
        </div>
      </footer>
    </div>
  );
}
