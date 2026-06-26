'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Heart, Share2, ChevronUp, ChevronDown, RefreshCw, MessageCircle } from 'lucide-react';
import { VIDEO_SERVERS, TMDB_API_KEY, type ServerKey } from '@/lib/embed';
import { useAuth } from '@/contexts/AuthContext';
import { CommentsSheet } from '@/components/shorts/CommentsSheet';

interface MediaDetails {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  backdrop_path: string;
  poster_path: string;
  vote_average: number;
  genres: { id: number; name: string }[];
}

function ShortContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, toggleFavorite, favorites } = useAuth();

  const type = params.type as 'movie' | 'tv';
  const id = parseInt(params.id as string);
  const urlSeason = searchParams.get('s') ? parseInt(searchParams.get('s')!) : 1;
  const urlEpisode = searchParams.get('e') ? parseInt(searchParams.get('e')!) : 1;

  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [server, setServer] = useState<ServerKey>('autoembed');
  const [season, setSeason] = useState(urlSeason);
  const [episode, setEpisode] = useState(urlEpisode);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [iframeError, setIframeError] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/${type}/${id}?api_key=${TMDB_API_KEY}&language=fr-FR`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setDetails(d))
      .catch(() => {});
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

  const handleLike = () => {
    setLiked(!liked);
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 400);
  };

  const servers = Object.entries(VIDEO_SERVERS) as [ServerKey, typeof VIDEO_SERVERS[ServerKey]][];
  const title = details?.title || details?.name || '';
  const rating = details?.vote_average?.toFixed(1) || '';
  const isSaved = favorites.includes(id);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <style>{`
        @keyframes heartPop {
          0% { transform: scale(1); }
          25% { transform: scale(1.3); }
          50% { transform: scale(0.95); }
          100% { transform: scale(1.1); }
        }
        @keyframes floatUp {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
      `}</style>

      <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 bg-gradient-to-b from-black/80 to-transparent">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-1.5">
            {servers.map(([key, s]) => (
              <button key={key} onClick={() => { setServer(key as ServerKey); setIframeError(false); setIframeKey(k => k + 1); }}
                className={`px-2 py-1 rounded text-[10px] font-medium transition ${server === key ? 'bg-primary text-black' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full h-full flex items-center justify-center">
          {iframeError ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-white/50 text-sm mb-3">Ce serveur ne répond pas</p>
                <div className="flex gap-2 justify-center">
                  {servers.filter(([k]) => k !== server).map(([key, s]) => (
                    <button key={key} onClick={() => { setServer(key as ServerKey); setIframeError(false); setIframeKey(k => k + 1); }}
                      className="px-4 py-2 rounded-lg bg-white/10 text-white text-xs hover:bg-white/20 transition">
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <iframe key={iframeKey} src={getVideoUrl()}
              className="w-full h-full"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              onError={() => setIframeError(true)}
              style={{ background: '#000' }} />
          )}
        </div>

        <div className="absolute right-3 bottom-28 z-20 flex flex-col items-center gap-5">
          <button onClick={handleLike} className="flex flex-col items-center gap-1 relative">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
              liked ? 'bg-red-500 text-white scale-110' : 'bg-white/10 text-white'
            }`}>
              <Heart className={`w-5 h-5 transition-all duration-200 ${liked ? 'fill-white scale-110' : ''}`}
                style={{ animation: likeAnim ? 'heartPop 0.4s ease-out' : 'none' }} />
            </div>
            {likeAnim && <div className="absolute -top-2 -right-1 text-[10px] font-bold text-red-400 animate-floatUp">+1</div>}
            <span className={`text-[9px] ${liked ? 'text-red-400' : 'text-white/50'}`}>J'aime</span>
          </button>

          <button onClick={() => setShowComments(true)} className="flex flex-col items-center gap-1">
            <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-[9px] text-white/50">Commenter</span>
          </button>

          <button onClick={() => { if (user) toggleFavorite(id); }} className="flex flex-col items-center gap-1">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center ${isSaved ? 'text-amber-400' : 'text-white'} bg-white/10`}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <span className="text-[9px] text-white/50">Favori</span>
          </button>

          <button onClick={() => setIframeKey(k => k + 1)} className="flex flex-col items-center gap-1">
            <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-white" />
            </div>
            <span className="text-[9px] text-white/50">Recharger</span>
          </button>
        </div>

        {type === 'tv' && (
          <div className="absolute left-3 bottom-28 z-20 flex flex-col gap-3">
            <button onClick={() => { setEpisode(Math.max(1, episode - 1)); setIframeKey(k => k + 1); }}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
              <ChevronUp className="w-5 h-5 text-white" />
            </button>
            <button onClick={() => { setEpisode(episode + 1); setIframeKey(k => k + 1); }}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
              <ChevronDown className="w-5 h-5 text-white" />
            </button>
          </div>
        )}

        {showComments && <CommentsSheet visible={showComments} onClose={() => setShowComments(false)} mediaTitle={title} mediaId={id} />}
      </div>

      <div className="bg-zinc-900 border-t border-white/10">
        <button onClick={() => setIsInfoOpen(!isInfoOpen)} className="w-full flex items-center justify-between px-5 py-3">
          <div className="text-left">
            <h2 className="text-white font-semibold text-sm">{title}</h2>
            {type === 'tv' && <p className="text-white/40 text-xs">Saison {season} · Épisode {episode}</p>}
            {rating && <p className="text-amber-400 text-xs mt-0.5">★ {rating}/10</p>}
          </div>
          {isInfoOpen ? <ChevronDown className="w-5 h-5 text-white/30" /> : <ChevronUp className="w-5 h-5 text-white/30" />}
        </button>
        {isInfoOpen && details && (
          <div className="px-5 pb-4 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {details.genres?.map(g => (
                <span key={g.id} className="text-[10px] px-2 py-1 rounded-full bg-white/10 text-white/60">{g.name}</span>
              ))}
            </div>
            <p className="text-xs text-white/50 leading-relaxed line-clamp-4">{details.overview || 'Aucune description.'}</p>
            <button onClick={() => router.push(`/watch/${type}/${id}?s=${season}&e=${episode}`)}
              className="text-xs text-primary hover:text-amber-400 transition">
              Plein écran horizontal →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShortPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-black z-50 flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <ShortContent />
    </Suspense>
  );
}
