'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Play, TrendingUp, Flame, Film, Tv, Star } from 'lucide-react';
import { TMDB_API_KEY } from '@/lib/embed';

interface Result {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  media_type: string;
  release_date?: string;
  first_air_date?: string;
}

const categories = [
  { id: 'all', label: 'Tout', icon: Flame },
  { id: 'movie', label: 'Films', icon: Film },
  { id: 'tv', label: 'Séries', icon: Tv },
];

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [trending, setTrending] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('all');
  const [showClear, setShowClear] = useState(false);

  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/trending/all/week?api_key=${TMDB_API_KEY}&language=fr-FR`)
      .then(r => r.json())
      .then(d => setTrending(d.results?.filter((m: any) => m.poster_path).slice(0, 20) || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setShowClear(false); return; }
    setShowClear(true);
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const endpoint = category === 'all'
          ? `search/multi?api_key=${TMDB_API_KEY}&language=fr-FR&query=${encodeURIComponent(query)}`
          : `search/${category}?api_key=${TMDB_API_KEY}&language=fr-FR&query=${encodeURIComponent(query)}`;
        const res = await fetch(`https://api.themoviedb.org/3/${endpoint}`);
        const data = await res.json();
        let items = data.results?.filter((m: any) => m.poster_path) || [];
        if (category === 'all') items = items.filter((m: any) => m.media_type !== 'person');
        setResults(items.slice(0, 40));
      } catch {}
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, category]);

  const getTitle = (m: Result) => m.title || m.name || '';
  const getYear = (m: Result) => (m.release_date || m.first_air_date || '').slice(0, 4);

  const filteredTrending = category === 'all'
    ? trending
    : trending.filter(m => m.media_type === category);

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Search Header */}
      <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm border-b border-white/5">
        <div className="px-4 pt-3 pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Rechercher..."
                autoFocus
                className="w-full h-11 pl-11 pr-10 bg-white/10 rounded-2xl text-white text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-white/25 transition-all" />
              {showClear && (
                <button onClick={() => { setQuery(''); setResults([]); setShowClear(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition">
                  <X className="w-3 h-3 text-white/60" />
                </button>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
            {categories.map(cat => {
              const Icon = cat.icon;
              const isActive = category === cat.id;
              return (
                <button key={cat.id} onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-primary text-black shadow-lg shadow-primary/25'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}>
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : ''}`} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        {query ? (
          /* Search Results */
          loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                <Search className="w-7 h-7 text-white/20" />
              </div>
              <p className="text-white/40 text-sm">Aucun résultat pour</p>
              <p className="text-white/60 text-sm font-medium">"{query}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5">
              {results.map((item, i) => (
                <button key={`${item.id}-${i}`}
                  onClick={() => router.push(`/short/${item.media_type}/${item.id}`)}
                  className="group relative text-left">
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5 shadow-lg shadow-black/30">
                    {item.poster_path ? (
                      <img src={`https://image.tmdb.org/t/p/w342${item.poster_path}`} alt={getTitle(item)}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                        <Play className="w-8 h-8 text-white/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <Play className="w-5 h-5 text-white mb-1" />
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-black/80 text-white/90 font-medium backdrop-blur-sm">
                        {item.media_type === 'movie' ? 'Film' : 'Série'}
                      </span>
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <span className="flex items-center gap-0.5 text-[9px] bg-black/80 text-amber-400 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />{item.vote_average?.toFixed(1)}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent" />
                  </div>
                  <p className="text-xs text-white/80 mt-1.5 font-medium line-clamp-1">{getTitle(item)}</p>
                  {getYear(item) && <p className="text-[10px] text-white/40">{getYear(item)}</p>}
                </button>
              ))}
            </div>
          )
        ) : (
          /* Trending Explore */
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-white font-bold text-base">Tendances</h2>
              </div>
              <span className="text-[10px] text-white/30">{trending.length} titres</span>
            </div>

            {filteredTrending.length > 0 ? (
              <div className="grid grid-cols-3 gap-2.5">
                {filteredTrending.map((item, i) => (
                  <button key={`${item.id}-${i}`}
                    onClick={() => router.push(`/short/${item.media_type || (item.title ? 'movie' : 'tv')}/${item.id}`)}
                    className="group relative text-left">
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5 shadow-lg shadow-black/30">
                      {item.poster_path && (
                        <img src={`https://image.tmdb.org/t/p/w342${item.poster_path}`} alt={getTitle(item)}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <Play className="w-5 h-5 text-white mb-1" />
                      </div>
                      <div className="absolute top-2 left-2">
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-black/80 text-white/90 font-medium backdrop-blur-sm">
                          {item.media_type === 'movie' ? 'Film' : item.media_type === 'tv' ? 'Série' : 'Film'}
                        </span>
                      </div>
                      <div className="absolute bottom-2 right-2">
                        <span className="flex items-center gap-0.5 text-[9px] bg-black/80 text-amber-400 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                          <Star className="w-2.5 h-2.5 fill-amber-400" />{item.vote_average?.toFixed(1)}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent" />
                    </div>
                    <p className="text-xs text-white/80 mt-1.5 font-medium line-clamp-1">{getTitle(item)}</p>
                    {getYear(item) && <p className="text-[10px] text-white/40">{getYear(item)}</p>}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-white/30 text-sm">Aucune tendance pour cette catégorie</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
