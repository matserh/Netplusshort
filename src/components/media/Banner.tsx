'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Info, Star, Volume2, VolumeX } from 'lucide-react';
import { Media, getBackdropUrl, getMediaTitle, getMediaYear } from '@/types/media';

interface BannerProps {
  items: Media[];
  onItemClick: (media: Media) => void;
}

export function Banner({ items, onItemClick }: BannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const current = items[currentIndex];
  const totalItems = items.length;

  const goToNext = useCallback(() => {
    if (isTransitioning || totalItems === 0) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % totalItems);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [isTransitioning, totalItems]);

  const goToPrev = useCallback(() => {
    if (isTransitioning || totalItems === 0) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [isTransitioning, totalItems]);

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 600);
  };

  useEffect(() => {
    if (!isAutoPlaying || totalItems === 0) return;
    const interval = setInterval(goToNext, 7000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, goToNext, totalItems]);

  if (!current || totalItems === 0) {
    return <div className="w-full h-[60vh] md:h-[70vh] bg-card" />;
  }

  const backdropUrl = getBackdropUrl(current.backdrop_path, 'large');
  const title = getMediaTitle(current);
  const year = getMediaYear(current);
  const rating = current.vote_average?.toFixed(1) || 'N/A';
  const isMovie = current.media_type === 'movie' || !!current.title;
  const overview = current.overview || 'Aucune description disponible.';

  return (
    <section 
      className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden">
        {backdropUrl && (
          <Image
            src={backdropUrl}
            alt={title}
            fill
            priority
            sizes="100vw"
            className={`object-cover object-top transition-all duration-700 ease-out ${
              isTransitioning ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
            }`}
          />
        )}
        
        {/* Cinematic Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
        
        {/* Bottom fade for sections */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-end">
        <div className="w-full pb-16 px-6 sm:px-10 lg:px-16">
          <div className="max-w-2xl">
            {/* Meta Tags */}
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-primary text-black font-bold text-xs px-3 py-1">
                {isMovie ? 'FILM' : 'SÉRIE'}
              </Badge>
              
              <div className="flex items-center gap-1.5 text-sm">
                <Star className="w-4 h-4 fill-primary text-primary" />
                <span className="font-semibold text-foreground">{rating}</span>
              </div>
              
              {year && (
                <span className="text-sm text-foreground/60">{year}</span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground mb-4 leading-tight tracking-tight">
              {title}
            </h1>

            {/* Overview */}
            <p className="text-base text-foreground/70 mb-8 line-clamp-2 md:line-clamp-3 max-w-xl leading-relaxed">
              {overview}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button 
                size="lg"
                onClick={() => onItemClick(current)}
                className="h-12 px-8 bg-primary hover:bg-primary/90 text-black font-bold text-base gap-2 hover:scale-105 transition-transform"
              >
                <Play className="w-5 h-5 fill-current" />
                Regarder
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                onClick={() => onItemClick(current)}
                className="h-12 px-6 bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm font-medium gap-2"
              >
                <Info className="w-5 h-5" />
                Plus d'infos
              </Button>
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="absolute bottom-6 right-6 sm:right-10 lg:right-16 flex items-center gap-2">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'w-10 h-2 bg-primary' 
                    : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
