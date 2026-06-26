'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Play, Star } from 'lucide-react';
import { Media, getPosterUrl, getMediaTitle, getMediaYear } from '@/types/media';

interface MediaCardProps {
  media: Media;
  onClick: () => void;
}

export function MediaCard({ media, onClick }: MediaCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const title = getMediaTitle(media);
  const year = getMediaYear(media);
  const posterUrl = getPosterUrl(media.poster_path, 'medium');
  const isMovie = media.media_type === 'movie' || !!media.title;
  const rating = media.vote_average?.toFixed(1) || 'N/A';

  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Poster Container */}
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-card">
        {/* Loading Skeleton */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-card to-muted animate-pulse" />
        )}
        
        {/* Poster Image */}
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className={`object-cover transition-all duration-500 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } ${isHovered ? 'scale-110' : 'scale-100'}`}
            onLoad={() => setIsLoaded(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-card flex items-center justify-center">
            <Play className="w-10 h-10 text-muted-foreground/20" />
          </div>
        )}

        {/* Bottom Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

        {/* Hover Overlay with Play Button */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-all duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className={`p-4 rounded-full bg-primary shadow-2xl transition-all duration-300 ${
            isHovered ? 'scale-100' : 'scale-75'
          }`}>
            <Play className="w-6 h-6 text-black fill-black" />
          </div>
        </div>

        {/* Top Badge - Media Type */}
        <div className="absolute top-2 left-2">
          <Badge className="text-[10px] font-bold bg-black/70 text-white border-0 backdrop-blur-sm">
            {isMovie ? 'FILM' : 'SÉRIE'}
          </Badge>
        </div>

        {/* Bottom Right - Rating */}
        <div className="absolute bottom-2 right-2">
          <Badge className="text-[10px] font-bold bg-black/80 text-white border-0 gap-1 backdrop-blur-sm">
            <Star className="w-3 h-3 fill-primary text-primary" />
            {rating}
          </Badge>
        </div>

        {/* Bottom Left - Title (on hover) */}
        <div className={`absolute bottom-2 left-2 right-12 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
        }`}>
          <p className="text-xs font-semibold text-white line-clamp-2 drop-shadow-lg">
            {title}
          </p>
          {year && (
            <p className="text-[10px] text-white/70 mt-0.5">{year}</p>
          )}
        </div>

        {/* Gold Accent Line on Hover */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-primary transition-all duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`} />
      </div>

      {/* Mobile Info - Always visible below card */}
      <div className="mt-2 lg:hidden">
        <p className="text-sm font-medium text-foreground line-clamp-1">{title}</p>
        <div className="flex items-center justify-between mt-0.5">
          {year && <span className="text-xs text-muted-foreground">{year}</span>}
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Star className="w-3 h-3 fill-primary text-primary" />
            {rating}
          </span>
        </div>
      </div>
    </div>
  );
}
