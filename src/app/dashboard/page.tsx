
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
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Form states for onboarding
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Initializing Command Center...</p>
      </div>
    );
  }

  // --- Dashboard States ---

  // 1. Hardware Procurement (Instructions & Buying/Leasing)
  if (!profile.purchaseStatus || profile.purchaseStatus === 'none') {
    return (
      <div className="min-h-screen pt-32 pb-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-headline font-extrabold mb-4">Initialize Your Protocol</h1>
            <p className="text-muted-foreground">To begin monitoring, you must first secure your hardware nodes.</p>
          </div>
          
          <Card className="glass-card border-primary/20 mb-8 overflow-hidden">
            <div className="bg-primary/10 p-4 flex items-center gap-3 border-b border-primary/10">
              <Info className="text-primary w-5 h-5" />
              <p className="text-sm font-bold text-primary uppercase tracking-widest">Protocol Instructions</p>
            </div>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-primary text-white flex items-center justify-center font-bold">1</div>
                  <div>
                    <h4 className="font-bold text-lg">Secure Your Hardware</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">Choose whether to buy or lease your security device. Once processed, your personalized setup manual will be unlocked in this dashboard.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-primary text-white flex items-center justify-center font-bold">2</div>
                  <div>
                    <h4 className="font-bold text-lg">Device Linking</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">After receiving and setting up your hardware, you will input your unique Device ID to establish a secure mesh connection.</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-secondary/30 p-8 flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => updateProfileData({ purchaseStatus: 'purchased', hasPaidSetupFee: true })}
                className="flex-1 h-14 rounded-xl bg-primary font-bold shadow-lg"
                disabled={updating}
              >
                Buy Hardware (Professional Setup)
              </Button>
              <Button 
                variant="outline"
                onClick={() => updateProfileData({ purchaseStatus: 'leased', hasPaidSetupFee: false })}
                className="flex-1 h-14 rounded-xl font-bold"
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

  // 2. Setup Phase (Manual & Device ID Input)
  if (!profile.deviceId) {
    return (
      <div className="min-h-screen pt-32 pb-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-headline font-extrabold mb-4">Device Integration</h1>
            <p className="text-muted-foreground">Hardware nodes secured. Follow the steps below to link your node.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="glass-card flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="text-primary" />
                  Setup Manual
                </CardTitle>
                <CardDescription>Instructions for {profile.purchaseStatus} hardware.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {profile.hasPaidSetupFee 
                    ? "Our technician is scheduled for your installation. You can view the manual for familiarization."
                    : "You have opted for manual installation. Please download the comprehensive PDF guide to proceed."}
                </p>
                <Button variant="secondary" className="w-full gap-2 rounded-xl">
                  <Download className="w-4 h-4" />
                  Download Manual (PDF)
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="text-primary" />
                  Link Device
                </CardTitle>
                <CardDescription>Establish a secure link to your hardware.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deviceId">Unique Device ID</Label>
                  <Input 
                    id="deviceId" 
                    placeholder="SR-XXXX-XXXX" 
                    value={deviceIdInput}
                    onChange={(e) => setDeviceIdInput(e.target.value)}
                    className="rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Alert Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="phone" 
                      placeholder="+250..." 
                      className="pl-10 rounded-xl h-12"
                      value={alertPhone}
                      onChange={(e) => setAlertPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alertEmail">Alert Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="alertEmail" 
                      type="email"
                      placeholder="alerts@example.com" 
                      className="pl-10 rounded-xl h-12"
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
                  className="w-full h-12 rounded-xl font-bold bg-primary"
                  disabled={updating || !deviceIdInput || !alertPhone || !alertEmail}
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Establish Node Link"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // 3. Subscription Phase
  if (!profile.subscriptionActive) {
    return (
      <div className="min-h-screen pt-32 pb-24 bg-background">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-headline font-extrabold mb-4">Activate Protocol</h1>
            <p className="text-muted-foreground">Node linked: <span className="text-primary font-mono">{profile.deviceId}</span>. Activate subscription to remain active.</p>
          </div>

          <Card className="glass-card overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10 p-8">
              <CardTitle>Select Your Security Tier</CardTitle>
              <CardDescription>Choose the billing frequency for your protection mesh.</CardDescription>
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
                    className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      subType === plan.id ? 'border-primary bg-primary/5 shadow-md' : 'border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={plan.id} id={plan.id} />
                      <Label htmlFor={plan.id} className="font-bold text-lg cursor-pointer">{plan.label}</Label>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{plan.price}</p>
                      {plan.popular && <Badge className="bg-accent text-accent-foreground text-[10px] uppercase font-bold">Best Value</Badge>}
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
            <CardFooter className="p-8 bg-secondary/20 flex flex-col gap-4">
              <Button 
                onClick={() => updateProfileData({ subscriptionActive: true, subscriptionType: subType })}
                className="w-full h-14 rounded-xl bg-primary text-lg font-bold shadow-xl shadow-primary/20"
                disabled={updating}
              >
                {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Activate Security Mesh"}
              </Button>
              <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold">Secure payment processing initialized</p>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // 4. Live Command Center
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
              <Button variant="outline" size="icon" className="rounded-xl border-border"><Bell className="w-5 h-5" /></Button>
              <Button variant="outline" size="icon" className="rounded-xl border-border"><Settings className="w-5 h-5" /></Button>
              <Button variant="destructive" size="icon" className="rounded-xl" onClick={handleLogout} title="Log Out">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 animate-fade-in">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary">Active Protocols</CardTitle>
                <Shield className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black">{profile?.servicesSelected?.length || 0}</div>
              </CardContent>
            </Card>
            <Card className="bg-accent/5 border-accent/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-accent">Node Status</CardTitle>
                <Activity className="w-4 h-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black">Live</div>
              </CardContent>
            </Card>
            <Card className="bg-rwanda-green/5 border-rwanda-green/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-rwanda-green">Signal Strength</CardTitle>
                <Smartphone className="w-4 h-4 text-rwanda-green" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black">98%</div>
              </CardContent>
            </Card>
            <Card className="bg-secondary/20 border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Alerts Today</CardTitle>
                <Bell className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black">0</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center justify-between">
                  Deployed Nodes
                  <Button variant="ghost" size="sm" className="text-xs text-primary font-bold uppercase tracking-widest">
                    Add New Node
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile?.servicesSelected?.map((service: string, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold capitalize">{service.replace('-', ' ')}</span>
                          <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Linked to {profile.deviceId}</span>
                        </div>
                      </div>
                      <Badge className="bg-rwanda-green text-white">Streaming</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Emergency Contact Config</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-border bg-secondary/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{profile.alertPhone}</span>
                    </div>
                    <Badge variant="outline">SMS Active</Badge>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-secondary/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{profile.alertEmail}</span>
                    </div>
                    <Badge variant="outline">Email Active</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic text-center mt-4">
                    In case of distress, automated alerts will be dispatched to these channels within 1.5 seconds.
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
