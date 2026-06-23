
"use client"

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Shield, Mail, Lock, User, Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithRedirect, 
  getRedirectResult,
  updateProfile,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { auth, db } = useAuth() ? { auth: useAuth(), db: useFirestore() } : { auth: null, db: null };
  const { user: currentUser, loading: userLoading } = useUser();
  
  const isSignUpDefault = searchParams.get('signup') === 'true';
  const [isSignUp, setIsSignUp] = useState(isSignUpDefault);
  const [loading, setLoading] = useState(false);
  const [checkingRedirect, setCheckingRedirect] = useState(true);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  
  const isPerformingManualAuth = useRef(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    setIsSignUp(isSignUpDefault);
  }, [isSignUpDefault]);

  // Handle Google Redirect Result
  useEffect(() => {
    if (!auth || !db) return;

    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        
        if (!result || !result.user) {
          setCheckingRedirect(false);
          return;
        }

        isPerformingManualAuth.current = true;
        setLoading(true);

        const user = result.user;
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          // New User via Google -> Check for temporary selection
          const savedServices = localStorage.getItem('temp_selected_services');
          const services = savedServices ? JSON.parse(savedServices) : [];

          // Create the user profile immediately if we have services
          await setDoc(userDocRef, {
            uid: user.uid,
            fullName: user.displayName || 'Security Agent',
            email: user.email || '',
            servicesSelected: services,
            isOnboarded: services.length > 0,
            createdAt: serverTimestamp(),
          });

          localStorage.removeItem('temp_selected_services');
          
          if (services.length > 0) {
            router.replace('/dashboard');
          } else {
            router.replace('/onboarding');
          }
        } else {
          // Existing user -> Dashboard
          const data = userDoc.data();
          router.replace(data?.isOnboarded ? '/dashboard' : '/onboarding');
        }
      } catch (err: any) {
        console.error("Redirect Error:", err);
        // Special handling for domain authorization issues often seen in Cloud Workstations
        if (err.code === 'auth/unauthorized-domain') {
          setError({ 
            message: `Domain not authorized. Please add ${window.location.hostname} to your Firebase Console Authorized Domains.`,
            code: err.code 
          });
        } else {
          setError({ message: err.message, code: err.code });
        }
      } finally {
        setLoading(false);
        setCheckingRedirect(false);
        isPerformingManualAuth.current = false;
      }
    };

    handleRedirect();
  }, [auth, db, router]);

  // Background Session Listener (Auto-redirect if already logged in)
  useEffect(() => {
    if (checkingRedirect || userLoading || !currentUser || isPerformingManualAuth.current) return;

    const checkUserStatus = async () => {
      if (!db) return;
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data?.isOnboarded) {
          router.replace('/dashboard');
        } else {
          router.replace('/onboarding');
        }
      } else {
        // Logged in but no doc? Send to onboarding to pick services.
        router.replace('/onboarding');
      }
    };

    checkUserStatus();
  }, [currentUser, userLoading, checkingRedirect, db, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;

    setLoading(true);
    setError(null);
    isPerformingManualAuth.current = true;

    try {
      if (isSignUp) {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(res.user, { displayName: fullName });
        
        const savedServices = localStorage.getItem('temp_selected_services');
        const services = savedServices ? JSON.parse(savedServices) : [];

        await setDoc(doc(db, 'users', res.user.uid), {
          uid: res.user.uid,
          fullName,
          email,
          servicesSelected: services,
          isOnboarded: services.length > 0,
          createdAt: serverTimestamp(),
        });

        localStorage.removeItem('temp_selected_services');
        router.replace(services.length > 0 ? '/dashboard' : '/onboarding');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        // useEffect listener handles redirection for existing users
      }
    } catch (err: any) {
      setError({ message: err.message, code: err.code });
      isPerformingManualAuth.current = false;
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setError(null);
    setLoading(true);
    isPerformingManualAuth.current = true;
    const provider = new GoogleAuthProvider();
    try {
      // Use Redirect instead of Popup for Cloud Workstation stability
      await signInWithRedirect(auth, provider);
    } catch (err: any) {
      setError({ message: err.message, code: err.code });
      setLoading(false);
      isPerformingManualAuth.current = false;
    }
  };

  if (checkingRedirect) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Synchronizing Security Protocols...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow flex items-center justify-center p-4 pt-24 pb-12">
        <div className="w-full max-w-md animate-fade-in">
          <Link href="/services" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Services
          </Link>

          <Card className="bg-card border-border shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-rwanda-green" />
            
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-headline font-bold">
                {isSignUp ? 'Secure Your Piece of Tomorrow' : 'Agent Access'}
              </CardTitle>
              <CardDescription>
                {isSignUp 
                  ? 'Initialize your SafeRwanda security node.' 
                  : 'Access your monitoring dashboard and AI concierge.'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-start gap-3 animate-in slide-in-from-top-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <div>
                    <p className="font-bold mb-1">Authorization Conflict</p>
                    <p className="opacity-80">{error.message}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
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
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
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
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      className="pl-10 h-12 rounded-xl" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <Button className="w-full bg-primary hover:bg-primary/90 h-12 rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all" disabled={loading}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? 'Create Node Account' : 'Authenticate')}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground font-bold tracking-widest">Or utilize external provider</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="border-border hover:bg-primary/5 h-12 rounded-xl font-bold transition-all group"
                >
                  <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
                    <path fill="#FBBC05" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09c1.97 3.92 6.02 6.62 10.71 6.62z"/>
                    <path fill="#34A853" d="M5.27 14.29c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29v-3.09h-3.98c-.81 1.61-1.27 3.44-1.27 5.38s.46 3.77 1.27 5.38l3.98-3.09z"/>
                    <path fill="#4285F4" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44c-2.1-1.96-4.85-3.11-8.04-3.11-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
                  </svg>
                  Continue with Google
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <p className="text-sm text-center text-muted-foreground">
                {isSignUp ? 'Already registered?' : "New to the network?"}{' '}
                <button 
                  onClick={() => setIsSignUp(!isSignUp)}
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
