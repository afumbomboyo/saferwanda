
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
  ShoppingCart
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
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-4">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 animate-fade-in">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={cn(
                  "font-bold uppercase tracking-widest text-[10px]",
                  profile?.subscriptionActive ? "border-rwanda-green text-rwanda-green bg-rwanda-green/5" : "border-amber-500 text-amber-500 bg-amber-500/5"
                )}>
                  {profile?.subscriptionActive ? 'System Active' : 'Activation Required'}
                </Badge>
                {profile?.deviceId && (
                  <Badge variant="outline" className="border-primary text-primary bg-primary/5 font-mono text-[10px]">
                    Node ID: {profile.deviceId}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-headline font-extrabold tracking-tight">Agent {profile?.fullName?.split(' ')[0] || 'Operator'}</h1>
              <p className="text-muted-foreground mt-2">SafeRwanda strategic operations dashboard.</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-border"><Bell className="w-5 h-5" /></Button>
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-border"><Settings className="w-5 h-5" /></Button>
              <Button variant="destructive" className="h-12 px-6 rounded-xl font-bold flex items-center gap-2" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
                Log Out
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto p-1 bg-secondary/30 rounded-2xl mb-12 border border-border">
              <TabsTrigger value="overview" className="rounded-xl py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold flex gap-2">
                <LayoutDashboard className="w-4 h-4" /> Overview
              </TabsTrigger>
              <TabsTrigger value="staging" className="rounded-xl py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold flex gap-2">
                <ShoppingCart className="w-4 h-4" /> Staging
              </TabsTrigger>
              <TabsTrigger value="procurement" className="rounded-xl py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold flex gap-2">
                <Package className="w-4 h-4" /> Procure
              </TabsTrigger>
              <TabsTrigger value="setup" className="rounded-xl py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold flex gap-2">
                <Wrench className="w-4 h-4" /> Setup
              </TabsTrigger>
              <TabsTrigger value="activation" className="rounded-xl py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold flex gap-2">
                <Shield className="w-4 h-4" /> Activate
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: OVERVIEW */}
            <TabsContent value="overview" className="animate-reveal">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <Card className="bg-primary/5 border-primary/20 rounded-3xl">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary">Live Nodes</CardTitle>
                    <Cpu className="w-4 h-4 text-primary" />
                  </CardHeader>
                  <CardContent><div className="text-4xl font-black">{profile?.deviceId ? '01' : '00'}</div></CardContent>
                </Card>
                <Card className="bg-accent/5 border-accent/20 rounded-3xl">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-accent">Staged Protocols</CardTitle>
                    <ListChecks className="w-4 h-4 text-accent" />
                  </CardHeader>
                  <CardContent><div className="text-4xl font-black">{profile?.servicesSelected?.length || 0}</div></CardContent>
                </Card>
                <Card className="bg-rwanda-green/5 border-rwanda-green/20 rounded-3xl">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-rwanda-green">Connectivity</CardTitle>
                    <Wifi className="w-4 h-4 text-rwanda-green" />
                  </CardHeader>
                  <CardContent><div className="text-4xl font-black">{profile?.deviceId ? '98%' : '0%'}</div></CardContent>
                </Card>
                <Card className="bg-secondary/20 border-border rounded-3xl">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Alerts</CardTitle>
                    <Activity className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent><div className="text-4xl font-black">0</div></CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 bg-card border-border rounded-[2rem] overflow-hidden">
                  <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold">Hardware Inventory</CardTitle>
                      <CardDescription>View your registered security mesh nodes.</CardDescription>
                    </div>
                    <Button variant="outline" className="rounded-xl font-bold gap-2" onClick={() => setActiveTab('setup')}>
                      <PlusCircle className="w-4 h-4" /> Register New
                    </Button>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 space-y-4">
                    {profile?.deviceId ? (
                      <div className="p-6 rounded-2xl bg-secondary/30 border border-border flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-6">
                          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Smartphone className="w-8 h-8 text-primary" />
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground uppercase font-black tracking-widest">Master Node</span>
                            <span className="font-bold text-2xl font-mono block">{profile.deviceId}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-rwanda-green animate-pulse" />
                          <span className="text-xs font-bold text-rwanda-green uppercase tracking-widest">Online</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-12 text-center border-2 border-dashed border-border rounded-3xl">
                        <Smartphone className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <p className="text-muted-foreground font-medium mb-4">No hardware nodes linked to this account.</p>
                        <Button variant="secondary" onClick={() => setActiveTab('procurement')} className="rounded-xl font-bold">Explore Procurement</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-card border-border rounded-[2rem] overflow-hidden">
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-2xl font-bold">Quick Staging</CardTitle>
                    <CardDescription>Protocols ready for hardware.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 space-y-4">
                    {profile?.servicesSelected?.length > 0 ? (
                      profile.servicesSelected.map((s: string) => (
                        <div key={s} className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border">
                          <span className="capitalize font-bold text-sm">{s.replace('-', ' ')}</span>
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic text-center py-8">No protocols selected.</p>
                    )}
                    <Button variant="link" onClick={() => setActiveTab('staging')} className="w-full text-primary font-bold">View Staging Area</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 2: STAGING (THE CART) */}
            <TabsContent value="staging" className="animate-reveal">
              <Card className="bg-card border-border rounded-[2rem] overflow-hidden">
                <CardHeader className="p-10 border-b border-border bg-secondary/10">
                  <CardTitle className="text-3xl">Deployment Staging Area</CardTitle>
                  <CardDescription>Review security protocols selected during onboarding.</CardDescription>
                </CardHeader>
                <CardContent className="p-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {profile?.servicesSelected?.length > 0 ? (
                      profile.servicesSelected.map((serviceId: string) => (
                        <div key={serviceId} className="p-6 rounded-2xl border bg-card border-border shadow-sm flex items-center justify-between group hover:border-primary transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                              <Shield className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <span className="font-bold capitalize block">{serviceId.replace('-', ' ')}</span>
                              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Staged</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-3xl">
                        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <p className="text-muted-foreground font-medium mb-4">Your staging area is empty.</p>
                        <Button onClick={() => router.push('/services')} className="rounded-xl font-bold bg-primary">Browse Service Catalog</Button>
                      </div>
                    )}
                  </div>
                  {profile?.servicesSelected?.length > 0 && (
                    <div className="flex flex-col md:flex-row items-center justify-between p-8 bg-primary/5 rounded-3xl border border-primary/20 gap-6">
                      <div>
                        <h4 className="text-xl font-bold mb-1">Commit to Procurement</h4>
                        <p className="text-sm text-muted-foreground">Select hardware options for these staged protocols.</p>
                      </div>
                      <Button onClick={() => setActiveTab('procurement')} className="h-14 px-8 rounded-xl font-bold bg-primary shadow-xl shadow-primary/20">
                        Proceed to Procurement <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: PROCUREMENT */}
            <TabsContent value="procurement" className="animate-reveal">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className={cn(
                  "rounded-[2rem] overflow-hidden border-2 transition-all cursor-pointer group",
                  profile?.purchaseStatus === 'purchased' ? 'border-primary bg-primary/5' : 'border-border bg-card'
                )} onClick={() => updateProfileData({ purchaseStatus: 'purchased', hasPaidSetupFee: true })}>
                  <CardHeader className="p-10 pb-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                      <Package className="w-10 h-10 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-bold">Ownership Model</CardTitle>
                    <CardDescription className="text-base mt-2">Buy nodes outright with professional setup.</CardDescription>
                  </CardHeader>
                  <CardContent className="px-10 pb-10 space-y-6">
                    <p className="text-muted-foreground text-sm leading-relaxed">Includes professional installation by SafeRwanda technicians to ensure 100% mesh coverage.</p>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3 text-sm font-bold"><CheckCircle2 className="w-4 h-4 text-primary" /> White-Glove Installation</li>
                      <li className="flex items-center gap-3 text-sm font-bold"><CheckCircle2 className="w-4 h-4 text-primary" /> Lifetime Node Warranty</li>
                    </ul>
                    <Button className="w-full h-14 rounded-xl font-bold text-lg mt-4 bg-primary">
                      {profile?.purchaseStatus === 'purchased' ? 'Selected' : 'Choose Ownership'}
                    </Button>
                  </CardContent>
                </Card>

                <Card className={cn(
                  "rounded-[2rem] overflow-hidden border-2 transition-all cursor-pointer group",
                  profile?.purchaseStatus === 'leased' ? 'border-accent bg-accent/5' : 'border-border bg-card'
                )} onClick={() => updateProfileData({ purchaseStatus: 'leased', hasPaidSetupFee: false })}>
                  <CardHeader className="p-10 pb-4">
                    <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                      <CreditCard className="w-10 h-10 text-accent" />
                    </div>
                    <CardTitle className="text-3xl font-bold">Leasing Model</CardTitle>
                    <CardDescription className="text-base mt-2">Monthly hardware subscription.</CardDescription>
                  </CardHeader>
                  <CardContent className="px-10 pb-10 space-y-6">
                    <p className="text-muted-foreground text-sm leading-relaxed">Flexible monthly hardware subscription designed for self-installation via setup protocols.</p>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3 text-sm font-bold"><CheckCircle2 className="w-4 h-4 text-accent" /> Low Initial Cost</li>
                      <li className="flex items-center gap-3 text-sm font-bold"><CheckCircle2 className="w-4 h-4 text-accent" /> Self-Setup Protocols</li>
                    </ul>
                    <Button variant="outline" className="w-full h-14 rounded-xl font-bold text-lg mt-4 border-accent text-accent hover:bg-accent/10">
                      {profile?.purchaseStatus === 'leased' ? 'Selected' : 'Choose Leasing'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 4: SETUP & REGISTRY */}
            <TabsContent value="setup" className="animate-reveal">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="rounded-[2rem] bg-card border-border overflow-hidden">
                  <CardHeader className="p-10 pb-6 border-b border-border bg-secondary/5">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-rwanda-green/10 flex items-center justify-center">
                        <Wrench className="w-6 h-6 text-rwanda-green" />
                      </div>
                      <Badge className="bg-rwanda-green/10 text-rwanda-green border-none">Setup Protocols</Badge>
                    </div>
                    <CardTitle className="text-3xl font-bold">Instruction Manual</CardTitle>
                    <CardDescription>Deploy your hardware nodes effectively.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 space-y-6">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {profile?.hasPaidSetupFee 
                        ? "SafeRwanda technicians are dispatched to your location for professional node linking. No manual setup required."
                        : "Follow the comprehensive guide to ensure optimal node connectivity and perimeter integrity within your location."}
                    </p>
                    {!profile?.hasPaidSetupFee && (
                      <Button variant="secondary" className="w-full h-12 rounded-xl font-bold gap-2">
                        <Download className="w-4 h-4" /> Download Manual (PDF)
                      </Button>
                    )}
                    {profile?.hasPaidSetupFee && (
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-rwanda-green/5 border border-rwanda-green/20 text-rwanda-green text-sm font-bold">
                        <CheckCircle2 className="w-5 h-5" /> Technician Appointment Confirmed
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-[2rem] bg-card border-primary/20 shadow-2xl shadow-primary/5">
                  <CardHeader className="p-10 pb-6 border-b border-border">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Smartphone className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-bold">Node Registration</CardTitle>
                    <CardDescription>Link your physical nodes to the Command Center.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="nodeId" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Device Serial ID</Label>
                        <Input 
                          id="nodeId" 
                          placeholder="SR-XXXX-XXXX" 
                          value={deviceIdInput} 
                          onChange={(e) => setDeviceIdInput(e.target.value)}
                          className="h-12 rounded-xl"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="alertPhone" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Alert Phone</Label>
                          <Input 
                            id="alertPhone" 
                            placeholder="+250..." 
                            value={alertPhone} 
                            onChange={(e) => setAlertPhone(e.target.value)}
                            className="h-12 rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="alertEmail" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Alert Email</Label>
                          <Input 
                            id="alertEmail" 
                            type="email"
                            placeholder="alert@safe.io" 
                            value={alertEmail} 
                            onChange={(e) => setAlertEmail(e.target.value)}
                            className="h-12 rounded-xl"
                          />
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => updateProfileData({ deviceId: deviceIdInput, alertPhone, alertEmail })}
                      className="w-full h-14 rounded-xl font-bold text-lg bg-primary shadow-xl shadow-primary/20"
                      disabled={updating || !deviceIdInput || !alertPhone || !alertEmail}
                    >
                      {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Link & Authenticate Node"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 5: ACTIVATION */}
            <TabsContent value="activation" className="animate-reveal">
              <Card className="max-w-3xl mx-auto rounded-[2rem] border-rwanda-green/20 overflow-hidden">
                <CardHeader className="p-10 text-center bg-rwanda-green/5 border-b border-rwanda-green/10">
                  <Badge className="bg-rwanda-green text-white mb-4">Activation Shield</Badge>
                  <CardTitle className="text-4xl font-bold">Strategic Activation</CardTitle>
                  <CardDescription className="text-lg mt-2">Subscribe to maintain 24/7 mesh monitoring protocols.</CardDescription>
                </CardHeader>
                <CardContent className="p-10">
                  <RadioGroup value={subType} onValueChange={setSubType} className="space-y-4">
                    {[
                      { id: 'weekly', label: 'Tactical Weekly', price: 'RWF 5,000' },
                      { id: 'monthly', label: 'Standard Monthly', price: 'RWF 18,000' },
                      { id: 'yearly', label: 'Strategic Annual', price: 'RWF 180,000' }
                    ].map((plan) => (
                      <div 
                        key={plan.id}
                        onClick={() => setSubType(plan.id)}
                        className={cn(
                          "p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between",
                          subType === plan.id ? 'border-primary bg-primary/5' : 'border-border bg-card'
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <RadioGroupItem value={plan.id} id={plan.id} />
                          <Label htmlFor={plan.id} className="font-bold text-xl cursor-pointer">{plan.label}</Label>
                        </div>
                        <span className="font-bold text-xl text-primary">{plan.price}</span>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
                <CardFooter className="p-10 pt-0 flex flex-col gap-6 text-center">
                  <Button 
                    onClick={() => updateProfileData({ subscriptionActive: true, subscriptionType: subType })}
                    className="w-full h-16 rounded-xl bg-primary text-xl font-bold shadow-2xl shadow-primary/20"
                    disabled={updating || !profile?.deviceId}
                  >
                    {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authorize & Activate System"}
                  </Button>
                  {!profile?.deviceId && <p className="text-destructive text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"><AlertTriangle className="w-4 h-4" /> Link a hardware node before activating</p>}
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Secure Payment Processing • AES-256 Encrypted</p>
                </CardFooter>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      </main>
    </div>
  );
}
