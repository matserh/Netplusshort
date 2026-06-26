'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) router.push('/profile');
  }, [user, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Remplis tous les champs');
      return;
    }

    if (isSignup) {
      if (!email.trim()) { setError('Email requis'); return; }
      if (signup(username, email, password)) {
        router.push('/');
      } else {
        setError('Ce nom d\'utilisateur existe déjà');
      }
    } else {
      if (login(username, password)) {
        router.push('/');
      } else {
        setError('Identifiants incorrects');
      }
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-black text-black">N</span>
          </div>
          <h1 className="text-white text-2xl font-bold">{isSignup ? 'Créer un compte' : 'Connexion'}</h1>
          <p className="text-white/40 text-sm mt-1">Netplus</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input type="text" placeholder="Nom d'utilisateur" value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full h-12 px-4 bg-white/10 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-white/30" />
          </div>

          {isSignup && (
            <div>
              <input type="email" placeholder="Email" value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-12 px-4 bg-white/10 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-white/30" />
            </div>
          )}

          <div>
            <input type="password" placeholder="Mot de passe" value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full h-12 px-4 bg-white/10 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-white/30" />
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button type="submit"
            className="w-full h-12 rounded-xl bg-primary text-black font-bold text-sm hover:bg-primary/90 transition">
            {isSignup ? 'Créer mon compte' : 'Se connecter'}
          </button>
        </form>

        <div className="text-center mt-6">
          <button onClick={() => { setIsSignup(!isSignup); setError(''); }}
            className="text-white/40 text-sm hover:text-white transition">
            {isSignup ? 'Déjà un compte ? Connecte-toi' : 'Pas de compte ? Inscris-toi'}
          </button>
        </div>

        <button onClick={() => router.push('/')} className="w-full mt-4 text-center text-white/30 text-xs hover:text-white/50 transition">
          Continuer sans compte
        </button>
      </div>
    </div>
  );
}
