"use client"

import { useState, useRef, useEffect } from 'react';
import { aiChatServiceRecommendation } from '@/ai/flows/ai-chat-service-recommendation';
import { Sparkles, MessageSquare, X, Send, Loader2, Shield, GripVertical, CheckCircle2 } from 'lucide-react';
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

  // Position management
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number; moved: boolean } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial position: Bottom right
    const margin = 24;
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
      
      // If moved more than 5px, mark as moved to prevent accidental click
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        dragRef.current.moved = true;
      }

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
    // Only open if we haven't been dragging
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
      // Error is handled by the global listener if configured, or just silently logged here
      console.error('Error getting AI recommendation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Draggable Button */}
      <div 
        ref={containerRef}
        className="fixed z-[100]"
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
          transition: isDragging ? 'none' : 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        <div className="relative group">
          <button
            onMouseDown={handleMouseDown}
            onClick={handleButtonClick}
            className={cn(
              "w-16 h-16 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95",
              isDragging ? "cursor-grabbing scale-105" : "cursor-grab animate-bounce-subtle"
            )}
            title="Drag to move, click to chat"
          >
            <MessageSquare className="w-8 h-8" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-primary animate-pulse" />
          </button>
          {!isOpen && !isDragging && (
            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-card border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none text-sm font-medium">
              AI Concierge
            </div>
          )}
        </div>
      </div>

      {/* Centered Chat Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-[450px] h-[600px] max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
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
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/10 h-8 w-8"
              >
                <X className="w-5 h-5" />
              </Button>
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
                          <div key={idx} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl text-sm hover:border-primary/50 transition-colors">
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
                  autoFocus
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
        </div>
      )}
    </>
  );
}
