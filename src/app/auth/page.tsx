'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Shield, Mail, Lock, User, Loader2, AlertTriangle, Eye, EyeOff, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, serverTimestamp, collection, getDocs, query, limit } from 'firebase/firestore';

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { auth, db } = { auth: useAuth(), db: useFirestore() };
  const { user: currentUser, loading: userLoading } = useUser();
  const { toast } = useToast();
  
  const isSignUpDefault = searchParams.get('signup') === 'true';
  const [isSignUp, setIsSignUp] = useState(isSignUpDefault);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  
  const isPerformingManualAuth = useRef(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setIsSignUp(isSignUpDefault);
  }, [isSignUpDefault]);

  const mergeSelections = () => {
    const tempInitial = localStorage.getItem('temp_initial_service');
    const tempSelected = localStorage.getItem('temp_selected_services');
    let services: string[] = tempSelected ? JSON.parse(tempSelected) : [];
    if (tempInitial && !services.includes(tempInitial)) {
      services.push(tempInitial);
    }
    return services;
  };

  const getFriendlyErrorMessage = (error: any) => {
    switch (error.code) {
      case 'auth/invalid-email':
        return 'The email address you entered is not valid.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
        return 'We couldn\'t find an account with that email.';
      case 'auth/wrong-password':
        return 'The password you entered is incorrect.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Your password is too weak. Please use at least 8 characters.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/invalid-credential':
        return 'Invalid login details. Please check your email and password.';
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  };

  // Background Session Listener
  useEffect(() => {
    if (userLoading || !currentUser || isPerformingManualAuth.current) return;

    const checkUserStatus = async () => {
      if (!db) return;
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const services = mergeSelections();
        if (services.length > 0) {
          await updateDoc(userDocRef, {
            servicesSelected: arrayUnion(...services),
            isOnboarded: true
          });
          localStorage.removeItem('temp_selected_services');
          localStorage.removeItem('temp_initial_service');
          router.replace('/dashboard?tab=staging');
        } else {
          const data = userDoc.data();
          router.replace(data?.isOnboarded ? '/dashboard' : '/onboarding');
        }
      } else {
        router.replace('/onboarding');
      }
    };

    checkUserStatus();
  }, [currentUser, userLoading, db, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;

    setError(null);

    // Validation
    if (password.length < 8) {
      setError({ message: 'Password must be at least 8 characters long.' });
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError({ message: 'Passwords do not match.' });
      return;
    }

    setLoading(true);
    isPerformingManualAuth.current = true;

    try {
      if (isSignUp) {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(res.user, { displayName: fullName });
        
        const services = mergeSelections();

        const usersSnap = await getDocs(query(collection(db, 'users'), limit(1)));
        const isFirstUser = usersSnap.empty;

        await setDoc(doc(db, 'users', res.user.uid), {
          uid: res.user.uid,
          fullName,
          email,
          isAdmin: isFirstUser,
          servicesSelected: services,
          isOnboarded: services.length > 0,
          createdAt: serverTimestamp(),
        });

        localStorage.removeItem('temp_selected_services');
        localStorage.removeItem('temp_initial_service');
        
        toast({
          title: "Account Created",
          description: `Welcome to SafeRwanda, ${fullName}!${isFirstUser ? ' You have been granted admin privileges.' : ''}`,
        });

        router.replace(services.length > 0 ? '/dashboard?tab=staging' : '/onboarding');
      } else {
        const res = await signInWithEmailAndPassword(auth, email, password);
        
        toast({
          title: "Welcome Back",
          description: `Successfully signed in as ${res.user.displayName || res.user.email}.`,
        });

        const userDocRef = doc(db, 'users', res.user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          router.replace(data?.isOnboarded ? '/dashboard' : '/onboarding');
        } else {
          router.replace('/onboarding');
        }
      }
    } catch (err: any) {
      setError({ message: getFriendlyErrorMessage(err), code: err.code });
      isPerformingManualAuth.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background pt-24 overflow-x-hidden">
      {/* Tactical Branding Pane (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center p-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80" 
            alt="Security Background" 
            fill 
            className="object-cover opacity-20 grayscale brightness-50"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <ShieldCheck className="w-4 h-4" />
            Strategic Operations Grid
          </div>
          <h1 className="text-5xl xl:text-7xl font-headline font-black tracking-tighter leading-none text-foreground">
            Secure Your <br />
            <span className="text-primary">Piece of Tomorrow.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg font-light leading-relaxed">
            SafeRwanda is building the next generation of IoT security infrastructure. Join the network of protected citizens today.
          </p>

          <div className="grid grid-cols-2 gap-8 pt-12">
            {[
              { label: 'Uptime', value: '99.9%' },
              { label: 'Deployments', value: '1,200+' },
              { label: 'Response', value: '< 2s' },
              { label: 'Security', value: 'AES-256' }
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary opacity-60">{stat.label}</p>
                <p className="text-2xl font-black">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-16 left-16 z-10 flex items-center gap-4 text-[10px] font-bold text-muted-foreground opacity-40 uppercase tracking-[0.3em]">
          <div className="w-12 h-px bg-muted-foreground" />
          SafeRwanda IoT Labs • 2024
        </div>
      </div>

      {/* Auth Form Pane */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-12 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md animate-fade-in relative z-10">
          <Card className="glass-card shadow-2xl relative overflow-hidden rounded-[2.5rem] border-white/5">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-accent to-rwanda-green" />
            
            <CardHeader className="text-center pb-2 pt-10">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-3xl font-headline font-black tracking-tight">
                {isSignUp ? 'Initialize Account' : 'Login'}
              </CardTitle>
              <CardDescription className="text-sm font-light mt-2 px-8">
                {isSignUp 
                  ? 'Initialize your SafeRwanda security account.' 
                  : 'Access your monitoring dashboard.'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-6 pb-8">
              {error && (
                <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-[11px] font-bold flex items-start gap-3 animate-in slide-in-from-top-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <div>
                    <p className="uppercase tracking-widest mb-1">Authorization Issue</p>
                    <p className="opacity-80 font-medium">{error.message}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-5">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        id="name" 
                        placeholder="Agent Name" 
                        className="pl-12 h-14 rounded-2xl bg-secondary/30 border-white/5 focus-visible:ring-primary focus-visible:bg-secondary/50 transition-all" 
                        required 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="agent@saferwanda.io" 
                      className="pl-12 h-14 rounded-2xl bg-secondary/30 border-white/5 focus-visible:ring-primary focus-visible:bg-secondary/50 transition-all" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-1">
                    <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
                    {!isSignUp && <button type="button" className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">Forgot?</button>}
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="password" 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="••••••••" 
                      className="pl-12 pr-12 h-14 rounded-2xl bg-secondary/30 border-white/5 focus-visible:ring-primary focus-visible:bg-secondary/50 transition-all" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm Identity</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        id="confirmPassword" 
                        type={showConfirmPassword ? 'text' : 'password'} 
                        placeholder="••••••••" 
                        className="pl-12 pr-12 h-14 rounded-2xl bg-secondary/30 border-white/5 focus-visible:ring-primary focus-visible:bg-secondary/50 transition-all" 
                        required 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
                
                <Button className="w-full bg-primary hover:bg-primary/90 h-16 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 active:scale-[0.98] transition-all" disabled={loading}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? 'Create Account' : 'Login')}
                  {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </form>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-4 pb-10">
              <div className="flex items-center gap-4 w-full px-8">
                <div className="h-px flex-grow bg-white/5" />
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">Status Check</span>
                <div className="h-px flex-grow bg-white/5" />
              </div>
              <p className="text-xs text-center text-muted-foreground font-light">
                {isSignUp ? 'Already registered?' : "New to the network?"}{' '}
                <button 
                  onClick={() => {
                    if (isSignUp) {
                      setIsSignUp(false);
                      router.push('/auth');
                    } else {
                      router.push('/services?signup_hint=true');
                    }
                  }}
                  className="text-primary hover:underline font-black uppercase tracking-widest text-[10px] ml-1"
                >
                  {isSignUp ? 'Log In' : 'Sign Up'}
                </button>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Shield className="h-12 w-12 animate-pulse text-primary" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Initializing Security Protocol...</p>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}