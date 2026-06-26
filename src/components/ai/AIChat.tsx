'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import {
  X,
  Film,
  Tv,
  Search,
} from 'lucide-react';
import { Media } from '@/types/media';
import { getPosterUrl } from '@/types/media';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendations?: Recommendation[];
  timestamp: Date;
  askSummary?: boolean;
}

interface Recommendation {
  id: number;
  title: string;
  type: 'movie' | 'tv';
  rating: number;
  year: number;
  reason: string;
  poster_path?: string;
  media?: Media;
}

interface AIChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMediaSelect: (media: Media) => void;
}

// Mood buttons for quick access
const MOOD_BUTTONS = [
  { icon: '🎬', label: 'Action', query: 'un film d\'action explosif' },
  { icon: '😱', label: 'Horreur', query: 'un film d\'horreur qui fait peur' },
  { icon: '😂', label: 'Comédie', query: 'une comédie hilarante' },
  { icon: '💕', label: 'Romance', query: 'une belle histoire d\'amour' },
  { icon: '🚀', label: 'Sci-Fi', query: 'un film de science-fiction' },
  { icon: '🎭', label: 'Drame', query: 'un drame émouvant' },
];

// Typing animation component
function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 ml-1">
      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </span>
  );
}

// Animated text reveal
function AnimatedText({ text, isTyping }: { text: string; isTyping: boolean }) {
  const [displayText, setDisplayText] = useState('');
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!isTyping) {
      setDisplayText(text);
      setComplete(true);
      return;
    }

    setDisplayText('');
    setComplete(false);
    let i = 0;

    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        setComplete(true);
        clearInterval(timer);
      }
    }, 15);

    return () => clearInterval(timer);
  }, [text, isTyping]);

  return (
    <span>
      {displayText}
      {!complete && isTyping && (
        <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse" />
      )}
    </span>
  );
}

// Recommendation card with cinematic hover effect
function ContentCard({
  item,
  index,
  onClick
}: {
  item: Recommendation;
  index: number;
  onClick: () => void;
}) {
  const cardRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current,
        { opacity: 0, y: 30, scale: 0.9, rotateY: -10 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateY: 0,
          duration: 0.5,
          delay: index * 0.12,
          ease: 'back.out(1.4)'
        }
      );
    }
  }, [index]);

  return (
    <button
      ref={cardRef}
      onClick={onClick}
      className="group relative aspect-[2/3] rounded-lg overflow-hidden opacity-0"
      style={{
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      {item.poster_path ? (
        <Image
          src={getPosterUrl(item.poster_path, 'medium') || ''}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
          {item.type === 'movie' ? (
            <Film className="w-10 h-10 text-zinc-600" />
          ) : (
            <Tv className="w-10 h-10 text-zinc-600" />
          )}
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

      {/* Type indicator */}
      <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
        style={{
          background: item.type === 'movie'
            ? 'linear-gradient(135deg, #e5a00d 0%, #c78c00 100%)'
            : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'black'
        }}
      >
        {item.type === 'movie' ? 'Film' : 'Série'}
      </div>

      {/* Rating */}
      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-bold text-primary flex items-center gap-0.5">
        <span>★</span>
        <span>{item.rating.toFixed(1)}</span>
      </div>

      {/* Title & Year */}
      <div className="absolute bottom-0 left-0 right-0 p-2">
        <p className="text-xs font-semibold text-white truncate">{item.title}</p>
        <p className="text-[10px] text-white/50">{item.year}</p>
      </div>

      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 30px rgba(229, 160, 13, 0.2)' }}
      />
    </button>
  );
}

export function AIChat({ open, onOpenChange, onMediaSelect }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (open && messages.length === 0) {
      const saved = sessionStorage.getItem('netplus-ai-chat');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setMessages(parsed.map((m: Message) => ({ ...m, timestamp: new Date(m.timestamp) })));
        } catch {
          setWelcomeMessage();
        }
      } else {
        setWelcomeMessage();
      }
    }
  }, [open]);

  const setWelcomeMessage = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "Salut ! Je suis ton guide cinéphile. Dis-moi ce que tu as envie de regarder, et je trouve le contenu parfait pour toi.",
      timestamp: new Date()
    }]);
  };

  // Save to session storage
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('netplus-ai-chat', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // GSAP entrance animation
  useEffect(() => {
    if (open && containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, scale: 0.95, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power3.out' }
      );
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  // Prevent fullscreen exit when opening AI
  useEffect(() => {
    if (open) {
      // Store fullscreen state
      const wasFullscreen = !!document.fullscreenElement;

      // Exit fullscreen temporarily when AI opens (to avoid conflicts)
      if (wasFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }, [open]);

  // Send message to API with conversation memory
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Include conversation history for memory (last 10 messages)
      const conversationHistory = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: conversationHistory
        })
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || "J'ai trouvé quelques contenus pour toi !",
        recommendations: data.recommendations || [],
        timestamp: new Date(),
        askSummary: data.askSummary
      };

      setTypingMessageId(assistantMessage.id);
      setMessages(prev => [...prev, assistantMessage]);

      // Clear typing after delay
      setTimeout(() => setTypingMessageId(null), 1500);

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Oups, petite erreur technique. Tu peux répéter ?",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages]);

  // Handle media selection
  const handleMediaClick = useCallback((rec: Recommendation) => {
    if (rec.media) {
      onMediaSelect(rec.media);
      onOpenChange(false);
    }
  }, [onMediaSelect, onOpenChange]);

  // Clear chat
  const clearChat = useCallback(() => {
    sessionStorage.removeItem('netplus-ai-chat');
    setWelcomeMessage();
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(10px)' }}
      onClick={(e) => {
        // Only close if clicking the backdrop, not the content
        if (e.target === e.currentTarget) {
          onOpenChange(false);
        }
      }}
    >
      <div
        ref={containerRef}
        className="w-full max-w-lg h-[85vh] max-h-[700px] flex flex-col overflow-hidden rounded-2xl"
        style={{
          background: 'linear-gradient(180deg, #141414 0%, #0a0a0a 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.6), 0 0 1px rgba(229, 160, 13, 0.3)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            {/* N Logo in circle */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: 'transparent',
                border: '1.5px solid rgba(240, 193, 75, 0.5)',
              }}
            >
              <svg
                viewBox="0 0 24 32"
                className="w-3.5 h-4.5"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 2C4 10 6 18 5 26M5 26L19 2M19 2C20 10 18 18 19 26"
                  stroke="url(#headerGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="headerGradient" x1="5" y1="2" x2="19" y2="26">
                    <stop stopColor="#f0c14b" />
                    <stop offset="1" stopColor="#c78c00" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Netplus</h2>
              <p className="text-[10px] text-white/40">Guide cinéphile</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className="text-[11px] text-white/40 hover:text-white transition-colors px-2 py-1"
            >
              Effacer
            </button>
            <button
              onClick={() => onOpenChange(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[92%] ${msg.role === 'user'
                    ? 'bg-primary text-black rounded-2xl rounded-br-md'
                    : 'bg-white/5 border border-white/5 rounded-2xl rounded-bl-md'
                  } px-4 py-3`}
              >
                <p className="text-sm leading-relaxed">
                  {msg.role === 'assistant' ? (
                    <AnimatedText
                      text={msg.content}
                      isTyping={msg.id === typingMessageId}
                    />
                  ) : (
                    msg.content
                  )}
                </p>

                {/* Recommendations grid */}
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      {msg.recommendations.slice(0, 6).map((rec, i) => (
                        <ContentCard
                          key={rec.id}
                          item={rec}
                          index={i}
                          onClick={() => handleMediaClick(rec)}
                        />
                      ))}
                    </div>

                    {/* Summary prompt */}
                    {msg.askSummary && (
                      <button
                        onClick={() => sendMessage(`Résume-moi "${msg.recommendations![0].title}" sans spoilers`)}
                        className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1 mt-2"
                      >
                        <Search className="w-3 h-3" />
                        Veux-tu que je te résume ?
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/5 rounded-2xl rounded-bl-md px-4 py-3">
                <p className="text-sm text-white/60 flex items-center">
                  Je cherche<TypingDots />
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick mood buttons - show at start */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2">
              {MOOD_BUTTONS.map((mood) => (
                <button
                  key={mood.label}
                  onClick={() => sendMessage(mood.query)}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all hover:scale-105 disabled:opacity-50"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <span>{mood.icon}</span>
                  <span className="text-white/70">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-4 pb-4 pt-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
              // Arrow keys do nothing - just continue typing
            }}
            placeholder="Décris ce que tu veux regarder... (Entrée pour envoyer)"
            disabled={isLoading}
            className="w-full h-11 px-4 rounded-xl text-sm text-white placeholder:text-white/30 outline-none transition-all"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(229, 160, 13, 0.4)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            }}
          />
        </div>
      </div>
    </div>
  );
}
