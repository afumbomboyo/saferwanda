
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
  Info,
  ListChecks,
  Package,
  Wrench,
  Wifi
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Local state for the confirmation phase
  const [tempSelectedServices, setTempSelectedServices] = useState<string[]>([]);
  const [confirmedSelection, setConfirmedSelection] = useState(false);

  // Form states for setup
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
          if (!data.isOnboarded) {
            router.replace('/onboarding');
          } else {
            setProfile(data);
            setTempSelectedServices(data.servicesSelected || []);
            setAlertEmail(data.alertEmail || user.email || '');
            setAlertPhone(data.alertPhone || '');
            setDeviceIdInput(data.deviceId || '');
          }
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
      setProfile({ ...profile, ...newData });
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

  // Phase 1: Service Confirmation (Review selections from onboarding)
  if (!confirmedSelection && profile.purchaseStatus === 'none') {
    return (
      <div className="min-h-screen pt-32 pb-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-headline font-extrabold mb-4 tracking-tight">Review Protection Domains</h1>
            <p className="text-muted-foreground text-lg">Select the services you wish to actually initialize for hardware deployment today.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {profile.servicesSelected?.map((serviceId: string) => (
              <div 
                key={serviceId}
                onClick={() => {
                  setTempSelectedServices(prev => 
                    prev.includes(serviceId) ? prev.filter(s => s !== serviceId) : [...prev, serviceId]
                  );
                }}
                className={cn(
                  "p-6 rounded-2xl border transition-all cursor-pointer select-none flex items-center justify-between",
                  tempSelectedServices.includes(serviceId) 
                    ? "bg-primary/5 border-primary shadow-md" 
                    : "bg-card border-border opacity-60 grayscale"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-6 h-6 rounded-md border flex items-center justify-center",
                    tempSelectedServices.includes(serviceId) ? "bg-primary border-primary text-white" : "border-muted-foreground"
                  )}>
                    {tempSelectedServices.includes(serviceId) && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <span className="font-bold capitalize text-lg">{serviceId.replace('-', ' ')}</span>
                </div>
              </div>
            ))}
          </div>

          <Card className="glass-card border-accent/30 overflow-hidden">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-sm font-black uppercase tracking-widest">{tempSelectedServices.length} Nodes Ready for Initialization</p>
                <p className="text-xs text-muted-foreground italic">Confirming will unlock hardware procurement protocols.</p>
              </div>
              <Button 
                onClick={() => {
                  updateProfileData({ servicesSelected: tempSelectedServices });
                  setConfirmedSelection(true);
                }}
                disabled={tempSelectedServices.length === 0 || updating}
                className="h-14 px-10 rounded-xl bg-primary hover:bg-primary/90 font-bold shadow-xl shadow-primary/20 transition-all active:scale-95"
              >
                Proceed to Hardware Procurement <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Phase 2: Hardware Procurement (Instructions, Buying/Leasing)
  if (profile.purchaseStatus === 'none') {
    return (
      <div className="min-h-screen pt-32 pb-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10 animate-fade-in">
            <Badge variant="outline" className="mb-4 border-primary text-primary font-bold px-3 py-1">PHASE: PROCUREMENT</Badge>
            <h1 className="text-3xl md:text-5xl font-headline font-extrabold mb-4">Initialize Your Protocol</h1>
            <p className="text-muted-foreground">To begin monitoring, you must first secure your hardware nodes.</p>
          </div>
          
          <Card className="glass-card border-primary/20 mb-8 overflow-hidden">
            <div className="bg-primary/10 p-4 flex items-center gap-3 border-b border-primary/10">
              <Package className="text-primary w-5 h-5" />
              <p className="text-sm font-bold text-primary uppercase tracking-widest">Protocol Instructions</p>
            </div>
            <CardContent className="pt-8 space-y-8">
              <div className="flex gap-6">
                <div className="h-12 w-12 shrink-0 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-xl shadow-lg">1</div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Secure Your Hardware</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">Choose whether to buy or lease your security device on our platform. Buying includes a professional setup fee, while leasing allows for self-installation.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="h-12 w-12 shrink-0 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-xl shadow-lg">2</div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Setup & Integration</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">Once you receive your hardware, a technical manual will be unlocked in this dashboard to guide you through the physical placement.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="h-12 w-12 shrink-0 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-xl shadow-lg">3</div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Establish Mesh Link</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">Input your unique Device ID to connect your gadget to the SafeRwanda cloud for live telemetry and distress alerts.</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-secondary/30 p-8 flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => updateProfileData({ purchaseStatus: 'purchased', hasPaidSetupFee: true })}
                className="flex-1 h-16 rounded-xl bg-primary font-bold shadow-xl shadow-primary/20 text-lg"
                disabled={updating}
              >
                Buy Hardware (Professional Setup)
              </Button>
              <Button 
                variant="outline"
                onClick={() => updateProfileData({ purchaseStatus: 'leased', hasPaidSetupFee: false })}
                className="flex-1 h-16 rounded-xl font-bold text-lg border-primary/30"
                disabled={updating}
              >
                Lease Hardware (Self Setup)
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // Phase 3: Setup (Manual & Device ID Input)
  if (!profile.deviceId) {
    return (
      <div className="min-h-screen pt-32 pb-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-4 border-accent text-accent font-bold px-3 py-1">PHASE: INTEGRATION</Badge>
            <h1 className="text-3xl md:text-5xl font-headline font-extrabold mb-4">Hardware Integration</h1>
            <p className="text-muted-foreground">Follow the instructions below to link your physical nodes to the SafeRwanda network.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="glass-card flex flex-col border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Wrench className="text-accent w-6 h-6" />
                  Setup Manual
                </CardTitle>
                <CardDescription>Installation protocols for {profile.purchaseStatus} hardware.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {profile.hasPaidSetupFee 
                    ? "A professional SafeRwanda technician has been dispatched to your location. The manual below is for your reference only."
                    : "You have opted for self-installation. Please download the comprehensive setup guide to ensure your nodes are positioned optimally."}
                </p>
                <Button variant="secondary" className="w-full gap-2 rounded-xl h-12 font-bold bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20">
                  <Download className="w-4 h-4" />
                  Download Manual (PDF)
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Smartphone className="text-primary w-6 h-6" />
                  Link Device
                </CardTitle>
                <CardDescription>Synchronize your gadget with your dashboard.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deviceId" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Unique Device ID</Label>
                  <Input 
                    id="deviceId" 
                    placeholder="SR-XXXX-XXXX" 
                    value={deviceIdInput}
                    onChange={(e) => setDeviceIdInput(e.target.value)}
                    className="rounded-xl h-12 bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Distress Alert Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="phone" 
                      placeholder="+250..." 
                      className="pl-10 rounded-xl h-12 bg-background border-border"
                      value={alertPhone}
                      onChange={(e) => setAlertPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alertEmail" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Distress Alert Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="alertEmail" 
                      type="email"
                      placeholder="alerts@example.com" 
                      className="pl-10 rounded-xl h-12 bg-background border-border"
                      value={alertEmail}
                      onChange={(e) => setAlertEmail(e.target.value)}
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => updateProfileData({ 
                    deviceId: deviceIdInput,
                    alertPhone,
                    alertEmail
                  })}
                  className="w-full h-14 rounded-xl font-bold bg-primary shadow-xl shadow-primary/20 text-lg"
                  disabled={updating || !deviceIdInput || !alertPhone || !alertEmail}
                >
                  {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Establish Node Link"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Phase 4: Subscription
  if (!profile.subscriptionActive) {
    return (
      <div className="min-h-screen pt-32 pb-24 bg-background">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-4 border-rwanda-green text-rwanda-green font-bold px-3 py-1">PHASE: ACTIVATION</Badge>
            <h1 className="text-3xl md:text-5xl font-headline font-extrabold mb-4">Activate Security Mesh</h1>
            <p className="text-muted-foreground">Node <span className="text-primary font-mono">{profile.deviceId}</span> linked. Pay subscription to remain active.</p>
          </div>

          <Card className="glass-card overflow-hidden border-rwanda-green/20">
            <CardHeader className="bg-primary/5 border-b border-primary/10 p-8">
              <CardTitle className="text-2xl">Select Protection Frequency</CardTitle>
              <CardDescription>Maintain your node's connection to the global monitoring mesh.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <RadioGroup value={subType} onValueChange={setSubType} className="space-y-4">
                {[
                  { id: 'weekly', label: 'Weekly Access', price: 'RWF 5,000' },
                  { id: 'monthly', label: 'Monthly Guardian', price: 'RWF 18,000', popular: true },
                  { id: 'yearly', label: 'Annual Shield', price: 'RWF 180,000' }
                ].map((plan) => (
                  <div 
                    key={plan.id}
                    onClick={() => setSubType(plan.id)}
                    className={cn(
                      "relative p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between",
                      subType === plan.id ? 'border-primary bg-primary/5 shadow-md' : 'border-border bg-card'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <RadioGroupItem value={plan.id} id={plan.id} />
                      <div>
                        <Label htmlFor={plan.id} className="font-bold text-xl cursor-pointer block">{plan.label}</Label>
                        {plan.popular && <Badge className="bg-accent text-accent-foreground text-[10px] uppercase font-bold mt-1">Best Value</Badge>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl text-primary">{plan.price}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
            <CardFooter className="p-8 bg-secondary/20 flex flex-col gap-4">
              <Button 
                onClick={() => updateProfileData({ subscriptionActive: true, subscriptionType: subType })}
                className="w-full h-16 rounded-xl bg-primary text-xl font-bold shadow-2xl shadow-primary/20"
                disabled={updating}
              >
                {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authorize Payment & Activate"}
              </Button>
              <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold">Secure Bank-Grade Payment Encryption Active</p>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // Phase 5: Live Command Center
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 animate-fade-in">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="border-rwanda-green text-rwanda-green bg-rwanda-green/5 font-bold uppercase tracking-widest text-[10px]">
                  Protocol Active
                </Badge>
                <Badge variant="outline" className="border-primary text-primary bg-primary/5 font-mono text-[10px]">
                  Node: {profile.deviceId}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-headline font-extrabold tracking-tight">Agent {profile?.fullName?.split(' ')[0] || 'Operator'}</h1>
              <p className="text-muted-foreground mt-2">Active mesh link established. Continuous monitoring in progress.</p>
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 animate-fade-in">
            <Card className="bg-primary/5 border-primary/20 rounded-3xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary">Active Protocols</CardTitle>
                <Shield className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black">{profile?.servicesSelected?.length || 0}</div>
              </CardContent>
            </Card>
            <Card className="bg-accent/5 border-accent/20 rounded-3xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-accent">Node Status</CardTitle>
                <Activity className="w-4 h-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black">Live</div>
              </CardContent>
            </Card>
            <Card className="bg-rwanda-green/5 border-rwanda-green/20 rounded-3xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-rwanda-green">Signal Strength</CardTitle>
                <Wifi className="w-4 h-4 text-rwanda-green" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black">98%</div>
              </CardContent>
            </Card>
            <Card className="bg-secondary/20 border-border rounded-3xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Alerts Today</CardTitle>
                <Bell className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black">0</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            <Card className="lg:col-span-2 bg-card border-border rounded-[2rem] overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-2xl font-bold flex items-center justify-between">
                  Deployed Protection Nodes
                  <Button variant="ghost" size="sm" className="text-xs text-primary font-bold uppercase tracking-widest" onClick={() => setConfirmedSelection(false)}>
                    Initialize New Domain
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="space-y-4">
                  {profile?.servicesSelected?.map((service: string, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-6 rounded-2xl bg-secondary/30 border border-border group hover:border-primary/50 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
                          <Shield className="w-7 h-7 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-xl capitalize">{service.replace('-', ' ')}</span>
                          <span className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] mt-1">Link: {profile.deviceId}</span>
                        </div>
                      </div>
                      <Badge className="bg-rwanda-green text-white px-4 py-1.5 rounded-full font-bold">STREAMING LIVE</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border rounded-[2rem] overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-2xl font-bold">Alert Configuration</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl border border-border bg-secondary/10 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <Phone className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Primary SMS</p>
                        <span className="text-base font-bold">{profile.alertPhone}</span>
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-rwanda-green" />
                  </div>
                  <div className="p-5 rounded-2xl border border-border bg-secondary/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Mail className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Emergency Email</p>
                        <span className="text-base font-bold">{profile.alertEmail}</span>
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-rwanda-green" />
                  </div>
                </div>
                
                <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                    <Activity className="w-3 h-3" />
                    Fail-Safe Protocol
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                    In the event of a breach or distress signal, automated multi-channel alerts are dispatched within 1.5 seconds.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
