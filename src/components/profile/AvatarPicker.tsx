'use client';

import { useRef } from 'react';
import { X, ImageIcon, Smile } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const FREE_CHARACTERS = [
  { name: 'Aventurier', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=NetplusA&backgroundColor=b6e3f4' },
  { name: 'Avatar', url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=NetplusB&backgroundColor=c0aede' },
  { name: 'Robot', url: 'https://api.dicebear.com/9.x/bottts/svg?seed=NetplusC&backgroundColor=ffdfbf' },
  { name: 'Smiley', url: 'https://api.dicebear.com/9.x/big-smile/svg?seed=NetplusD&backgroundColor=d1d4f9' },
  { name: 'Fantaisie', url: 'https://api.dicebear.com/9.x/lorelei/svg?seed=NetplusE&backgroundColor=ffd5dc' },
];

interface AvatarPickerProps {
  visible: boolean;
  onClose: () => void;
}

export function AvatarPicker({ visible, onClose }: AvatarPickerProps) {
  const { setAvatar } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAvatar(dataUrl);
      onClose();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCharacterSelect = (url: string) => {
    setAvatar(url);
    onClose();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[999] flex flex-col justify-end" style={{ isolation: 'isolate' }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-zinc-900 rounded-t-2xl flex flex-col animate-slideUp border-t border-white/10 pb-6"
        onClick={e => e.stopPropagation()}>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <h2 className="text-white font-semibold text-base">Photo de profil</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>

        <div className="px-5 pt-4 space-y-4">
          {/* Option 1: Gallery */}
          <button onClick={handleFileSelect}
            className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition border border-white/10">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-amber-600/30 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-white text-sm font-semibold">Choisir dans la galerie</p>
              <p className="text-white/40 text-xs mt-0.5">Importe une photo depuis ton appareil</p>
            </div>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] text-white/30 font-medium">OU</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Option 2: Characters */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Smile className="w-4 h-4 text-white/40" />
              <p className="text-white/60 text-xs font-medium">Choisir un personnage gratuit</p>
            </div>
            <div className="flex gap-3 justify-center">
              {FREE_CHARACTERS.map((char, i) => (
                <button key={i} onClick={() => handleCharacterSelect(char.url)}
                  className="group flex flex-col items-center gap-1.5">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 overflow-hidden group-hover:border-primary/50 group-hover:bg-white/10 transition-all p-1">
                    <img src={char.url} alt={char.name}
                      className="w-full h-full object-cover rounded-xl" />
                  </div>
                  <span className="text-[9px] text-white/40 group-hover:text-white/60 transition">{char.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
