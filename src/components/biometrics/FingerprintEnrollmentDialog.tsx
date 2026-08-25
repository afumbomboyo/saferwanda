
'use client';

import { useState, useEffect } from 'react';
import { 
  Fingerprint, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  MonitorSmartphone,
  Usb
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { FingerprintProvider, EnrollmentResult } from '@/lib/biometrics/fingerprint-provider';
import { WebAuthnProvider } from '@/lib/biometrics/providers/webauthn-provider';
import { USBScannerProvider } from '@/lib/biometrics/providers/usb-scanner-provider';

type EnrollmentState = 'idle' | 'waiting' | 'scanning' | 'processing' | 'success' | 'failed';

interface FingerprintEnrollmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  policeId: string;
  serviceNumber: string;
  fullName: string;
  adminId: string;
  onSuccess: (result: EnrollmentResult) => void;
}

export function FingerprintEnrollmentDialog({
  isOpen,
  onOpenChange,
  policeId,
  serviceNumber,
  fullName,
  adminId,
  onSuccess
}: FingerprintEnrollmentDialogProps) {
  const [state, setState] = useState<EnrollmentState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [availableProviders, setAvailableProviders] = useState<FingerprintProvider[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);

  useEffect(() => {
    if (isOpen) {
      detectProviders();
    } else {
      resetState();
    }
  }, [isOpen]);

  const detectProviders = async () => {
    setIsLoadingProviders(true);
    const providers = [new WebAuthnProvider(), new USBScannerProvider()];
    const detected: FingerprintProvider[] = [];

    for (const p of providers) {
      if (await p.isAvailable()) {
        detected.push(p);
      }
    }
    setAvailableProviders(detected);
    setIsLoadingProviders(false);
  };

  const resetState = () => {
    setState('idle');
    setError(null);
  };

  const handleStartEnrollment = async (provider: FingerprintProvider) => {
    setState('waiting');
    
    // Brief delay to signal transition
    setTimeout(() => setState('scanning'), 500);

    const result = await provider.enroll(policeId, adminId);

    if (result.success) {
      setState('processing');
      setTimeout(() => {
        setState('success');
        onSuccess(result);
      }, 800);
    } else {
      setState('failed');
      setError(result.error || "Biometric interaction failed.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-border/50 shadow-2xl">
        <div className="relative p-10 space-y-8">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-accent to-rwanda-green" />
          
          <DialogHeader>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Fingerprint className="w-6 h-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black">Fingerprint Enrollment</DialogTitle>
                <DialogDescription className="text-xs uppercase tracking-widest font-bold opacity-60">Strategic Biometric Capture</DialogDescription>
              </div>
            </div>
            <div className="bg-secondary/30 rounded-2xl p-4 flex justify-between items-center border border-border">
              <div>
                <p className="text-[10px] font-black uppercase opacity-40">Officer Profile</p>
                <p className="text-sm font-bold">{fullName}</p>
              </div>
              <Badge variant="outline" className="font-mono">{serviceNumber}</Badge>
            </div>
          </DialogHeader>

          <div className="min-h-[300px] flex flex-col items-center justify-center py-6">
            {state === 'idle' && (
              <div className="w-full space-y-6">
                {isLoadingProviders ? (
                  <div className="flex flex-col items-center gap-3 py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-xs font-black uppercase tracking-widest opacity-40">Scanning for hardware...</p>
                  </div>
                ) : availableProviders.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-center mb-6">Select an available biometric method:</p>
                    {availableProviders.map(p => (
                      <Button 
                        key={p.id}
                        variant="outline" 
                        className="w-full h-20 rounded-2xl flex items-center justify-between px-8 hover:bg-primary/5 hover:border-primary/40 group transition-all"
                        onClick={() => handleStartEnrollment(p)}
                      >
                        <div className="flex items-center gap-4">
                          {p.id.includes('webauthn') ? <MonitorSmartphone className="w-6 h-6 opacity-40 group-hover:text-primary group-hover:opacity-100" /> : <Usb className="w-6 h-6 opacity-40" />}
                          <div className="text-left">
                            <p className="text-sm font-black">{p.name}</p>
                            <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest">Secure Hardware Ceremony</p>
                          </div>
                        </div>
                        <ShieldCheck className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-8 text-center space-y-4">
                    <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-destructive">No compatible devices detected.</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Connect a supported fingerprint scanner or use a device with platform biometrics (Windows Hello / TouchID).
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={detectProviders} className="rounded-xl h-10 px-6 font-bold uppercase text-[10px]">Retry Detection</Button>
                  </div>
                )}
              </div>
            )}

            {(state === 'waiting' || state === 'scanning' || state === 'processing') && (
              <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in-95">
                <div className="relative">
                  <div className={cn(
                    "w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500",
                    state === 'scanning' ? "bg-primary/20 scale-110 shadow-[0_0_40px_rgba(37,99,235,0.3)]" : "bg-secondary/50"
                  )}>
                    <Fingerprint className={cn(
                      "w-16 h-16 transition-all",
                      state === 'scanning' ? "text-primary animate-pulse" : "text-muted-foreground/30",
                      state === 'processing' && "animate-spin"
                    )} />
                  </div>
                  {state === 'scanning' && (
                    <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  )}
                </div>
                <div className="text-center space-y-2">
                  <h4 className="text-lg font-black tracking-tight">
                    {state === 'waiting' && "Requesting Server Challenge..."}
                    {state === 'scanning' && "Waiting for Biometric Interaction..."}
                    {state === 'processing' && "Verifying Cryptographic Attestation..."}
                  </h4>
                  <p className="text-xs text-muted-foreground font-medium max-w-[280px]">
                    {state === 'scanning' && "Follow your computer's prompts to use your built-in fingerprint reader."}
                    {state === 'processing' && "Saving real public key and signature counter to secure grid."}
                  </p>
                </div>
              </div>
            )}

            {state === 'success' && (
              <div className="flex flex-col items-center gap-6 animate-in zoom-in-95">
                <div className="w-24 h-24 rounded-full bg-rwanda-green/10 flex items-center justify-center border-4 border-rwanda-green/20">
                  <CheckCircle2 className="w-12 h-12 text-rwanda-green" />
                </div>
                <div className="text-center space-y-2">
                  <h4 className="text-2xl font-black">Enrollment Verified</h4>
                  <p className="text-sm font-medium text-muted-foreground">Actual public key stored in WebAuthn credentials.</p>
                </div>
                <Button onClick={() => onOpenChange(false)} className="bg-rwanda-green hover:bg-rwanda-green/90 h-12 px-10 rounded-xl font-black uppercase text-xs">Continue</Button>
              </div>
            )}

            {state === 'failed' && (
              <div className="flex flex-col items-center gap-6 animate-in slide-in-from-bottom-4">
                <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center border-4 border-destructive/20">
                  <AlertCircle className="w-10 h-10 text-destructive" />
                </div>
                <div className="text-center space-y-2 px-6">
                  <h4 className="text-xl font-black">Verification Failed</h4>
                  <p className="text-sm font-medium text-destructive/80 leading-relaxed">{error}</p>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setState('idle')} className="h-12 px-8 rounded-xl font-bold">Try Again</Button>
                  <Button variant="ghost" onClick={() => onOpenChange(false)} className="h-12 px-8 rounded-xl font-bold">Cancel</Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className={cn("pt-6 border-t border-border/50", (state === 'success' || state === 'failed') && "hidden")}>
             <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={state === 'processing'} className="rounded-xl font-bold h-12 px-8">
               Exit Enrollment
             </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
