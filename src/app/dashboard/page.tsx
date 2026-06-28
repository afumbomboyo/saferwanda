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
  Wifi,
  PlusCircle,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Phase state: 'staging' | 'procurement' | 'integration' | 'activation' | 'command'
  const [currentPhase, setCurrentPhase] = useState<string>('staging');

  // Form states
  const [tempSelectedServices, setTempSelectedServices] = useState<string[]>([]);
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
          setTempSelectedServices(data.servicesSelected || []);
          setAlertEmail(data.alertEmail || user.email || '');
          setAlertPhone(data.alertPhone || '');
          setDeviceIdInput(data.deviceId || '');

          // Determine Phase
          if (data.subscriptionActive && data.deviceId) {
            setCurrentPhase('command');
          } else if (data.deviceId) {
            setCurrentPhase('activation');
          } else if (data.purchaseStatus !== 'none') {
            setCurrentPhase('integration');
          } else if (data.servicesSelected?.length > 0) {
            setCurrentPhase('procurement');
          } else {
            setCurrentPhase('staging');
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
      
      // Auto-advance phase based on what was updated
      if (newData.purchaseStatus) setCurrentPhase('integration');
      if (newData.deviceId) setCurrentPhase('activation');
      if (newData.subscriptionActive) setCurrentPhase('command');
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

  // PHASE 1: Deployment Staging (The "Cart")
  if (currentPhase === 'staging' || (profile.purchaseStatus === 'none' && !profile.deviceId)) {
    return (
      <div className="min-h-screen pt-32 pb-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 animate-fade-in">
            <div className="text-left">
              <Badge variant="outline" className="mb-4 border-primary text-primary font-bold px-3 py-1 uppercase tracking-widest text-[10px]">Phase 01: Deployment Staging</Badge>
              <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight">Staging Area</h1>
              <p className="text-muted-foreground text-lg mt-2">Review your selected security domains and initialize hardware procurement.</p>
            </div>
            <Button variant="destructive" className="h-12 px-6 rounded-xl font-bold flex items-center gap-2" onClick={handleLogout}>
              <LogOut className="w-5 h-5" /> Log Out
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {profile.servicesSelected?.length > 0 ? (
              profile.servicesSelected.map((serviceId: string) => (
                <div 
                  key={serviceId}
                  className="p-6 rounded-2xl border bg-card border-border shadow-sm flex items-center justify-between group hover:border-primary/50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <span className="font-bold capitalize text-lg block">{serviceId.replace('-', ' ')}</span>
                      <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Protocol Staged</span>
                    </div>
                  </div>
                  <CheckCircle2 className="text-primary w-5 h-5" />
                </div>
              ))
            ) : (
              <div className="md:col-span-2 p-12 text-center border-2 border-dashed border-border rounded-[2rem]">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground font-medium">No services staged. Please explore our catalog.</p>
                <Button variant="link" onClick={() => router.push('/services')} className="mt-2 text-primary font-bold">Browse Services</Button>
              </div>
            )}
          </div>

          {profile.servicesSelected?.length > 0 && (
            <Card className="glass-card border-primary/30 overflow-hidden animate-reveal">
              <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h4 className="text-xl font-bold mb-1">Initialize Deployment</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">Procure the necessary IoT hardware nodes to activate these staged protocols.</p>
                </div>
                <Button 
                  onClick={() => setCurrentPhase('procurement')}
                  className="h-14 px-10 rounded-xl bg-primary hover:bg-primary/90 font-bold shadow-xl shadow-primary/20 transition-all active:scale-95"
                >
                  Secure Hardware <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // PHASE 2: Hardware Procurement
  if (currentPhase === 'procurement' || (profile.purchaseStatus === 'none')) {
    return (
      <div className="min-h-screen pt-32 pb-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12 animate-fade-in">
            <Badge variant="outline" className="mb-4 border-accent text-accent font-bold px-3 py-1">PHASE 02: PROCUREMENT</Badge>
            <h1 className="text-4xl md:text-5xl font-headline font-extrabold mb-4">Acquire Security Nodes</h1>
            <p className="text-muted-foreground text-lg">Select your hardware procurement model to proceed with physical installation.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="glass-card group hover:border-primary transition-all overflow-hidden flex flex-col">
              <div className="p-8 flex-grow">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Package className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Ownership Model</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Purchase the security hardware outright. This includes full ownership of the nodes and a mandatory professional setup by SafeRwanda technicians to ensure 100% mesh coverage.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-xs font-bold text-foreground/80"><CheckCircle2 className="w-4 h-4 text-primary" /> Professional Installation</li>
                  <li className="flex items-center gap-3 text-xs font-bold text-foreground/80"><CheckCircle2 className="w-4 h-4 text-primary" /> Lifetime Hardware Warranty</li>
                  <li className="flex items-center gap-3 text-xs font-bold text-foreground/80"><CheckCircle2 className="w-4 h-4 text-primary" /> Priority Mesh Relinking</li>
                </ul>
              </div>
              <CardFooter className="bg-primary/5 p-6 border-t border-primary/10">
                <Button 
                  onClick={() => updateProfileData({ purchaseStatus: 'purchased', hasPaidSetupFee: true })}
                  className="w-full h-12 rounded-xl bg-primary font-bold"
                  disabled={updating}
                >
                  Buy Hardware
                </Button>
              </CardFooter>
            </Card>

            <Card className="glass-card group hover:border-accent transition-all overflow-hidden flex flex-col">
              <div className="p-8 flex-grow">
                <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                  <CreditCard className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Leasing Model</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Subscribe to the hardware on a monthly basis. This model is designed for self-installation. We provide a digital manual for you to set up and link the nodes yourself.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-xs font-bold text-foreground/80"><CheckCircle2 className="w-4 h-4 text-accent" /> Lower Initial Capital</li>
                  <li className="flex items-center gap-3 text-xs font-bold text-foreground/80"><CheckCircle2 className="w-4 h-4 text-accent" /> Flexible Self-Setup</li>
                  <li className="flex items-center gap-3 text-xs font-bold text-foreground/80"><CheckCircle2 className="w-4 h-4 text-accent" /> Monthly Node Support</li>
                </ul>
              </div>
              <CardFooter className="bg-accent/5 p-6 border-t border-accent/10">
                <Button 
                  variant="outline"
                  onClick={() => updateProfileData({ purchaseStatus: 'leased', hasPaidSetupFee: false })}
                  className="w-full h-12 rounded-xl border-accent/30 font-bold"
                  disabled={updating}
                >
                  Lease Hardware
                </Button>
              </CardFooter>
            </Card>
          </div>
          <Button variant="ghost" onClick={() => setCurrentPhase('staging')} className="text-muted-foreground flex items-center mx-auto"><ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Back to Staging</Button>
        </div>
      </div>
    );
  }

  // PHASE 3: Node Integration (Setup & Device ID)
  if (currentPhase === 'integration' || (profile.purchaseStatus !== 'none' && !profile.deviceId)) {
    return (
      <div className="min-h-screen pt-32 pb-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-4 border-rwanda-green text-rwanda-green font-bold px-3 py-1">PHASE 03: INTEGRATION</Badge>
            <h1 className="text-4xl md:text-5xl font-headline font-extrabold mb-4">Node Integration</h1>
            <p className="text-muted-foreground text-lg">Your hardware is ready. Follow the protocols below to link your nodes to the mesh.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <Card className="glass-card flex flex-col border-border animate-reveal">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-xl bg-rwanda-green/10 flex items-center justify-center mb-4">
                  <Wrench className="text-rwanda-green w-6 h-6" />
                </div>
                <CardTitle className="text-2xl">Setup Protocol</CardTitle>
                <CardDescription>Installation manual for {profile.purchaseStatus} hardware.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {profile.hasPaidSetupFee 
                    ? "A professional SafeRwanda technician has been dispatched. They will handle the node placement and initial handshake. Use the reference manual below for your records."
                    : "You have opted for self-setup. Download the comprehensive guide to ensure optimal signal strength and perimeter integrity."}
                </p>
                <Button variant="secondary" className="w-full gap-2 rounded-xl h-12 font-bold bg-secondary hover:bg-secondary/80 border border-border">
                  <Download className="w-4 h-4" />
                  Download Manual (PDF)
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/20 animate-reveal reveal-delay-1 shadow-2xl shadow-primary/5">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Smartphone className="text-primary w-6 h-6" />
                </div>
                <CardTitle className="text-2xl">Register Device</CardTitle>
                <CardDescription>Establish the cloud-to-node link.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deviceId" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Unique Device ID</Label>
                  <Input 
                    id="deviceId" 
                    placeholder="SR-XXXX-XXXX" 
                    value={deviceIdInput}
                    onChange={(e) => setDeviceIdInput(e.target.value)}
                    className="rounded-xl h-12 bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Emergency Alert SMS</Label>
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
                  <Label htmlFor="alertEmail" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Emergency Alert Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="alertEmail" 
                      type="email"
                      placeholder="agent@safety.rw" 
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
                  {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Link Node"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // PHASE 4: Activation (Subscription)
  if (currentPhase === 'activation' || (profile.deviceId && !profile.subscriptionActive)) {
    return (
      <div className="min-h-screen pt-32 pb-24 bg-background">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-4 border-rwanda-green text-rwanda-green font-bold px-3 py-1">PHASE 04: ACTIVATION</Badge>
            <h1 className="text-4xl md:text-5xl font-headline font-extrabold mb-4">Activate Security Mesh</h1>
            <p className="text-muted-foreground">Node <span className="text-primary font-mono font-bold">{profile.deviceId}</span> has successfully performed the handshake. Finalize your subscription to activate monitoring.</p>
          </div>

          <Card className="glass-card overflow-hidden border-rwanda-green/20 animate-reveal">
            <CardHeader className="bg-primary/5 border-b border-primary/10 p-8">
              <CardTitle className="text-2xl">Select Shield Duration</CardTitle>
              <CardDescription>Maintain your node's connection to the global monitoring mesh.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <RadioGroup value={subType} onValueChange={setSubType} className="space-y-4">
                {[
                  { id: 'weekly', label: 'Tactical Weekly', price: 'RWF 5,000' },
                  { id: 'monthly', label: 'Standard Monthly', price: 'RWF 18,000', popular: true },
                  { id: 'yearly', label: 'Strategic Annual', price: 'RWF 180,000' }
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
                      <Label htmlFor={plan.id} className="font-bold text-xl cursor-pointer block">{plan.label}</Label>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl text-primary">{plan.price}</p>
                      {plan.popular && <Badge className="bg-accent text-accent-foreground text-[10px] uppercase font-bold mt-1">Best Value</Badge>}
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
                {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authorize & Activate Mesh"}
              </Button>
              <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold">Secure Bank-Grade Payment Encryption Active</p>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // PHASE 5: Live Command Center
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 animate-fade-in">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="border-rwanda-green text-rwanda-green bg-rwanda-green/5 font-bold uppercase tracking-widest text-[10px]">
                  Mesh Link Active
                </Badge>
                <Badge variant="outline" className="border-primary text-primary bg-primary/5 font-mono text-[10px]">
                  Node ID: {profile.deviceId}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-headline font-extrabold tracking-tight">Agent {profile?.fullName?.split(' ')[0] || 'Operator'}</h1>
              <p className="text-muted-foreground mt-2">Continuous telemetry established for all registered hardware nodes.</p>
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 animate-reveal">
            <Card className="bg-primary/5 border-primary/20 rounded-3xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary">Live Nodes</CardTitle>
                <Cpu className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black">01</div>
              </CardContent>
            </Card>
            <Card className="bg-accent/5 border-accent/20 rounded-3xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-accent">Active Protocols</CardTitle>
                <Shield className="w-4 h-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black">{profile?.servicesSelected?.length || 0}</div>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-reveal reveal-delay-2">
            <Card className="lg:col-span-2 bg-card border-border rounded-[2rem] overflow-hidden">
              <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">Integrated Security Nodes</CardTitle>
                  <CardDescription>Live hardware status and protocol mappings.</CardDescription>
                </div>
                <Button variant="outline" className="rounded-xl font-bold gap-2" onClick={() => setCurrentPhase('staging')}>
                  <PlusCircle className="w-4 h-4" /> Add Node
                </Button>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-4">
                {profile.deviceId ? (
                  <div className="p-6 rounded-2xl bg-secondary/30 border border-border group hover:border-primary/50 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-6">
                      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
                        <Smartphone className="w-8 h-8 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase font-black tracking-widest mb-1">Gateway Node</span>
                        <span className="font-bold text-2xl font-mono">{profile.deviceId}</span>
                        <div className="flex gap-2 mt-2">
                          {profile.servicesSelected?.map((s: string) => (
                            <Badge key={s} variant="secondary" className="capitalize text-[8px] px-2 py-0 border-none">{s.replace('-', ' ')}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-rwanda-green animate-pulse" />
                        <span className="text-xs font-bold text-rwanda-green uppercase tracking-widest">Live Telemetry</span>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-none text-[10px] px-3 py-1 font-bold">PROVISIONED: {profile.purchaseStatus?.toUpperCase()}</Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-secondary/20 rounded-2xl border-2 border-dashed border-border">
                    <Smartphone className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="text-muted-foreground font-medium">No hardware nodes linked to this account.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border rounded-[2rem] overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-2xl font-bold">Alert Configuration</CardTitle>
                <CardDescription>Emergency contact protocols.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl border border-border bg-secondary/10 flex items-center justify-between">
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
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Primary Email</p>
                        <span className="text-base font-bold truncate max-w-[150px]">{profile.alertEmail}</span>
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-rwanda-green" />
                  </div>
                </div>
                
                <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                    <Activity className="w-3 h-3" />
                    Fail-Safe System
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                    In the event of a protocol breach, multi-channel distress signals are broadcast within 1.5 seconds.
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

