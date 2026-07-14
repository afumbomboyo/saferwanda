
'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Shield, Mail, Lock, User, Loader2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
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

        // Check if this is the first user on the platform
        const usersSnap = await getDocs(query(collection(db, 'users'), limit(1)));
        const isFirstUser = usersSnap.empty;

        await setDoc(doc(db, 'users', res.user.uid), {
          uid: res.user.uid,
          fullName,
          email,
          isAdmin: isFirstUser, // Auto-promote first user
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

        // For manual sign-in, we check if they are onboarded to decide where to redirect
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
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow flex items-center justify-center p-4 pt-24 pb-12">
        <div className="w-full max-w-md animate-fade-in">

          <Card className="glass-card shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-rwanda-green" />
            
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-headline font-bold">
                {isSignUp ? 'Secure Your Piece of Tomorrow' : 'Login'}
              </CardTitle>
              <CardDescription>
                {isSignUp 
                  ? 'Initialize your SafeRwanda security account.' 
                  : 'Access your monitoring dashboard.'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-start gap-3 animate-in slide-in-from-top-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <div>
                    <p className="font-bold mb-1">Authorization Issue</p>
                    <p className="opacity-80">{error.message}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="name" 
                        placeholder="Agent Name" 
                        className="pl-10 h-12 rounded-xl" 
                        required 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="agent@saferwanda.io" 
                      className="pl-10 h-12 rounded-xl" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="••••••••" 
                      className="pl-10 pr-10 h-12 rounded-xl" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {isSignUp && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Must be at least 8 characters long.
                    </p>
                  )}
                </div>

                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="confirmPassword" 
                        type={showConfirmPassword ? 'text' : 'password'} 
                        placeholder="••••••••" 
                        className="pl-10 pr-10 h-12 rounded-xl" 
                        required 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
                
                <Button className="w-full bg-primary hover:bg-primary/90 h-12 rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all" disabled={loading}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? 'Create Account' : 'Login')}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <p className="text-sm text-center text-muted-foreground">
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
                  className="text-primary hover:underline font-bold"
                >
                  {isSignUp ? 'Log In' : 'Sign Up'}
                </button>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
