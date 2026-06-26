'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Smartphone, Monitor, ChevronRight } from 'lucide-react';

export default function DownloadPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white font-bold text-base">Télécharger Netplus</h1>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-4">
        {/* Web App PWA */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center">
              <Monitor className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm">Application Web (PWA)</h2>
              <p className="text-white/40 text-xs">Installe directement depuis le navigateur</p>
            </div>
          </div>
          <p className="text-white/50 text-xs leading-relaxed mb-4">
            Netplus est disponible comme application web progressive. 
            Ajoute-la à ton écran d'accueil depuis les options de ton navigateur.
          </p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-white">1</span>
              </div>
              <p className="text-white/60 text-xs">Ouvre <span className="text-primary font-semibold">https://betanetplus.anyclaw.store</span></p>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-white">2</span>
              </div>
              <p className="text-white/60 text-xs">Appuie sur <span className="text-white font-semibold">Partager</span> → <span className="text-white font-semibold">Ajouter à l'écran d'accueil</span></p>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-white">3</span>
              </div>
              <p className="text-white/60 text-xs">C'est tout ! Utilise Netplus comme une app native</p>
            </div>
          </div>
          <a href="https://betanetplus.anyclaw.store" target="_blank" rel="noopener noreferrer"
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-black font-semibold text-sm hover:bg-primary/90 transition">
            <Smartphone className="w-4 h-4" />
            Ouvrir l'app web
          </a>
        </div>

        {/* APK */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm">Version Android (APK)</h2>
              <p className="text-white/40 text-xs">Application native pour Android</p>
            </div>
          </div>
          <p className="text-white/50 text-xs leading-relaxed mb-4">
            La version APK sera disponible prochainement. 
            En attendant, utilise la version PWA qui fonctionne exactement comme une app native.
          </p>
          <button disabled
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 text-white/30 text-sm cursor-not-allowed">
            <Download className="w-4 h-4" />
            APK bientôt disponible
          </button>
        </div>

        {/* Code Source */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Download className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm">Code source</h2>
              <p className="text-white/40 text-xs">Pour construire toi-même</p>
            </div>
          </div>
          <a href="/NetPlus-Source.zip" download
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition">
            <Download className="w-4 h-4" />
            Télécharger le code source
          </a>
        </div>
      </div>
    </div>
  );
}
