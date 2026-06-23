
"use client"

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Check, ArrowRight, Info, Loader2, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

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
  const urlServiceId = searchParams.get('id');
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const savedInitial = urlServiceId || localStorage.getItem('temp_initial_service');
    const existingSelections = localStorage.getItem('temp_selected_services');
    
    let initialIds: string[] = [];
    if (existingSelections) {
      initialIds = JSON.parse(existingSelections);
    }
    if (savedInitial && !initialIds.includes(savedInitial)) {
      initialIds.push(savedInitial);
    }
    
    setSelectedIds(initialIds);
  }, [urlServiceId]);

  const toggleService = (id: string) => {
    setSelectedIds(prev => {
      const newSelection = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      localStorage.setItem('temp_selected_services', JSON.stringify(newSelection));
      return newSelection;
    });
  };

  const handleContinue = async () => {
    if (selectedIds.length === 0) return;
    
    setSubmitting(true);
    try {
      if (user && db) {
        // If user is already logged in, update their profile
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        const userData = {
          uid: user.uid,
          fullName: user.displayName || 'Security Agent',
          email: user.email || '',
          servicesSelected: selectedIds,
          isOnboarded: true,
          createdAt: userDoc.exists() ? userDoc.data()?.createdAt : serverTimestamp(),
        };

        await setDoc(userDocRef, userData, { merge: true });
        localStorage.removeItem('temp_selected_services');
        localStorage.removeItem('temp_initial_service');
        router.replace('/dashboard');
      } else {
        // Not logged in yet, save selection and go to auth
        localStorage.setItem('temp_selected_services', JSON.stringify(selectedIds));
        router.push('/auth?signup=true');
      }
    } catch (error) {
      console.error("Error finalizing onboarding:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4">
              <ListChecks className="w-3 h-3" />
              Service Customization
            </div>
            <h1 className="text-4xl md:text-5xl font-headline font-extrabold mb-4 tracking-tight">Personalize Your Security</h1>
            <p className="text-lg text-muted-foreground font-light max-w-2xl mx-auto">
              Review and select all SafeRwanda protocols you want active. Our IoT mesh network will prioritize these domains for your account.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {ALL_SERVICES.map((service) => (
              <div 
                key={service.id}
                onClick={() => toggleService(service.id)}
                className={`relative group p-6 rounded-2xl border transition-all cursor-pointer select-none ${
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
                    <h4 className={`font-bold text-lg mb-1 transition-colors ${selectedIds.includes(service.id) ? "text-primary" : "text-foreground"}`}>
                      {service.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{service.note}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Card className="bg-secondary/20 border-accent/20 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-accent/30" />
            <CardContent className="pt-6 pb-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Shield className={`w-6 h-6 text-accent transition-transform duration-500 ${selectedIds.length > 0 ? "scale-110 rotate-12" : ""}`} />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-widest">{selectedIds.length} Protocols Selected</p>
                  <p className="text-xs text-muted-foreground italic">
                    {user ? "Initialize your secure dashboard now." : "Create your account to activate these protocols."}
                  </p>
                </div>
              </div>
              <Button 
                disabled={selectedIds.length === 0 || submitting}
                onClick={handleContinue}
                className="w-full md:w-auto h-14 px-10 rounded-xl bg-primary hover:bg-primary/90 font-bold shadow-xl shadow-primary/20 active:scale-95 transition-all"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  user ? "Go to Dashboard" : "Register Node Profile"
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Shield className="animate-pulse text-primary w-12 h-12" /></div>}>
      <OnboardingContent />
    </Suspense>
  );
}
