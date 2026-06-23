
"use client"

import { useEffect, useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { Shield, Loader2, LayoutDashboard, Settings, LogOut, Bell, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.replace('/auth');
      return;
    }

    const fetchProfile = async () => {
      const docRef = doc(db, 'users', user.uid);
      const res = await getDoc(docRef);
      if (res.exists()) {
        const data = res.data();
        if (!data.isOnboarded) {
          router.replace('/onboarding');
        } else {
          setProfile(data);
        }
      } else {
        router.replace('/onboarding');
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user, userLoading, db, router]);

  if (loading || userLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Initializing Command Center...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 animate-fade-in">
            <div>
              <h1 className="text-3xl md:text-5xl font-headline font-extrabold tracking-tight">Welcome, {profile?.fullName || 'Agent'}</h1>
              <p className="text-muted-foreground mt-2">Strategic security node active. Monitoring all protocols.</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" size="icon" className="rounded-xl border-border"><Bell className="w-5 h-5" /></Button>
              <Button variant="outline" size="icon" className="rounded-xl border-border"><Settings className="w-5 h-5" /></Button>
              <Button variant="destructive" size="icon" className="rounded-xl" onClick={() => router.push('/auth')}><LogOut className="w-5 h-5" /></Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Active Protocols</CardTitle>
                <Shield className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black">{profile?.servicesSelected?.length || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Strategic services deployed</p>
              </CardContent>
            </Card>
            <Card className="bg-accent/5 border-accent/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-accent">Node Status</CardTitle>
                <Activity className="w-4 h-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black">Stable</div>
                <p className="text-xs text-muted-foreground mt-1">99.9% Uptime across mesh network</p>
              </CardContent>
            </Card>
            <Card className="bg-rwanda-green/5 border-rwanda-green/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-rwanda-green">Auth Level</CardTitle>
                <LayoutDashboard className="w-4 h-4 text-rwanda-green" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black">Admin</div>
                <p className="text-xs text-muted-foreground mt-1">Full override permissions enabled</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Your Deployed Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile?.servicesSelected?.map((service: string, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-bold capitalize">{service.replace('-', ' ')}</span>
                      </div>
                      <Badge className="bg-primary text-white">Active</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Protocol Insights</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center min-h-[300px] text-center p-8">
                <div>
                  <Shield className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-muted-foreground text-sm font-light">No active alerts. Your perimeter is secure. AI Concierge is monitoring for suspicious patterns.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
