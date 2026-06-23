
"use client"

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Check, ArrowRight, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const ALL_SERVICES = [
  { id: "child-protection", title: "Child Protection", note: "Real-time school tracking, geofencing & SOS buttons." },
  { id: "elderly-care", title: "Elderly Care", note: "Fall detection, vitals monitoring & instant family alerts." },
  { id: "fire-prevention", title: "Fire Prevention", note: "Smart heat, gas & thermal leak detection protocols." },
  { id: "property-security", title: "Property Security", note: "Smart locks, perimeter breach & residential audit logs." },
  { id: "asset-protection", title: "Asset Protection", note: "High-precision GPS nodes for equipment & vehicles." },
  { id: "neighborhood-surveillance", title: "Neighborhood Surveillance", note: "Community mesh network & AI pattern detection." }
];

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialServiceId = searchParams.get('id');
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Priority: URL Param > localStorage
    const savedInitial = initialServiceId || localStorage.getItem('temp_initial_service');
    if (savedInitial && !selectedIds.includes(savedInitial)) {
      setSelectedIds(prev => [...new Set([...prev, savedInitial])]);
    }
  }, [initialServiceId]);

  const toggleService = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    if (selectedIds.length === 0) return;
    
    // Save to local storage in case we need it after auth
    localStorage.setItem('temp_selected_services', JSON.stringify(selectedIds));

    if (user && db) {
      // If user is already logged in (e.g. via Google), create their profile now
      setSubmitting(true);
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          uid: user.uid,
          fullName: user.displayName || 'Security Agent',
          email: user.email || '',
          servicesSelected: selectedIds,
          isOnboarded: true,
          createdAt: serverTimestamp(),
        });
        localStorage.removeItem('temp_selected_services');
        router.replace('/dashboard');
      } catch (error) {
        console.error("Error creating profile:", error);
      } finally {
        setSubmitting(false);
      }
    } else {
      // Not logged in yet, go to auth
      router.push('/auth?signup=true');
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-headline font-extrabold mb-4 tracking-tight">Personalize Your Security</h1>
            <p className="text-lg text-muted-foreground font-light max-w-2xl mx-auto">
              Select the SafeRwanda protocols you want active. Our IoT mesh network will prioritize these domains for your account.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {ALL_SERVICES.map((service) => (
              <div 
                key={service.id}
                onClick={() => toggleService(service.id)}
                className={`relative group p-6 rounded-2xl border transition-all cursor-pointer ${
                  selectedIds.includes(service.id) 
                    ? "bg-primary/5 border-primary shadow-lg shadow-primary/10" 
                    : "bg-card border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 h-6 w-6 rounded-md border flex items-center justify-center transition-colors ${
                    selectedIds.includes(service.id) 
                      ? "bg-primary border-primary text-white" 
                      : "border-muted-foreground/30 group-hover:border-primary/50"
                  }`}>
                    {selectedIds.includes(service.id) && <Check className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">{service.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{service.note}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Card className="bg-secondary/20 border-accent/20">
            <CardContent className="pt-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Info className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-bold">{selectedIds.length} Services Selected</p>
                  <p className="text-xs text-muted-foreground italic">
                    {user ? "Confirm these settings to initialize your node." : "Proceed to create your security profile."}
                  </p>
                </div>
              </div>
              <Button 
                disabled={selectedIds.length === 0 || submitting}
                onClick={handleContinue}
                className="w-full md:w-auto h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 font-bold shadow-xl shadow-primary/20 active:scale-95 transition-all"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  user ? "Initialize Dashboard" : "Proceed to Account Creation"
                )}
                {!submitting && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Shield className="animate-pulse text-primary w-12 h-12" /></div>}>
      <OnboardingContent />
    </Suspense>
  );
}
