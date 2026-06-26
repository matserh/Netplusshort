'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Genre } from '@/types/media';
import { HamburgerMenu } from '@/components/ui/HamburgerMenu';
import { AIButton } from '@/components/ui/AIButton';

interface NavbarProps {
  genres: Genre[];
  onSearch: (query: string) => void;
  onGenreSelect: (genreId: string, genreName: string) => void;
  onAIClick: () => void;
}

export function Navbar({ genres, onSearch, onGenreSelect, onAIClick }: NavbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg' 
          : 'bg-gradient-to-b from-black/60 to-transparent'
      }`}>
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/">
            <Logo />
          </Link>

          <div className="flex items-center gap-2">
            <AIButton onClick={onAIClick} />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="h-10 w-10 rounded-full hover:bg-white/10"
            >
              {isSearchOpen ? <X className="w-5 h-5 text-foreground" /> : <Search className="w-5 h-5 text-foreground" />}
            </Button>

            <HamburgerMenu genres={genres} onGenreSelect={onGenreSelect} onAIClick={onAIClick} />
          </div>
        </div>

        {isSearchOpen && (
          <div className="border-t border-border/50 px-4 py-3 bg-background/95 backdrop-blur-xl">
            <div className="flex gap-2 max-w-xl mx-auto">
              <Input
                type="text"
                placeholder="Rechercher un film, une série..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                autoFocus
                className="h-11 bg-muted border-0 focus-visible:ring-primary"
              />
              <Button onClick={handleSearch} className="h-11 px-6 bg-primary text-black hover:bg-primary/90">
                OK
              </Button>
            </div>
          </div>
        )}
      </nav>

      <div className="h-16" />
    </>
  );
}
