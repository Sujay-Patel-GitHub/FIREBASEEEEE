
'use client';

import { useState, useRef, useEffect } from 'react';
import type { CoreMessage } from '../../app/actions';
import { getChatbotResponse } from '../../app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatbotProps {
  initialMessage?: string;
}

export function Chatbot({ initialMessage }: ChatbotProps) {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<CoreMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const initialMessageSent = useRef(false);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);
  
  useEffect(() => {
    if (initialMessage && !initialMessageSent.current) {
      setMessages([{ role: 'assistant', content: initialMessage }]);
      initialMessageSent.current = true;
    }
  }, [initialMessage]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const newMessages: CoreMessage[] = [...messages, { role: 'user', content: inputValue }];
    setMessages(newMessages);
    setInputValue('');
    setLoading(true);

    try {
      // Show thinking indicator
      setMessages(prev => [...prev, { role: 'assistant', content: '...' }]);

      const assistantResponse = await getChatbotResponse(newMessages);
      
      setMessages(prev => {
          const updatedMessages = [...prev];
          updatedMessages[updatedMessages.length - 1] = { role: 'assistant', content: assistantResponse };
          return updatedMessages;
      });

    } catch (error) {
        console.error("Error with chatbot:", error);
        const errorMessage = "Sorry, I encountered an error. Please try again.";
        setMessages(prev => {
             const updatedMessages = [...prev];
             if (updatedMessages[updatedMessages.length - 1].role === 'assistant') {
                updatedMessages[updatedMessages.length - 1].content = errorMessage;
             } else {
                updatedMessages.push({ role: 'assistant', content: errorMessage });
             }
             return updatedMessages;
        });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animated-border-box animate-fade-in-up">
      <Card className="h-full overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-primary via-emerald-500 to-teal-400 text-primary-foreground p-4 animate-gradient-pan">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary-foreground/20 border-2 border-primary-foreground/30">
                        <Bot className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold">Ask HARITRAKSHAK</CardTitle>
                        <CardDescription className="text-primary-foreground/80">
                          Your AI assistant for any plant-related questions.
                        </CardDescription>
                    </div>
                </div>
                <Sparkles className="h-8 w-8 text-primary-foreground/50" />
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col h-[550px]">
            <ScrollArea className="flex-grow p-4 bg-muted/30" ref={scrollAreaRef as any}>
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div key={index} className={cn("flex items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-500", msg.role === 'user' ? 'justify-end' : '')}>
                    {msg.role === 'assistant' && (
                      <Avatar className="h-8 w-8 border">
                        <AvatarFallback className="bg-primary/20"><Bot className="h-5 w-5 text-primary"/></AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`rounded-lg px-4 py-2 max-w-sm shadow-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                      {msg.content === '...' && loading ? (
                          <div className="flex items-center gap-2 p-1">
                              <span className="h-2 w-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                              <span className="h-2 w-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                              <span className="h-2 w-2 bg-foreground/50 rounded-full animate-bounce"></span>
                          </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <Avatar className="h-8 w-8 border">
                        <AvatarFallback className="bg-secondary"><User className="h-5 w-5"/></AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
            <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 border-t">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about plant diseases, care tips, etc."
                disabled={loading}
                className="h-11"
              />
              <Button type="submit" disabled={loading} size="icon" className="h-11 w-11 shrink-0">
                <Send className="h-5 w-5"/>
                <span className="sr-only">Send Message</span>
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    