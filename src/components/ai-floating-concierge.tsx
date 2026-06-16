"use client"

import { useState, useRef, useEffect } from 'react';
import { aiChatServiceRecommendation } from '@/ai/flows/ai-chat-service-recommendation';
import { Sparkles, MessageSquare, X, Send, Loader2, Shield, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
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

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number; moved: boolean } | null>(null);

  useEffect(() => {
    const margin = 32;
    const initialX = window.innerWidth - 80 - margin;
    const initialY = window.innerHeight - 80 - margin;
    setPosition({ x: initialX, y: initialY });
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
      moved: false
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragRef.current) return;
      
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        dragRef.current.moved = true;
      }

      const newX = dragRef.current.initialX + deltaX;
      const newY = dragRef.current.initialY + deltaY;

      const maxX = window.innerWidth - 80;
      const maxY = window.innerHeight - 80;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleButtonClick = () => {
    if (dragRef.current && !dragRef.current.moved) {
      setIsOpen(true);
    }
  };

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
    <>
      <div 
        className="fixed z-[100]"
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
          transition: isDragging ? 'none' : 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        <div className="relative group">
          <button
            onMouseDown={handleMouseDown}
            onClick={handleButtonClick}
            className={cn(
              "w-20 h-20 rounded-[2rem] bg-gradient-to-br from-primary to-accent text-white shadow-[0_0_50px_rgba(37,99,235,0.4)] flex items-center justify-center transition-all hover:scale-110 active:scale-95",
              isDragging ? "cursor-grabbing scale-105 rotate-6 shadow-primary/60" : "cursor-grab animate-bounce-subtle"
            )}
          >
            <MessageSquare className="w-10 h-10" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-background animate-pulse" />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/60 backdrop-blur-xl animate-in fade-in duration-300">
          <Card className="w-full max-w-[500px] h-[700px] max-h-[90vh] shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden border-white/10 glass-card animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 rounded-[2.5rem]">
            <CardHeader className="bg-gradient-to-r from-primary to-accent text-white p-8 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-headline font-bold">AI Concierge</CardTitle>
                  <CardDescription className="text-white/70 text-xs font-bold uppercase tracking-widest">Expert Safety Protocol</CardDescription>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/10 h-10 w-10 rounded-full"
              >
                <X className="w-6 h-6" />
              </Button>
            </CardHeader>

            <CardContent className="flex-grow overflow-hidden p-0">
              <ScrollArea className="h-full p-8">
                <div className="space-y-6">
                  <div className="bg-white/5 border border-white/5 p-4 rounded-3xl rounded-tl-none max-w-[90%] text-sm leading-relaxed">
                    System initialized. I am your SafeRwanda Strategic Intelligence unit. How can I architect your security roadmap today?
                  </div>

                  {response && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="bg-primary/10 border border-primary/20 p-6 rounded-3xl text-sm leading-relaxed shadow-inner">
                        <div className="flex items-center gap-2 mb-4 font-bold text-primary uppercase tracking-widest text-xs">
                          <Sparkles className="w-4 h-4" />
                          Strategic Insight
                        </div>
                        {response.advice}
                      </div>

                      <div className="space-y-3">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-black px-1">Hardware Deployments</p>
                        {response.recommendedServices.map((service, idx) => (
                          <div key={idx} className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl text-sm hover:border-primary/40 transition-all hover:translate-x-1">
                            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                            <span className="font-bold">{service}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {loading && (
                    <div className="flex items-center gap-3 text-primary text-xs font-bold tracking-widest animate-pulse p-4">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      SYNCHRONIZING PROTOCOLS...
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>

            <CardFooter className="p-6 border-t border-white/5 bg-background/50">
              <form onSubmit={handleSubmit} className="flex w-full gap-3">
                <Input
                  placeholder="Inquire about a safety domain..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={loading}
                  autoFocus
                  className="flex-grow bg-white/5 border-white/5 focus-visible:ring-primary h-14 rounded-2xl px-6"
                />
                <Button 
                  type="submit" 
                  size="icon"
                  disabled={loading || !query.trim()}
                  className="h-14 w-14 shrink-0 rounded-2xl bg-primary shadow-lg shadow-primary/20"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}