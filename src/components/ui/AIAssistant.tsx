'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, X, Play, Star, Calendar } from 'lucide-react';
import { Media, getPosterUrl, getMediaTitle, getMediaYear } from '@/types/media';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onMediaClick: (media: Media) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  mediaResults?: Media[];
}

interface ConversationMemory {
  lastTopic?: string;
  lastResults?: Media[];
  preferences?: string[];
}

export function AIAssistant({ isOpen, onClose, onMediaClick }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Bonjour ! Je suis Maître Netplus, votre guide cinématographique personnel. Que puis-je vous recommander aujourd'hui ? Films d'action, comédies, séries captivantes... Je suis là pour vous aider à trouver votre prochain coup de cœur !"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [memory, setMemory] = useState<ConversationMemory>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          memory: memory
        })
      });

      const data = await response.json();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        mediaResults: data.results
      }]);

      // Update memory
      setMemory(prev => ({
        ...prev,
        lastTopic: data.topic,
        lastResults: data.results,
        preferences: data.preferences || prev.preferences
      }));

    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Je suis désolé, une erreur s'est produite. Pouvez-vous reformuler votre demande ?"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMediaClick = useCallback((media: Media) => {
    onMediaClick(media);
    onClose();
  }, [onMediaClick, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg h-[80vh] max-h-[600px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 border border-primary/50">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">Maître Netplus</h2>
              <p className="text-xs text-muted-foreground">Guide cinématographique</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-primary/10 hover:text-primary"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-secondary text-foreground rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                  {/* Media Results */}
                  {msg.mediaResults && msg.mediaResults.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {msg.mediaResults.slice(0, 4).map((media) => (
                        <div
                          key={media.id}
                          className="relative group cursor-pointer rounded-lg overflow-hidden bg-background/50 border border-border hover:border-primary transition-all duration-200"
                          onClick={() => handleMediaClick(media)}
                        >
                          <div className="aspect-[2/3] relative">
                            {getPosterUrl(media.poster_path, 'medium') ? (
                              <Image
                                src={getPosterUrl(media.poster_path, 'medium')!}
                                alt={getMediaTitle(media)}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-muted">
                                <Play className="w-8 h-8 text-muted-foreground/30" />
                              </div>
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                              <div className="flex items-center gap-1">
                                <Play className="w-4 h-4 text-primary fill-primary" />
                                <span className="text-xs text-white">Voir</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-2">
                            <p className="text-xs font-medium line-clamp-1">{getMediaTitle(media)}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 text-primary fill-primary" />
                              <span className="text-[10px] text-muted-foreground">
                                {media.vote_average?.toFixed(1)}
                              </span>
                              {getMediaYear(media) && (
                                <>
                                  <span className="text-[10px] text-muted-foreground">•</span>
                                  <span className="text-[10px] text-muted-foreground">{getMediaYear(media)}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-secondary rounded-2xl rounded-bl-sm p-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-sm text-muted-foreground">Je recherche...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Demandez-moi un film, une série..."
              className="flex-1 bg-secondary/50 border-border focus:border-primary"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
