'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, Plus, Heart, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AddContentModal } from '@/components/library/AddContentModal';

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);

  if (pathname.startsWith('/short/') || pathname.startsWith('/watch/') || pathname === '/login') return null;

  const navItems = [
    { icon: Home, label: 'Accueil', path: '/' },
    { icon: Search, label: 'Recherche', path: '/search' },
    { icon: Plus, label: 'Ajouter', action: () => setShowAddModal(true), isSpecial: true },
    { icon: Heart, label: 'Favoris', path: user ? '/favorites' : '/login' },
    { icon: User, label: 'Profil', path: user ? '/profile' : '/login' },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 border-t border-white/10 backdrop-blur-xl" style={{ isolation: 'isolate' }}>
        <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            if (item.isSpecial) {
              return (
                <button key={item.label} onClick={item.action}
                  className="flex flex-col items-center justify-center -mt-4 relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center shadow-lg shadow-primary/30 active:scale-90 transition-transform">
                    <item.icon className="w-6 h-6 text-black" />
                  </div>
                  <span className="text-[8px] text-white/40 mt-0.5">{item.label}</span>
                </button>
              );
            }
            return (
              <button key={item.label} onClick={() => router.push(item.path)}
                className="flex flex-col items-center gap-0.5 py-1 px-3">
                <item.icon className={`w-6 h-6 ${isActive ? 'text-primary' : 'text-white/50'}`} />
                <span className={`text-[9px] ${isActive ? 'text-primary font-medium' : 'text-white/40'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Add Content Modal */}
      <AddContentModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
    </>
  );
}
