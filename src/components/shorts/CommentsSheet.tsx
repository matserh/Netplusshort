'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Send, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface CommentsSheetProps {
  visible: boolean;
  onClose: () => void;
  mediaTitle: string;
  mediaId: number;
}

export function CommentsSheet({ visible, onClose, mediaTitle, mediaId }: CommentsSheetProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [comments, setComments] = useState<{ user: string; text: string; time: string }[]>([]);
  const [newComment, setNewComment] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (visible && user && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [visible, user]);

  const sendComment = () => {
    if (!newComment.trim() || !user) return;
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    setComments(prev => [{ user: user.username, text: newComment.trim(), time }, ...prev]);
    setNewComment('');
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[999] flex flex-col" style={{ isolation: 'isolate' }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative mt-auto bg-zinc-900 rounded-t-2xl flex flex-col max-h-[80vh] animate-slideUp shadow-2xl border-t border-white/10"
        onClick={e => e.stopPropagation()}>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold text-sm">
              {comments.length > 0 ? `${comments.length} commentaire${comments.length > 1 ? 's' : ''}` : 'Commentaires'}
            </h3>
            <span className="text-[10px] text-white/30 max-w-[150px] truncate">{mediaTitle}</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-[150px] max-h-[55vh]">
          {comments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-14 h-14 rounded-full bg-white/[0.03] flex items-center justify-center mb-3 border border-white/5">
                <svg className="w-7 h-7 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-white/40 text-sm font-medium">Aucun commentaire</p>
              <p className="text-white/20 text-xs mt-1">Soyez le premier à réagir</p>
            </div>
          )}
          {comments.map((c, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-primary/20">
                <span className="text-xs font-black text-black">{c.user[0].toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white text-sm font-semibold">{c.user}</p>
                  <span className="text-[10px] text-white/30">{c.time}</span>
                </div>
                <p className="text-white/80 text-sm mt-0.5 leading-relaxed">{c.text}</p>
              </div>
              <button className="flex-shrink-0 self-start mt-2">
                <Heart className="w-4 h-4 text-white/20 hover:text-red-400 transition" />
              </button>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-white/10 p-3 pb-6">
          {user ? (
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center flex-shrink-0">
                <span className="text-[9px] font-black text-black">{user.username[0].toUpperCase()}</span>
              </div>
              <input ref={inputRef} type="text" value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendComment()}
                placeholder="Ajouter un commentaire..."
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30 py-1" />
              <button onClick={sendComment} disabled={!newComment.trim()}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                  newComment.trim() ? 'bg-primary text-black scale-100' : 'bg-white/5 text-white/20 scale-90'
                }`}>
                <Send className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={() => { onClose(); router.push('/login'); }}
              className="w-full py-3 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 active:bg-white/30 transition flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Connecte-toi pour commenter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
