'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, LogOut, Bookmark, Library, Trash2, Pencil, Download, Play } from 'lucide-react';
import { AvatarPicker } from '@/components/profile/AvatarPicker';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, favorites, likes, library, removeFromLibrary, avatar } = useAuth();
  const [activeTab, setActiveTab] = useState('library');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const tabs = [
    { id: 'library', label: 'Bibliothèque', icon: Library, count: library.length },
    { id: 'favorites', label: 'Favoris', icon: Heart, count: favorites.length },
    { id: 'likes', label: 'J\'aime', icon: Heart, count: likes.length },
  ];

  const currentTab = tabs.find(t => t.id === activeTab);

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6 pb-20">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-black text-black">N</span>
          </div>
          <h1 className="text-white text-xl font-bold mb-2">Connecte-toi</h1>
          <p className="text-white/40 text-sm mb-6">Pour voir ton profil et ta bibliothèque</p>
          <button onClick={() => router.push('/login')}
            className="px-8 py-3 rounded-xl bg-primary text-black font-bold text-sm hover:bg-primary/90 transition">
            Se connecter
          </button>
          <button onClick={() => router.push('/')}
            className="block mx-auto mt-4 text-white/30 text-xs hover:text-white/50 transition">
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="relative pt-12 pb-4 px-6">
        <div className="flex flex-col items-center">
          {/* Avatar avec crayon */}
          <div className="relative mb-4 group">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary via-amber-500 to-amber-700 p-0.5">
              {avatar ? (
                <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden">
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center">
                  <span className="text-3xl font-black text-white">{user.username[0].toUpperCase()}</span>
                </div>
              )}
            </div>
            <button onClick={() => setShowAvatarPicker(true)}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 transition-transform">
              <Pencil className="w-4 h-4" />
            </button>
          </div>
          <h1 className="text-white text-xl font-bold">{user.username}</h1>
          <p className="text-white/40 text-xs mt-0.5">@{user.username}</p>
          <div className="flex items-center gap-6 mt-4">
            <div className="text-center">
              <p className="text-white font-bold text-lg">{library.length}</p>
              <p className="text-white/40 text-[10px]">Bibliothèque</p>
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-lg">{favorites.length}</p>
              <p className="text-white/40 text-[10px]">Favoris</p>
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-lg">{likes.length}</p>
              <p className="text-white/40 text-[10px]">J'aime</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <button onClick={() => router.push('/download')}
              className="px-5 py-2 rounded-full border border-white/20 text-white/60 text-xs hover:bg-white/10 hover:text-white transition flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Télécharger
            </button>
            <button onClick={handleLogout}
              className="px-5 py-2 rounded-full border border-white/20 text-white/60 text-xs hover:bg-white/10 hover:text-white transition">
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10">
        <div className="flex">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition border-b-2 ${
                activeTab === tab.id ? 'text-primary border-primary' : 'text-white/40 border-transparent'
              }`}>
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? '' : 'text-white/30'}`} />
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4">
        {activeTab === 'library' && (
          library.length === 0 ? (
            <div className="text-center py-12">
              <Library className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/50 text-sm">Ta bibliothèque est vide</p>
              <p className="text-white/30 text-xs mt-1">Ajoute des films et séries avec le bouton +</p>
              <button onClick={() => router.push('/')}
                className="mt-4 px-6 py-2 rounded-full bg-primary text-black text-xs font-semibold">
                Ajouter
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {library.map((item, i) => (
                <div key={`${item.id}-${i}`}
                  className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition group">
                  <button onClick={() => router.push(`/short/${item.media_type}/${item.id}`)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    <div className="w-14 h-20 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                      {item.poster_path ? (
                        <img src={`https://image.tmdb.org/t/p/w185${item.poster_path}`} alt={item.title}
                          className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/5">
                          <Play className="w-5 h-5 text-white/20" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/60">
                          {item.media_type === 'movie' ? 'Film' : 'Série'}
                        </span>
                        {item.year && <span className="text-[10px] text-white/40">{item.year}</span>}
                      </div>
                    </div>
                  </button>
                  <button onClick={() => removeFromLibrary(item.id)}
                    className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition flex-shrink-0 opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'favorites' && (
          favorites.length === 0 ? (
            <div className="text-center py-12">
              <Bookmark className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/50 text-sm">Aucun favori</p>
              <p className="text-white/30 text-xs mt-1">Ajoute des favoris depuis l'accueil</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-white/40 text-xs">{favorites.length} favori{favorites.length > 1 ? 's' : ''}</p>
              <button onClick={() => router.push('/')}
                className="mt-4 px-5 py-2 rounded-full bg-white/10 text-white/70 text-xs hover:bg-white/20 transition">
                Voir les contenus
              </button>
            </div>
          )
        )}

        {activeTab === 'likes' && (
          likes.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/50 text-sm">Aucun like</p>
              <p className="text-white/30 text-xs mt-1">Like des contenus depuis l'accueil</p>
            </div>
          ) : (
            <p className="text-white/40 text-xs text-center pt-8">{likes.length} like{likes.length > 1 ? 's' : ''}</p>
          )
        )}
      </div>

      {/* Avatar Picker */}
      <AvatarPicker visible={showAvatarPicker} onClose={() => setShowAvatarPicker(false)} />
    </div>
  );
}
