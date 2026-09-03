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
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  User
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

const POSE_INSTRUCTIONS = [
  { label: 'Neutral', icon: User, text: 'Look directly at the camera' },
  { label: 'Turn Left', icon: ChevronLeft, text: 'Slowly turn your head left' },
  { label: 'Turn Right', icon: ChevronRight, text: 'Slowly turn your head right' },
  { label: 'Look Up', icon: ChevronUp, text: 'Tilt your head upwards' },
  { label: 'Look Down', icon: ChevronDown, text: 'Tilt your head downwards' }
];

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
  const [totalSteps, setTotalSteps] = useState(5);
  const [livenessInstruction, setLivenessInstruction] = useState<string | null>(null);
  const [livenessActive, setLivenessActive] = useState(false);
  
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
    setTotalSteps(5);
    setLivenessActive(false);
    setLivenessInstruction(null);
  };

  const handleStartCapture = async () => {
    if (!videoRef.current) return;
    
    setState('capturing');
    const result = await providerRef.current.enroll(
      policeId, 
      videoRef.current, 
      (step, total) => {
        setCurrentStep(step);
        setTotalSteps(total);
        setProgress((step / total) * 100);
      },
      (instruction) => {
        setLivenessInstruction(instruction || null);
        setLivenessActive(!!instruction);
      }
    );

    if (result.success) {
      setState('verifying');
      setTimeout(() => {
        setState('success');
        onSuccess(result);
      }, 1500);
    } else {
      setState('failed');
      setError(result.error || "Liveness verification failed.");
    }
  };

  const currentPose = !livenessActive && currentStep > 0 && currentStep <= POSE_INSTRUCTIONS.length 
    ? POSE_INSTRUCTIONS[currentStep - 1] 
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl rounded-[2.5rem] p-0 overflow-hidden border-border/50 shadow-2xl">
        <div className="relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-accent to-rwanda-green z-50" />
          
          <div className="p-10 space-y-8">
            <DialogHeader>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black">Biometric Facial Registry</DialogTitle>
                  <DialogDescription className="text-xs uppercase tracking-widest font-bold opacity-60">Multi-Pose Liveness Protocol</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
              {/* Camera Preview Side */}
              <div className="relative aspect-square md:aspect-[4/5] bg-black rounded-[2.5rem] overflow-hidden border-4 border-secondary shadow-inner group">
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
                  <div className="absolute inset-10 border border-white/20 rounded-full" />
                  <div className="absolute inset-[25%] border-2 border-dashed border-primary/40 rounded-full animate-pulse-soft" />
                  
                  {/* Status Badges */}
                  <div className="absolute top-8 left-1/2 -translate-x-1/2">
                    <Badge className={cn(
                      "font-black uppercase text-[9px] tracking-widest px-6 h-8 border-none shadow-xl",
                      state === 'detecting' ? "bg-rwanda-green text-white" : "bg-primary text-white"
                    )}>
                      {state === 'detecting' ? "✓ Frame Ready" : state === 'capturing' ? (livenessActive ? "LIVENESS ACTIVE" : `POSE: ${currentPose?.label.toUpperCase() || 'STABILIZING'}`) : state.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                {state === 'capturing' && (
                  <div className="absolute inset-0 bg-primary/20 flex flex-col items-center justify-end p-12 backdrop-blur-[1px]">
                    <div className="bg-background/95 p-8 rounded-[2rem] w-full text-center space-y-4 shadow-2xl animate-in slide-in-from-bottom-4">
                      {livenessActive ? (
                        <>
                          <div className="flex items-center justify-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-primary" />
                            <p className="text-sm font-black uppercase tracking-widest text-primary">Liveness Check</p>
                          </div>
                          <p className="text-lg font-black">{livenessInstruction}</p>
                          <p className="text-[10px] font-bold opacity-60">Follow instructions while keeping face visible</p>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-center gap-3">
                            {currentPose && <currentPose.icon className="w-5 h-5 text-primary" />}
                            <p className="text-sm font-black uppercase tracking-widest text-primary">{currentPose?.label || 'Processing'}</p>
                          </div>
                          <p className="text-xs font-bold opacity-70">{currentPose?.text || 'Wait for next frame...'}</p>
                        </>
                      )}
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase opacity-40">
                          <span>Progress</span>
                          <span>{currentStep} / {totalSteps}</span>
                        </div>
                        <Progress value={progress} className="h-2.5 rounded-full" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Guidance Side */}
              <div className="space-y-8 pt-4">
                <div className="bg-secondary/40 rounded-[2rem] p-8 border border-border space-y-2">
                  <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">Enrolling Officer</p>
                  <p className="text-2xl font-black leading-none">{fullName}</p>
                  <p className="text-xs font-mono font-bold text-primary opacity-60">{policeId}</p>
                </div>

                <div className="space-y-4">
                  {livenessActive && livenessInstruction && (
                    <div className="mb-4 rounded-[1.5rem] border border-blue-500/30 bg-blue-500/10 p-6 text-center animate-in fade-in zoom-in-95">
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">
                        Liveness Verification
                      </p>
                      <p className="text-xl font-black mb-1">
                        {livenessInstruction}
                      </p>
                      <p className="text-[10px] font-medium opacity-60">
                        Follow the instruction while keeping your face visible to the camera.
                      </p>
                    </div>
                  )}

                  <h4 className="text-sm font-black uppercase tracking-widest opacity-60 border-b border-border pb-2">
                    {livenessActive ? 'Verification Step' : 'Enrollment Instructions'}
                  </h4>
                  <div className={cn("space-y-6 transition-opacity duration-300", livenessActive && "opacity-20 pointer-events-none")}>
                    {POSE_INSTRUCTIONS.map((item, i) => (
                      <div key={i} className={cn(
                        "flex items-center gap-4 transition-all duration-300",
                        !livenessActive && currentStep === i + 1 ? "translate-x-2" : "opacity-40"
                      )}>
                        <div className={cn(
                          "w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-colors",
                          !livenessActive && currentStep === i + 1 ? "bg-primary/10 border-primary text-primary" : "bg-secondary border-transparent"
                        )}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-tight">{item.label}</p>
                          <p className="text-[10px] font-medium leading-none mt-1">{item.text}</p>
                        </div>
                        {!livenessActive && currentStep > i + 1 && <CheckCircle2 className="w-5 h-5 ml-auto text-rwanda-green" />}
                        {!livenessActive && currentStep === i + 1 && state === 'capturing' && <Loader2 className="w-4 h-4 ml-auto animate-spin text-primary" />}
                      </div>
                    ))}
                  </div>
                </div>

                {state === 'detecting' && (
                  <Button 
                    className="w-full h-16 rounded-[1.5rem] bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-xs shadow-2xl active:scale-[0.98] transition-all"
                    onClick={handleStartCapture}
                  >
                    Initiate Multi-Factor Capture
                  </Button>
                )}

                {state === 'success' && (
                  <div className="bg-rwanda-green/10 border border-rwanda-green/20 rounded-[2rem] p-8 text-center space-y-6 animate-in zoom-in-95">
                    <div className="w-20 h-20 rounded-full bg-rwanda-green/20 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-10 h-10 text-rwanda-green" />
                    </div>
                    <div>
                      <p className="text-xl font-black text-rwanda-green">Protocol Complete</p>
                      <p className="text-[10px] uppercase font-bold opacity-60 tracking-widest mt-1">Multi-Pose Template Verified</p>
                    </div>
                    <Button 
                      className="w-full h-14 rounded-2xl bg-rwanda-green hover:bg-rwanda-green/90 shadow-xl"
                      onClick={() => onOpenChange(false)}
                    >
                      Return to Registry
                    </Button>
                  </div>
                )}

                {state === 'failed' && (
                  <div className="bg-destructive/5 border border-destructive/20 rounded-[2rem] p-8 space-y-6">
                    <div className="flex items-center gap-3 text-destructive">
                      <AlertCircle className="w-6 h-6" />
                      <p className="text-sm font-black uppercase tracking-widest">Protocol Failure</p>
                    </div>
                    <p className="text-xs font-medium opacity-70 leading-relaxed">{error}</p>
                    <Button variant="outline" className="w-full h-14 rounded-2xl border-destructive text-destructive font-bold uppercase text-[10px]" onClick={startCamera}>
                      Reset Protocol
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
