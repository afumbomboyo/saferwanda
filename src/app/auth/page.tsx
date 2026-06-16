"use client"

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Shield, Mail, Lock, User, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const isSignUpDefault = searchParams.get('signup') === 'true';
  const [isSignUp, setIsSignUp] = useState(isSignUpDefault);

  useEffect(() => {
    setIsSignUp(isSignUpDefault);
  }, [isSignUpDefault]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow flex items-center justify-center p-4 pt-24 pb-12">
        <div className="w-full max-w-md animate-fade-in">
          <Card className="bg-card border-border shadow-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-headline font-bold">
                {isSignUp ? 'Create your Account' : 'Welcome Back'}
              </CardTitle>
              <CardDescription>
                {isSignUp 
                  ? 'Join the SafeRwanda ecosystem and secure your future.' 
                  : 'Access your security dashboard and AI Concierge.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input id="name" placeholder="John Doe" className="pl-10 bg-background" />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="john@example.com" className="pl-10 bg-background" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="••••••••" className="pl-10 bg-background" />
                </div>
              </div>
              
              <Button className="w-full bg-primary hover:bg-primary/90 h-12">
                {isSignUp ? 'Sign Up' : 'Log In'}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" className="border-border hover:bg-white/5 h-12">
                  <Github className="w-4 h-4 mr-2" />
                  Continue with GitHub
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <p className="text-sm text-center text-muted-foreground">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button 
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-primary hover:underline font-medium"
                >
                  {isSignUp ? 'Log In' : 'Sign Up'}
                </button>
              </p>
              <p className="text-[10px] text-center text-muted-foreground leading-relaxed px-8">
                By continuing, you agree to SafeRwanda's Terms of Service and Privacy Policy.
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
