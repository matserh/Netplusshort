'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Share2, Play, Music2 } from 'lucide-react';
import { TMDB_API_KEY } from '@/lib/embed';
import { useAuth } from '@/contexts/AuthContext';
import { CommentsSheet } from '@/components/shorts/CommentsSheet';

interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  backdrop_path: string | null;
  poster_path: string | null;
  vote_average: number;
  media_type: 'movie' | 'tv';
  release_date?: string;
  first_air_date?: string;
}

function VideoCard({ item, isActive, index, onComment }: {
  item: MediaItem;
  isActive: boolean;
  index: number;
  onComment: () => void;
}) {
  const router = useRouter();
  const { user, toggleFavorite, favorites } = useAuth();
  const [loaded, setLoaded] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);

  const title = item.title || item.name || '';
  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
  const imgUrl = item.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`
    : item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : null;

  const handleLike = () => {
    setLiked(!liked);
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 400);
  };

  const isSaved = favorites.includes(item.id);

  return (
    <div className="relative w-full h-screen snap-start bg-black flex-shrink-0 overflow-hidden">
      {/* Background */}
      {imgUrl && (
        <img src={imgUrl} alt={title}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          style={{ animation: loaded ? 'scaleIn 0.6s ease-out' : 'none' }} />
      )}
      {!loaded && <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black animate-pulse" />}

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center">
              <span className="text-xs font-black text-black">N</span>
            </div>
            <span className="text-white font-bold text-sm tracking-wide">NETPLUS</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-1 rounded-full bg-white/10 text-white/80">
              {item.media_type === 'movie' ? 'Film' : 'Série'}
            </span>
            <span className="text-[10px] text-amber-400 font-semibold">★ {item.vote_average?.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Play Button */}
      <button onClick={() => router.push(`/short/${item.media_type}/${item.id}`)}
        className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-110">
          <Play className="w-8 h-8 text-white ml-1" />
        </div>
      </button>

      {/* Right Actions */}
      <div className="absolute right-3 bottom-32 z-20 flex flex-col items-center gap-5">
        {/* Like */}
        <button onClick={handleLike} className="flex flex-col items-center gap-1 relative">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
            liked ? 'bg-red-500 text-white scale-110' : 'bg-white/10 text-white'
          }`}>
            <Heart className={`w-6 h-6 transition-all duration-200 ${liked ? 'fill-white scale-110' : ''}`} />
          </div>
          {likeAnim && !liked && (
            <div className="absolute -top-2 -right-1 text-[10px] font-bold text-red-400 animate-floatUp">
              +1
            </div>
          )}
          <span className={`text-[9px] ${liked ? 'text-red-400' : 'text-white/60'}`}>
            {liked ? 'Aimé' : "J'aime"}
          </span>
        </button>

        {/* Comments */}
        <button onClick={onComment} className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-[9px] text-white/60">Commenter</span>
        </button>

        {/* Share */}
        <button onClick={() => navigator.share?.({ title }).catch(() => {})}
          className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-[9px] text-white/60">Partager</span>
        </button>

        {/* Save */}
        <button onClick={() => toggleFavorite(item.id)}
          className="flex flex-col items-center gap-1">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
            isSaved ? 'bg-primary text-black' : 'bg-white/10 text-white'
          }`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
          </div>
          <span className={`text-[9px] ${isSaved ? 'text-primary' : 'text-white/60'}`}>
            {isSaved ? 'Sauvé' : 'Sauver'}
          </span>
        </button>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-24 left-4 right-20 z-20">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-white font-bold text-sm">{title}</span>
          {year && <span className="text-white/40 text-xs">{year}</span>}
        </div>
        <button onClick={() => setShowInfo(!showInfo)} className="text-left">
          <p className={`text-xs text-white/60 leading-relaxed ${showInfo ? '' : 'line-clamp-2'}`}>
            {item.overview || 'Aucune description.'}
          </p>
          <span className="text-[10px] text-white/40 mt-1">{showInfo ? 'Moins' : 'Plus...'}</span>
        </button>
        <div className="flex items-center gap-2 mt-3 text-white/40 text-xs">
          <Music2 className="w-3 h-3" />
          <span>Netplus Original</span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const [commentTarget, setCommentTarget] = useState<{ id: number; title: string } | null>(null);

  const fetchItems = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const [trending, movies, tv] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/trending/all/week?api_key=${TMDB_API_KEY}&language=fr-FR&page=${page}`).then(r => r.json()),
        fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=fr-FR&page=${page}`).then(r => r.json()),
        fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_API_KEY}&language=fr-FR&page=${page}`).then(r => r.json()),
      ]);

      const combined: MediaItem[] = [];
      const trendingResults = (trending.results || []).filter((m: any) => m.backdrop_path || m.poster_path);
      const movieResults = (movies.results || []).filter((m: any) => m.backdrop_path || m.poster_path);
      const tvResults = (tv.results || []).filter((m: any) => m.backdrop_path || m.poster_path);

      const maxLen = Math.max(trendingResults.length, movieResults.length, tvResults.length);
      for (let i = 0; i < maxLen; i++) {
        if (i < trendingResults.length) combined.push({ ...trendingResults[i], media_type: trendingResults[i].media_type || (trendingResults[i].title ? 'movie' as const : 'tv' as const) });
        if (i < movieResults.length) combined.push({ ...movieResults[i], media_type: 'movie' as const });
        if (i < tvResults.length) combined.push({ ...tvResults[i], media_type: 'tv' as const });
      }

      setItems(prev => [...prev, ...combined]);
      setHasMore(page < 50);
      setPage(p => p + 1);
    } catch (e) { console.error(e); }

    setLoading(false);
    loadingRef.current = false;
  }, [page, hasMore]);

  useEffect(() => { fetchItems(); }, []);

  // Infinite scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.getAttribute('data-index') || '0');
            if (idx >= items.length - 3 && !loading) fetchItems();
          }
        });
      },
      { threshold: 0.5 }
    );

    const children = container.querySelectorAll('[data-index]');
    children.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [items, loading, fetchItems]);

  return (
    <div className="h-screen bg-black overflow-hidden">
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
        @keyframes scaleIn {
          0% { transform: scale(1.1); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div ref={containerRef} className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide" style={{ scrollSnapType: 'y mandatory' }}>
        {items.map((item, index) => (
          <div key={`${item.id}-${index}`} data-index={index}>
            <VideoCard
              item={item}
              isActive={true}
              index={index}
              onComment={() => setCommentTarget({ id: item.id, title: item.title || item.name || '' })}
            />
          </div>
        ))}

        {loading && (
          <div className="h-screen snap-start bg-black flex items-center justify-center flex-shrink-0">
            <div className="text-center">
              <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/40 text-sm">Chargement...</p>
            </div>
          </div>
        )}
      </div>

      {/* Comments Sheet - rendered OUTSIDE the scroll container at page level */}
      {commentTarget && (
        <CommentsSheet
          visible={true}
          onClose={() => setCommentTarget(null)}
          mediaTitle={commentTarget.title}
          mediaId={commentTarget.id}
        />
      )}
    </div>
  );
}
