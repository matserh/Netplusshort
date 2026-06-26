# Netplusshort

Plateforme de streaming de films et séries. Découvrez, ajoutez à votre bibliothèque, likez et commentez.

## Tech

- **Next.js 16** + React 19 + TypeScript
- **Tailwind CSS 4** + shadcn/ui
- **Prisma** (SQLite)
- **Capacitor** (Android)
- **TMDB API** pour les données films/séries

## Installation

```bash
# Installer les dépendances
bun install

# Configurer les variables d'environnement
cp .env.example .env
# Remplir NEXT_PUBLIC_TMDB_API_KEY avec votre clé TMDB

# Initialiser la base de données
bun run db:push

# Lancer en développement
bun run dev
```

## Scripts

| Commande | Description |
|----------|-------------|
| `bun run dev` | Serveur de développement (port 3000) |
| `bun run build` | Build de production |
| `bun run start` | Lancer en production |
| `bun run db:push` | Synchroniser la base de données |
| `bun run db:migrate` | Migrer la base de données |

## Structure

```
src/
├── app/          # Pages (Next.js App Router)
├── components/   # Composants UI et métier
├── contexts/     # Contextes React (auth, thème, langue)
├── hooks/        # Hooks personnalisés
├── lib/          # Utilitaires et API clients
└── types/        # Types TypeScript
```

## Licence

projets Public (Opensource)
