'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

export function Footer() {
  const pathname = usePathname();

  // Hide footer on TikTok-style pages
  if (pathname === '/' || pathname.startsWith('/search') || pathname.startsWith('/profile') || pathname.startsWith('/favorites') || pathname.startsWith('/login') || pathname.startsWith('/short/') || pathname.startsWith('/watch/')) {
    return null;
  }

  return (
    <footer className="border-t border-border/50 bg-sidebar/50">
      <div className="px-6 sm:px-10 lg:px-16 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col gap-3">
            <Logo size="sm" />
            <p className="text-xs text-muted-foreground max-w-xs">
              Votre destination premium pour les films et séries en streaming.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
            <Link href="/" className="hover:text-primary transition-colors">Films</Link>
            <Link href="/" className="hover:text-primary transition-colors">Séries</Link>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Conditions</Link>
              <Link href="/" className="hover:text-foreground transition-colors">Confidentialité</Link>
              <Link href="/" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
            <p className="text-[11px] text-muted-foreground/60">© 2026 Netplus. Tous droits réservés.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
