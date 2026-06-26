'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Plus, Check, Play, Star, Film, Tv } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { TMDB_API_KEY } from '@/lib/embed';

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  vote_average: number;
  media_type: string;
  release_date?: string;
  first_air_date?: string;
}

interface AddContentModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AddContentModal({ visible, onClose }: AddContentModalProps) {
  const router = useRouter();
  const { addToLibrary, removeFromLibrary, isInLibrary } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (visible && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
    if (!visible) {
      setQuery('');
      setResults([]);
    }
  }, [visible]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&language=fr-FR&query=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults((data.results || []).filter((m: any) => m.poster_path && m.media_type !== 'person').slice(0, 20));
      } catch {}
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const getTitle = (m: SearchResult) => m.title || m.name || '';
  const getYear = (m: SearchResult) => (m.release_date || m.first_air_date || '').slice(0, 4);

  const handleAdd = (item: SearchResult) => {
    if (isInLibrary(item.id)) {
      removeFromLibrary(item.id);
    } else {
      addToLibrary({
        id: item.id,
        title: getTitle(item),
        media_type: item.media_type as 'movie' | 'tv',
        poster_path: item.poster_path,
        year: getYear(item),
      });
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[999] flex flex-col" style={{ isolation: 'isolate' }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div className="relative mt-16 mx-4 mb-4 bg-zinc-900 rounded-2xl flex flex-col max-h-[85vh] overflow-hidden border border-white/10 shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-white font-bold text-base">Ajouter à ma bibliothèque</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher un film ou une série..."
              className="w-full h-11 pl-10 pr-3 bg-white/10 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-white/25" />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : query && results.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-white/30 text-sm">Aucun résultat pour "{query}"</p>
            </div>
          ) : !query ? (
            <div className="text-center py-16">
              <Search className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Cherche un film ou une série à ajouter</p>
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              {results.map((item, i) => {
                const added = isInLibrary(item.id);
                const type = item.media_type === 'movie' ? 'Film' : 'Série';
                return (
                  <div key={`${item.id}-${i}`}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition group">
                    {/* Poster */}
                    <div className="w-14 h-20 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                      {item.poster_path ? (
                        <img src={`https://image.tmdb.org/t/p/w185${item.poster_path}`} alt={getTitle(item)}
                          className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="w-5 h-5 text-white/10" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{getTitle(item)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/60">{type}</span>
                        {getYear(item) && <span className="text-[10px] text-white/40">{getYear(item)}</span>}
                        <span className="flex items-center gap-0.5 text-[10px] text-amber-400">
                          <Star className="w-2.5 h-2.5 fill-amber-400" />{item.vote_average?.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Add/Remove button */}
                    <button onClick={() => handleAdd(item)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        added
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}>
                      {added ? (
                        <><Check className="w-3.5 h-3.5" /> Ajouté</>
                      ) : (
                        <><Plus className="w-3.5 h-3.5" /> Ajouter</>
                      )}
                    </button>

                    {/* Play */}
                    <button onClick={() => { onClose(); router.push(`/short/${item.media_type}/${item.id}`); }}
                      className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition flex-shrink-0">
                      <Play className="w-4 h-4 text-white/60" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
