'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { Media, getPosterUrl, getMediaTitle } from '@/types/media';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MediaSectionProps {
  title: string;
  items: Media[];
  onItemClick: (media: Media) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function MediaSection({ 
  title, 
  items, 
  onItemClick,
  onLoadMore,
  hasMore = true
}: MediaSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkArrows = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 100);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkArrows);
      checkArrows();
      return () => el.removeEventListener('scroll', checkArrows);
    }
  }, [items]);

  // Infinite horizontal scroll detection
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !onLoadMore || !hasMore) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      // Load more when 80% scrolled
      if (scrollLeft + clientWidth >= scrollWidth * 0.8) {
        onLoadMore();
      }
    };

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [onLoadMore, hasMore]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  if (items.length === 0) return null;

  return (
    <section className="py-6 md:py-8 w-full relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-6 sm:px-10 lg:px-16">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground section-title">
          {title}
        </h2>
        
        <div className="hidden sm:flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll('left')}
            className={`h-9 w-9 rounded-full hover:bg-white/10 transition-opacity ${showLeftArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll('right')}
            className={`h-9 w-9 rounded-full hover:bg-white/10 transition-opacity ${showRightArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Cards Row */}
      <div className="relative">
        {/* Left fade gradient */}
        <div className={`absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none transition-opacity ${showLeftArrow ? 'opacity-100' : 'opacity-0'}`} />
        
        {/* Right fade gradient */}
        <div className={`absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none transition-opacity ${showRightArrow ? 'opacity-100' : 'opacity-0'}`} />

        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide px-6 sm:px-10 lg:px-16 pb-2"
          style={{ overscrollBehaviorX: 'contain' }}
        >
          {items.map((item, index) => (
            <div 
              key={`${item.id}-${index}`} 
              className="flex-shrink-0 w-[140px] sm:w-[155px] md:w-[170px] lg:w-[180px] xl:w-[195px]"
            >
              <MediaCard media={item} onClick={() => onItemClick(item)} />
            </div>
          ))}
          
          {/* Loading indicator at end */}
          {hasMore && onLoadMore && (
            <div className="flex-shrink-0 w-[140px] sm:w-[155px] md:w-[170px] lg:w-[180px] flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Simple card component
function MediaCard({ media, onClick }: { media: Media; onClick: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const title = getMediaTitle(media);
  const posterUrl = getPosterUrl(media.poster_path, 'medium');

  return (
    <div
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-card">
        {!loaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={title}
            className={`w-full h-full object-cover transition-all duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} group-hover:scale-105`}
            onLoad={() => setLoaded(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-3xl">🎬</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
          <div className="p-3 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-all duration-200 scale-75 group-hover:scale-100">
            <svg className="w-5 h-5 text-black fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>

        {/* Gold border on hover */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}
