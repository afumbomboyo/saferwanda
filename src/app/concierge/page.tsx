
"use client"

import { useState } from 'react';
import { aiChatServiceRecommendation } from '@/ai/flows/ai-chat-service-recommendation';
import Navbar from '@/components/navbar';
import { Shield, Sparkles, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ConciergePage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{
    advice: string;
    recommendedServices: string[];
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const result = await aiChatServiceRecommendation({ query });
      setResponse(result);
    } catch (error) {
      console.error('Error getting AI recommendation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3 h-3" />
              AI-Powered Consultant
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-extrabold mb-4">SafeRwanda AI Concierge</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tell us about your security concerns, and our AI expert will recommend the most suitable services for your unique situation.
            </p>
          </div>

          <Card className="bg-card border-border shadow-2xl mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                How can we protect you today?
              </CardTitle>
              <CardDescription>
                Ask anything like "I'm worried about my house when I'm at work" or "My parents live alone and I want to ensure they are safe."
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input 
                  placeholder="Describe your security situation..." 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-background border-border h-12"
                  disabled={loading}
                />
                <Button 
                  type="submit" 
                  disabled={loading || !query.trim()}
                  className="bg-primary hover:bg-primary/90 h-12 px-6"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </Button>
              </form>
            </CardContent>
          </Card>

          {response && (
            <div className="space-y-6 animate-fade-in">
              <Card className="bg-secondary/20 border-accent/30">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    Safety Advice
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-lg leading-relaxed">
                  {response.advice}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {response.recommendedServices.map((service, idx) => (
                  <Card key={idx} className="bg-card border-border flex items-center p-4 gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-headline font-bold">{service}</h4>
                      <Badge variant="secondary" className="mt-1">Recommended</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
