'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  username: string;
  email: string;
}

interface LibraryItem {
  id: number;
  title: string;
  media_type: 'movie' | 'tv';
  poster_path: string | null;
  year: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  signup: (username: string, email: string, password: string) => boolean;
  logout: () => void;
  favorites: number[];
  toggleFavorite: (id: number) => void;
  likes: number[];
  toggleLike: (id: number) => void;
  watchlist: number[];
  toggleWatchlist: (id: number) => void;
  library: LibraryItem[];
  addToLibrary: (item: LibraryItem) => void;
  removeFromLibrary: (id: number) => void;
  isInLibrary: (id: number) => boolean;
  avatar: string | null;
  setAvatar: (url: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [likes, setLikes] = useState<number[]>([]);
  const [watchlist, setWatchlist] = useState<number[]>([]);
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [avatar, setAvatarState] = useState<string | null>(null);

  // Load all data on mount if user is logged in
  useEffect(() => {
    try {
      const saved = localStorage.getItem('netplus_user');
      if (saved) {
        const u = JSON.parse(saved);
        setUser(u);
        setFavorites(JSON.parse(localStorage.getItem('netplus_favs') || '[]'));
        setLikes(JSON.parse(localStorage.getItem('netplus_likes') || '[]'));
        setWatchlist(JSON.parse(localStorage.getItem('netplus_watchlist') || '[]'));
        setLibrary(JSON.parse(localStorage.getItem('netplus_library') || '[]'));
        const savedAvatar = localStorage.getItem(`netplus_avatar_${u.username}`);
        if (savedAvatar) setAvatarState(savedAvatar);
      }
    } catch {}
  }, []);

  // Persist data when changed
  useEffect(() => { if (user) localStorage.setItem('netplus_favs', JSON.stringify(favorites)); }, [favorites, user]);
  useEffect(() => { if (user) localStorage.setItem('netplus_likes', JSON.stringify(likes)); }, [likes, user]);
  useEffect(() => { if (user) localStorage.setItem('netplus_watchlist', JSON.stringify(watchlist)); }, [watchlist, user]);
  useEffect(() => { if (user) localStorage.setItem('netplus_library', JSON.stringify(library)); }, [library, user]);
  useEffect(() => {
    if (user && avatar !== null) {
      localStorage.setItem(`netplus_avatar_${user.username}`, avatar);
    }
  }, [avatar, user]);

  const login = (username: string, password: string) => {
    try {
      const data = localStorage.getItem('netplus_accounts');
      const accounts = data ? JSON.parse(data) : [];
      const found = accounts.find((a: any) => a.username === username && a.password === password);
      if (found) {
        const u = { username: found.username, email: found.email };
        setUser(u);
        localStorage.setItem('netplus_user', JSON.stringify(u));
        setFavorites(JSON.parse(localStorage.getItem('netplus_favs') || '[]'));
        setLikes(JSON.parse(localStorage.getItem('netplus_likes') || '[]'));
        setWatchlist(JSON.parse(localStorage.getItem('netplus_watchlist') || '[]'));
        setLibrary(JSON.parse(localStorage.getItem('netplus_library') || '[]'));
        const savedAvatar = localStorage.getItem(`netplus_avatar_${u.username}`);
        if (savedAvatar) setAvatarState(savedAvatar);
        else setAvatarState(null);
        return true;
      }
    } catch {}
    return false;
  };

  const signup = (username: string, email: string, password: string) => {
    try {
      const data = localStorage.getItem('netplus_accounts');
      const accounts = data ? JSON.parse(data) : [];
      if (accounts.find((a: any) => a.username === username)) return false;
      accounts.push({ username, email, password });
      localStorage.setItem('netplus_accounts', JSON.stringify(accounts));
      const u = { username, email };
      setUser(u);
      localStorage.setItem('netplus_user', JSON.stringify(u));
      return true;
    } catch {}
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('netplus_user');
    setFavorites([]);
    setLikes([]);
    setWatchlist([]);
    setLibrary([]);
    setAvatarState(null);
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleLike = (id: number) => {
    setLikes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleWatchlist = (id: number) => {
    setWatchlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const addToLibrary = (item: LibraryItem) => {
    setLibrary(prev => {
      if (prev.find(x => x.id === item.id)) return prev;
      return [item, ...prev];
    });
  };

  const removeFromLibrary = (id: number) => {
    setLibrary(prev => prev.filter(x => x.id !== id));
  };

  const isInLibrary = (id: number) => library.some(x => x.id === id);

  const setAvatar = (url: string) => {
    setAvatarState(url);
    if (user) localStorage.setItem(`netplus_avatar_${user.username}`, url);
  };

  return (
    <AuthContext.Provider value={{
      user, login, signup, logout,
      favorites, toggleFavorite,
      likes, toggleLike,
      watchlist, toggleWatchlist,
      library, addToLibrary, removeFromLibrary, isInLibrary,
      avatar, setAvatar,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
