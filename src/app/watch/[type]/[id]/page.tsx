
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { VIDEO_SERVERS, TMDB_API_KEY, type ServerKey } from '@/lib/embed';

interface MediaDetails {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  backdrop_path: string;
  poster_path: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  number_of_seasons?: number;
  seasons?: { id: number; season_number: number; episode_count: number; name: string }[];
  genres: { id: number; name: string }[];
}

function WatchContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const type = params.type as 'movie' | 'tv';
  const id = parseInt(params.id as string);
  const urlSeason = searchParams.get('s') ? parseInt(searchParams.get('s')!) : 1;
  const urlEpisode = searchParams.get('e') ? parseInt(searchParams.get('e')!) : 1;

  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [server, setServer] = useState<ServerKey>('autoembed');
  const [season, setSeason] = useState(urlSeason);
  const [episode, setEpisode] = useState(urlEpisode);
  const [showServers, setShowServers] = useState(false);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [iframeError, setIframeError] = useState(false);

  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/${type}/${id}?api_key=${TMDB_API_KEY}&language=fr-FR`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setDetails(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [type, id]);

  useEffect(() => {
    if (type === 'tv') {
      const url = new URL(window.location.href);
      url.searchParams.set('s', String(season));
      url.searchParams.set('e', String(episode));
      window.history.replaceState({}, '', url);
    }
  }, [season, episode, type]);

  const getVideoUrl = () => {
    const s = VIDEO_SERVERS[server];
    return type === 'movie' ? s.movie(id) : s.tv(id, season, episode);
  };

  const servers = Object.entries(VIDEO_SERVERS) as [ServerKey, typeof VIDEO_SERVERS[ServerKey]][];
  const title = details?.title || details?.name || '';
  const year = details?.release_date?.slice(0, 4) || details?.first_air_date?.slice(0, 4) || '';
  const rating = details?.vote_average?.toFixed(1) || '';
  const runtime = details?.runtime;
  const seasons = details?.seasons?.filter(s => s.season_number > 0) || [];
  const currentSeasonData = seasons.find(s => s.season_number === season);
  const episodeCount = currentSeasonData?.episode_count || 12;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Logo size="sm" />
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary text-black font-bold">
              {type === 'movie' ? 'FILM' : 'SÉRIE'}
            </Badge>
            <button onClick={() => router.push(`/short/${type}/${id}?s=${season}&e=${episode}`)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-semibold hover:bg-primary/30 transition">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="4"/><path d="M10 8l6 4-6 4z"/>
              </svg>
              Short
            </button>
          </div>
        </div>
      </header>

      {/* Video Player */}
      <div className="pt-14">
        <div className="relative w-full aspect-video bg-black">
          {iframeError ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-white/40 text-sm mb-4">Le serveur ne répond pas</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {servers.filter(([k]) => k !== server).map(([key, s]) => (
                    <button key={key} onClick={() => { setServer(key); setIframeError(false); setIframeKey(k => k + 1); }}
                      className="px-3 py-2 rounded-lg bg-white/10 text-white text-xs hover:bg-white/20 transition">
                      Essayer {s.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <iframe
                key={iframeKey}
                src={getVideoUrl()}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; fullscreen; encrypted-media"
                allowFullScreen
                onError={() => setIframeError(true)}
              />
              <button onClick={() => setIframeKey(k => k + 1)}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition">
                <RefreshCw className="w-4 h-4 text-white" />
              </button>
            </>
          )}
        </div>

        {/* Info Panel */}
        <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-4">
          {/* Title & Rating */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h1>
              {year && <p className="text-sm text-muted-foreground">{year}</p>}
            </div>
            <div className="flex items-center gap-3">
              {rating && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10">
                  <span className="text-amber-400">★</span>
                  <span className="text-sm font-semibold text-foreground">{rating}/10</span>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={() => window.open(getVideoUrl(), '_blank')}
                className="text-xs">
                Ouvrir dans un nouvel onglet
              </Button>
            </div>
          </div>

          {/* Server Selection */}
          <button onClick={() => setShowServers(!showServers)}
            className="w-full flex items-center justify-between p-3 bg-card rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
            <span className="font-medium text-sm">Serveur: <span className="text-primary">{VIDEO_SERVERS[server].name}</span></span>
            {showServers ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
          {showServers && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {servers.map(([key, s]) => (
                <Button key={key} variant={server === key ? 'default' : 'outline'}
                  onClick={() => { setServer(key as ServerKey); setShowServers(false); setIframeError(false); setIframeKey(k => k + 1); }}
                  className={server === key ? 'bg-primary text-black font-semibold' : ''}>
                  {s.name}
                </Button>
              ))}
            </div>
          )}

          {/* TV Season/Episode */}
          {type === 'tv' && (
            <>
              <button onClick={() => setShowEpisodes(!showEpisodes)}
                className="w-full flex items-center justify-between p-3 bg-card rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
                <span className="font-medium text-sm">Épisodes - Saison {season}</span>
                {showEpisodes ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              {showEpisodes && (
                <div className="space-y-3">
                  {seasons.length > 0 && (
                    <Select value={String(season)} onValueChange={v => { setSeason(parseInt(v)); setEpisode(1); setIframeKey(k => k + 1); }}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {seasons.map(s => (
                          <SelectItem key={s.season_number} value={String(s.season_number)}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5 max-h-48 overflow-y-auto p-2 bg-card rounded-lg border border-border/50">
                    {Array.from({ length: episodeCount }, (_, i) => (
                      <Button key={i + 1} variant={episode === i + 1 ? 'default' : 'outline'} size="sm"
                        onClick={() => { setEpisode(i + 1); setIframeKey(k => k + 1); }}
                        className={episode === i + 1 ? 'bg-primary text-black font-bold text-xs' : 'text-xs'}>
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Details */}
          {details && (
            <div className="pt-2 space-y-3">
              <div className="flex flex-wrap gap-2">
                {details.genres?.map(g => (
                  <Badge key={g.id} variant="secondary" className="text-xs">{g.name}</Badge>
                ))}
              </div>
              {runtime && (
                <p className="text-sm text-muted-foreground">
                  Durée: {Math.floor(runtime / 60)}h {runtime % 60}min
                </p>
              )}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {details.overview || 'Aucune description disponible.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <WatchContent />
    </Suspense>
  );
}
