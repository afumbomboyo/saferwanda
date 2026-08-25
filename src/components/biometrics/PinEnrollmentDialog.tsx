
'use client';

import { useState } from 'react';
import { 
  Key, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Eye, 
  EyeOff,
  Lock
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface PinEnrollmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  policeId: string;
  fullName: string;
  serviceNumber: string;
  adminId: string;
  onSuccess: (result: { configured: true; configuredAt: string }) => void;
}

export function PinEnrollmentDialog({
  isOpen,
  onOpenChange,
  policeId,
  fullName,
  serviceNumber,
  adminId,
  onSuccess
}: PinEnrollmentDialogProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const validatePin = () => {
    if (pin.length !== 6) return "PIN must be exactly 6 digits.";
    if (pin !== confirmPin) return "PINs do not match.";
    
    const weakPins = ['123456', '000000', '111111', '222222', '333333', '444444', '555555', '666666', '777777', '888888', '999999', '654321'];
    if (weakPins.includes(pin)) return "This PIN is too common. Choose a stronger pattern.";
    if (pin === serviceNumber.replace(/\D/g, '')) return "PIN cannot match police service number.";
    
    return null;
  };

  const handleEnroll = async () => {
    const validationError = validatePin();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/police/${policeId}/pin/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, adminId }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to configure PIN");

      setIsSuccess(true);
      setTimeout(() => {
        onSuccess({ configured: true, configuredAt: new Date().toISOString() });
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-border/50 shadow-2xl">
        <div className="relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-accent to-rwanda-green" />
          
          <div className="p-10 space-y-8">
            <DialogHeader>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Key className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black">PIN Configuration</DialogTitle>
                  <DialogDescription className="text-[10px] uppercase tracking-widest font-bold opacity-60">Tertiary Security Factor</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-6 animate-in zoom-in-95">
                <div className="w-20 h-20 rounded-full bg-rwanda-green/10 flex items-center justify-center border-4 border-rwanda-green/20">
                  <CheckCircle2 className="w-10 h-10 text-rwanda-green" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-rwanda-green">PIN Configured</p>
                  <p className="text-xs font-bold opacity-40 uppercase tracking-widest mt-1">Credential Hashed & Stored</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-secondary/30 rounded-2xl p-4 border border-border">
                  <p className="text-[8px] font-black uppercase opacity-40 mb-1">Subject</p>
                  <p className="text-sm font-bold">{fullName} ({serviceNumber})</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">New 6-Digit PIN</Label>
                    <div className="relative">
                      <Input 
                        type={showPin ? "text" : "password"}
                        placeholder="••••••"
                        maxLength={6}
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                        className="h-14 rounded-2xl bg-secondary/30 border-border text-center text-2xl tracking-[0.5em] font-mono"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm PIN</Label>
                    <Input 
                      type="password"
                      placeholder="••••••"
                      maxLength={6}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                      className="h-14 rounded-2xl bg-secondary/30 border-border text-center text-2xl tracking-[0.5em] font-mono"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start gap-3 text-destructive animate-in slide-in-from-top-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-bold leading-tight">{error}</p>
                  </div>
                )}

                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-center gap-3">
                  <Lock className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-[10px] font-medium leading-relaxed opacity-70">
                    The PIN will be cryptographically hashed using Argon2id. SafeRwanda does not store your plaintext PIN.
                  </p>
                </div>

                <Button 
                  className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-xs shadow-xl"
                  onClick={handleEnroll}
                  disabled={isSubmitting || pin.length < 6 || confirmPin.length < 6}
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Configure Access PIN"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
