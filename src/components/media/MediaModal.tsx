'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Star, Clock, Film, Tv } from 'lucide-react';
import { 
  Media, 
  MovieDetails, 
  TVDetails, 
  Season,
  getBackdropUrl,
  getMediaTitle,
  getMediaYear,
  API_CONFIG 
} from '@/types/media';

interface MediaModalProps {
  media: Media | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MediaModal({ media, open, onOpenChange }: MediaModalProps) {
  const router = useRouter();
  const [details, setDetails] = useState<MovieDetails | TVDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!media || !open) {
      setDetails(null);
      return;
    }

    const fetchDetails = async () => {
      setIsLoading(true);
      const isMovie = media.media_type === 'movie' || !!media.title;
      const endpoint = isMovie ? `/movie/${media.id}` : `/tv/${media.id}`;

      try {
        const response = await fetch(
          `${API_CONFIG.tmdb.baseUrl}${endpoint}?api_key=${API_CONFIG.tmdb.apiKey}&language=${API_CONFIG.language}`
        );
        if (response.ok) {
          const data = await response.json();
          setDetails(data);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [media, open]);

  if (!media) return null;

  const isMovie = media.media_type === 'movie' || !!media.title;
  const title = details ? getMediaTitle(details) : getMediaTitle(media);
  const year = details ? getMediaYear(details as Media) : getMediaYear(media);
  const backdropUrl = getBackdropUrl(details?.backdrop_path || media.backdrop_path, 'large');
  const rating = (details?.vote_average || media.vote_average)?.toFixed(1) || 'N/A';
  const genres = details?.genres || [];
  const overview = details?.overview || media.overview || 'Aucune description disponible.';

  const runtime = (details as MovieDetails)?.runtime;
  const formattedRuntime = runtime ? `${Math.floor(runtime / 60)}h ${runtime % 60}min` : null;
  const numberOfSeasons = (details as TVDetails)?.number_of_seasons;

  const handleWatch = () => {
    const mediaType = isMovie ? 'movie' : 'tv';
    router.push(`/watch/${mediaType}/${media.id}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] p-0 overflow-hidden bg-card border-border/50">
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* Backdrop Header */}
        <div className="relative h-48 sm:h-56">
          {backdropUrl && <Image src={backdropUrl} alt={title} fill className="object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
        </div>

        {/* Content */}
        <ScrollArea className="max-h-[calc(90vh-14rem)]">
          <div className="p-5 space-y-4">
            {/* Title & Meta */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="h-6 px-2.5 text-[10px] font-bold bg-primary text-black">
                  {isMovie ? 'FILM' : 'SÉRIE'}
                </Badge>
                <div className="flex items-center gap-1.5 text-sm">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  <span className="font-semibold">{rating}</span>
                </div>
                {year && <span className="text-sm text-muted-foreground">{year}</span>}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{title}</h2>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {formattedRuntime && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" />
                  {formattedRuntime}
                </span>
              )}
              {numberOfSeasons && (
                <span className="flex items-center gap-1.5">
                  <Tv className="w-4 h-4 text-primary" />
                  {numberOfSeasons} saison{numberOfSeasons > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Genres */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {genres.map(g => (
                  <Badge key={g.id} variant="secondary" className="text-xs font-medium">
                    {g.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Overview */}
            <p className="text-sm text-muted-foreground leading-relaxed">{overview}</p>

            {/* Watch Button */}
            <Button 
              onClick={handleWatch} 
              className="w-full h-12 bg-primary hover:bg-primary/90 text-black font-bold text-base gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              Regarder maintenant
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
