"use client"

import { useState, useRef, useEffect } from 'react';
import { aiChatServiceRecommendation } from '@/ai/flows/ai-chat-service-recommendation';
import { Sparkles, MessageSquare, X, Send, Loader2, Shield, GripVertical, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function AIFloatingConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{
    advice: string;
    recommendedServices: string[];
  } | null>(null);

  // Position management
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial position: Bottom right
    const margin = 24;
    setPosition({
      x: window.innerWidth - 80 - margin,
      y: window.innerHeight - 80 - margin
    });
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragRef.current) return;
      
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      
      const newX = dragRef.current.initialX + deltaX;
      const newY = dragRef.current.initialY + deltaY;

      // Boundaries
      const maxX = window.innerWidth - 80;
      const maxY = window.innerHeight - 80;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position]);

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
    <div 
      ref={containerRef}
      className="fixed z-[100]"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        transition: isDragging ? 'none' : 'all 0.1s ease-out'
      }}
    >
      {/* Floating Button */}
      {!isOpen && (
        <div className="relative group">
          <button
            onMouseDown={handleMouseDown}
            onClick={() => setIsOpen(true)}
            className={cn(
              "w-16 h-16 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 animate-bounce-subtle",
              isDragging && "cursor-grabbing scale-105"
            )}
          >
            <MessageSquare className="w-8 h-8" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-primary animate-pulse" />
          </button>
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-card border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none text-sm font-medium">
            AI Concierge
          </div>
        </div>
      )}

      {/* Chat Interface */}
      {isOpen && (
        <Card className="absolute bottom-0 right-0 w-[90vw] max-w-[400px] h-[500px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 zoom-in-95">
          <CardHeader className="bg-primary text-white p-4 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/20">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-headline">AI Concierge</CardTitle>
                <CardDescription className="text-white/70 text-xs">Security Expert</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onMouseDown={handleMouseDown}
                className="p-1 hover:bg-white/10 rounded cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="w-4 h-4" />
              </button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/10 h-8 w-8"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-grow overflow-hidden p-0 bg-background/50 backdrop-blur-sm">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                <div className="bg-muted p-3 rounded-2xl rounded-tl-none max-w-[85%] text-sm">
                  Hello! I'm your SafeRwanda AI assistant. How can I help secure your world today?
                </div>

                {response && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-accent/10 border border-accent/20 p-4 rounded-2xl text-sm leading-relaxed">
                      <div className="flex items-center gap-2 mb-2 font-bold text-accent">
                        <Sparkles className="w-4 h-4" />
                        Safe Advice
                      </div>
                      {response.advice}
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold px-1">Recommended Services</p>
                      {response.recommendedServices.map((service, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl text-sm">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                          <span className="font-medium">{service}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {loading && (
                  <div className="flex items-center gap-2 text-muted-foreground text-xs animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing security needs...
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="p-4 border-t border-border bg-background">
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <Input
                placeholder="Type a concern..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
                className="flex-grow bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary h-10 text-sm"
              />
              <Button 
                type="submit" 
                size="icon"
                disabled={loading || !query.trim()}
                className="h-10 w-10 shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}