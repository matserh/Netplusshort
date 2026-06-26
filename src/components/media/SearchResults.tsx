'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { Media, getPosterUrl, getMediaTitle, getMediaYear } from '@/types/media';
import { Star, Film, Tv, X, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface SearchResultsProps {
  title: string;
  results: Media[];
  isLoading: boolean;
  hasMore: boolean;
  onItemClick: (media: Media) => void;
  onClear: () => void;
  loaderRef: React.RefObject<HTMLDivElement>;
}

export function SearchResults({
  title,
  results,
  isLoading,
  hasMore,
  onItemClick,
  onClear,
  loaderRef,
}: SearchResultsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Animate results when they change
  useEffect(() => {
    if (containerRef.current && results.length > 0) {
      const items = containerRef.current.querySelectorAll('.search-item');
      gsap.fromTo(items,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [results]);

  return (
    <div className="relative z-10 min-h-screen">
      {/* Header */}
      <div className="sticky top-14 z-20 bg-black/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClear}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Retour</span>
            </button>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
          </div>
          <Badge variant="secondary" className="bg-white/10 text-white border-0">
            {results.length} résultat{results.length > 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Results Grid - Vertical Layout */}
      <div ref={containerRef} className="max-w-7xl mx-auto px-4 md:px-12 py-6">
        {results.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Film className="w-16 h-16 text-white/20 mb-4" />
            <p className="text-white/40 text-lg">Aucun résultat trouvé</p>
            <p className="text-white/30 text-sm mt-2">Essayez avec d&apos;autres mots-clés</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {results.map((item, index) => (
              <SearchResultCard
                key={`${item.id}-${index}`}
                media={item}
                onClick={() => onItemClick(item)}
              />
            ))}
          </div>
        )}

        {/* Loading more indicator */}
        <div ref={loaderRef} className="py-12">
          {isLoading && (
            <div className="flex justify-center">
              <div className="flex items-center gap-3 text-white/40">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <span className="text-sm">Chargement...</span>
              </div>
            </div>
          )}
          {!hasMore && results.length > 0 && !isLoading && (
            <div className="flex justify-center">
              <p className="text-white/30 text-sm">Fin des résultats</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchResultCard({ media, onClick }: { media: Media; onClick: () => void }) {
  const posterUrl = getPosterUrl(media.poster_path, 'medium');
  const title = getMediaTitle(media);
  const year = getMediaYear(media);
  const rating = media.vote_average?.toFixed(1);
  const isMovie = media.media_type === 'movie' || !!media.title;

  return (
    <div
      className="search-item group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-white/5 mb-2">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {isMovie ? (
              <Film className="w-10 h-10 text-white/20" />
            ) : (
              <Tv className="w-10 h-10 text-white/20" />
            )}
          </div>
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <Badge className={`h-5 px-2 text-[10px] font-bold border-0 ${
            isMovie ? 'bg-primary text-black' : 'bg-blue-500 text-white'
          }`}>
            {isMovie ? 'FILM' : 'SÉRIE'}
          </Badge>
        </div>

        {/* Rating */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 rounded-full px-1.5 py-0.5">
          <Star className="w-3 h-3 fill-primary text-primary" />
          <span className="text-[10px] font-semibold text-white">{rating}</span>
        </div>
      </div>

      {/* Info */}
      <div className="px-1">
        <h3 className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-xs text-white/50">{year || 'N/A'}</p>
      </div>
    </div>
  );
}
