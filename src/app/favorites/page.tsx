'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Play, Heart, Star, Bookmark } from 'lucide-react';
import { TMDB_API_KEY } from '@/lib/embed';

interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  vote_average: number;
  media_type?: string;
}

export default function FavoritesPage() {
  const router = useRouter();
  const { user, favorites } = useAuth();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    // Charger les infos des favoris depuis TMDB (simulation avec des populaires)
    fetch(`https://api.themoviedb.org/3/trending/all/week?api_key=${TMDB_API_KEY}&language=fr-FR`)
      .then(r => r.json())
      .then(d => {
        const filtered = (d.results || []).filter((m: any) => favorites.includes(m.id));
        setItems(filtered.slice(0, 30));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, favorites]);

  const getTitle = (m: MediaItem) => m.title || m.name || '';
  const getType = (m: MediaItem) => m.media_type === 'movie' ? 'Film' : 'Série';

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6 pb-20">
        <div className="text-center">
          <Heart className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <h1 className="text-white text-lg font-bold mb-1">Connecte-toi</h1>
          <p className="text-white/40 text-sm mb-4">Pour voir tes favoris</p>
          <button onClick={() => router.push('/login')}
            className="px-6 py-2 rounded-full bg-primary text-black text-xs font-semibold">
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-xl border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-primary fill-primary" />
          <h1 className="text-white text-xl font-bold">Mes Favoris</h1>
        </div>
        <p className="text-white/40 text-xs mt-1">{favorites.length} titre{favorites.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-60 text-center px-6">
          <Bookmark className="w-12 h-12 text-white/20 mb-3" />
          <p className="text-white/50 text-sm">Aucun favori pour le moment</p>
          <p className="text-white/30 text-xs mt-1">Clique sur ❤️ sur un contenu pour l'ajouter</p>
          <button onClick={() => router.push('/')}
            className="mt-4 px-6 py-2 rounded-full bg-primary text-black text-xs font-semibold">
            Découvrir
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-4">
          {items.map((item, i) => (
            <button key={`${item.id}-${i}`}
              onClick={() => router.push(`/short/${item.media_type}/${item.id}`)}
              className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5">
              {item.poster_path && (
                <img src={`https://image.tmdb.org/t/p/w342${item.poster_path}`} alt={getTitle(item)}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
                <Play className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition" />
              </div>
              <div className="absolute top-2 left-2">
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/70 text-white/90 font-semibold">{getType(item)}</span>
              </div>
              <div className="absolute bottom-1 left-1">
                <div className="flex items-center gap-0.5 text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded-full">
                  <Star className="w-2 h-2 fill-amber-400 text-amber-400" />
                  {item.vote_average?.toFixed(1)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
