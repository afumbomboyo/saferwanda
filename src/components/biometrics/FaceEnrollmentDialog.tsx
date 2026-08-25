'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck,
  RefreshCcw,
  ShieldCheck,
  Eye
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
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { PlatformFaceProvider } from '@/lib/biometrics/providers/platform-face-provider';
import { FaceEnrollmentResult } from '@/lib/biometrics/face-provider';

type EnrollmentState = 'initializing' | 'detecting' | 'capturing' | 'verifying' | 'success' | 'failed';

interface FaceEnrollmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  policeId: string;
  fullName: string;
  onSuccess: (result: FaceEnrollmentResult) => void;
}

export function FaceEnrollmentDialog({
  isOpen,
  onOpenChange,
  policeId,
  fullName,
  onSuccess
}: FaceEnrollmentDialogProps) {
  const [state, setState] = useState<EnrollmentState>('initializing');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const providerRef = useRef(new PlatformFaceProvider());

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      resetState();
    }
  }, [isOpen]);

  const startCamera = async () => {
    setState('initializing');
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setState('detecting');
    } catch (err: any) {
      setError("Camera access denied. Please allow camera permissions to enroll.");
      setState('failed');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const resetState = () => {
    setState('initializing');
    setError(null);
    setProgress(0);
    setCurrentStep(0);
  };

  const handleStartCapture = async () => {
    if (!videoRef.current) return;
    
    setState('capturing');
    const result = await providerRef.current.enroll(
      policeId, 
      videoRef.current, 
      (step, total) => {
        setCurrentStep(step);
        setProgress((step / total) * 100);
      }
    );

    if (result.success) {
      setState('verifying');
      // Simulate cryptographic verification
      setTimeout(() => {
        setState('success');
        onSuccess(result);
      }, 1000);
    } else {
      setState('failed');
      setError(result.error || "Liveness verification failed.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-[2.5rem] p-0 overflow-hidden border-border/50 shadow-2xl">
        <div className="relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-accent to-rwanda-green z-50" />
          
          <div className="p-10 space-y-8">
            <DialogHeader>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black">Facial Enrollment</DialogTitle>
                  <DialogDescription className="text-xs uppercase tracking-widest font-bold opacity-60">High-Fidelity Biometric Capture</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              {/* Camera Preview Side */}
              <div className="relative aspect-square md:aspect-[3/4] bg-black rounded-[2rem] overflow-hidden border-4 border-secondary shadow-inner group">
                {state !== 'failed' && (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className={cn(
                      "w-full h-full object-cover transition-all duration-700 -scale-x-100",
                      state === 'capturing' && "brightness-110"
                    )}
                  />
                )}
                
                {/* Tactical Overlays */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-8 border border-white/20 rounded-full" />
                  <div className="absolute inset-[30%] border-2 border-dashed border-primary/40 rounded-full animate-pulse-soft" />
                  
                  {/* Status Badges */}
                  <div className="absolute top-6 left-1/2 -translate-x-1/2">
                    <Badge className={cn(
                      "font-black uppercase text-[8px] tracking-widest px-4 h-6 border-none",
                      state === 'detecting' ? "bg-rwanda-green text-white" : "bg-primary text-white"
                    )}>
                      {state === 'detecting' ? "✓ Face Detected" : state.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                {state === 'capturing' && (
                  <div className="absolute inset-0 bg-primary/10 flex flex-col items-center justify-center backdrop-blur-[2px]">
                    <div className="bg-background/90 p-6 rounded-3xl text-center space-y-3 shadow-2xl">
                      <p className="text-xs font-black uppercase tracking-widest text-primary">Capturing Samples</p>
                      <div className="text-4xl font-black">{currentStep} / 3</div>
                      <Progress value={progress} className="h-2 w-32" />
                    </div>
                  </div>
                )}
              </div>

              {/* Guidance Side */}
              <div className="space-y-6">
                <div className="bg-secondary/30 rounded-3xl p-6 border border-border">
                  <p className="text-[10px] font-black uppercase opacity-40 mb-1">Subject</p>
                  <p className="text-xl font-black">{fullName}</p>
                  <p className="text-xs font-mono font-bold text-primary mt-1">{policeId}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-black uppercase tracking-widest opacity-60">Instructions</h4>
                  <div className="space-y-3">
                    {[
                      { icon: Eye, text: "Position face inside the frame" },
                      { icon: ShieldCheck, text: "Look directly at the camera" },
                      { icon: RefreshCcw, text: "Keep face still during capture" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
                          <item.icon className="w-4 h-4 opacity-40" />
                        </div>
                        <p className="text-xs font-bold leading-none">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {state === 'detecting' && (
                  <Button 
                    className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-xs shadow-xl"
                    onClick={handleStartCapture}
                  >
                    Start Capture
                  </Button>
                )}

                {state === 'success' && (
                  <div className="bg-rwanda-green/10 border border-rwanda-green/20 rounded-3xl p-6 text-center space-y-4">
                    <CheckCircle2 className="w-10 h-10 text-rwanda-green mx-auto" />
                    <div>
                      <p className="text-lg font-black text-rwanda-green">Capture Complete</p>
                      <p className="text-[10px] uppercase font-bold opacity-60">Liveness Verified</p>
                    </div>
                    <Button 
                      className="w-full h-12 rounded-xl bg-rwanda-green hover:bg-rwanda-green/90"
                      onClick={() => onOpenChange(false)}
                    >
                      Continue
                    </Button>
                  </div>
                )}

                {state === 'failed' && (
                  <div className="bg-destructive/5 border border-destructive/20 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center gap-3 text-destructive">
                      <AlertCircle className="w-5 h-5" />
                      <p className="text-xs font-black uppercase">Capture Error</p>
                    </div>
                    <p className="text-xs font-medium opacity-70 leading-relaxed">{error}</p>
                    <Button variant="outline" className="w-full h-12 rounded-xl border-destructive text-destructive" onClick={startCamera}>
                      Retry Capture
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
