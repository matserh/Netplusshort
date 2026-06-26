'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/ui/Logo';
import {
  Home,
  Film,
  Tv,
  TrendingUp,
  Star,
  Sparkles,
  X,
  Maximize,
  Minimize
} from 'lucide-react';
import { Genre } from '@/types/media';

interface HamburgerMenuProps {
  genres: Genre[];
  onGenreSelect: (genreId: string, genreName: string) => void;
  onAIClick: () => void;
}

export function HamburgerMenu({ genres, onGenreSelect, onAIClick }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const movieGenres = genres.filter(g =>
    [28, 12, 16, 35, 80, 99, 18, 10751, 14, 36, 27, 10402, 9648, 10749, 878, 10770, 53, 10752, 37].includes(g.id)
  );
  const tvGenres = genres.filter(g =>
    [10759, 16, 35, 80, 99, 18, 10751, 10762, 9648, 10763, 10764, 10765, 10766, 10767, 10768, 37].includes(g.id)
  );

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="icon-hover text-foreground/80 hover:text-primary hover:bg-primary/10"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </Button>
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Menu Panel */}
      <div className="absolute top-0 left-0 h-full w-[85vw] sm:w-[350px] bg-card border-r border-border shadow-2xl overflow-hidden animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <Logo size="sm" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="hover:bg-primary/10 hover:text-primary rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6" style={{ maxHeight: 'calc(100vh - 140px)' }}>
          {/* Main Navigation */}
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-primary/10 hover:text-primary" asChild>
              <Link href="/">
                <Home className="w-5 h-5" />
                Accueil
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-primary/10 hover:text-primary">
              <TrendingUp className="w-5 h-5" />
              Tendances
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-primary/10 hover:text-primary">
              <Star className="w-5 h-5" />
              Top Films
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 hover:bg-primary/10 text-primary"
              onClick={() => {
                setIsOpen(false);
                onAIClick();
              }}
            >
              <Sparkles className="w-5 h-5" />
              Assistant IA
            </Button>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Film Genres */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              <Film className="w-4 h-4 text-primary" />
              Films
            </h3>
            <div className="flex flex-wrap gap-2">
              {movieGenres.slice(0, 8).map(genre => (
                <Badge
                  key={genre.id}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors"
                  onClick={() => {
                    onGenreSelect(String(genre.id), genre.name);
                    setIsOpen(false);
                  }}
                >
                  {genre.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* TV Genres */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              <Tv className="w-4 h-4 text-primary" />
              Séries TV
            </h3>
            <div className="flex flex-wrap gap-2">
              {tvGenres.slice(0, 8).map(genre => (
                <Badge
                  key={genre.id}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors"
                  onClick={() => {
                    onGenreSelect(String(genre.id), genre.name);
                    setIsOpen(false);
                  }}
                >
                  {genre.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">© 2026 Netplus</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
