// Video embed servers - only verified working ones
export const VIDEO_SERVERS = {
  autoembed: { name: 'AutoEmbed', movie: (id: number) => `https://autoembed.co/movie/tmdb/${id}`, tv: (id: number, s: number, e: number) => `https://autoembed.co/tv/tmdb/${id}-${s}-${e}` },
  embed2: { name: '2Embed', movie: (id: number) => `https://www.2embed.cc/embed/${id}`, tv: (id: number, s: number, e: number) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}` },
  vidsrc: { name: 'VidSrc', movie: (id: number) => `https://vidsrc.pro/embed/movie/${id}`, tv: (id: number, s: number, e: number) => `https://vidsrc.pro/embed/tv/${id}/${s}/${e}` },
  embedsu: { name: 'EmbedSu', movie: (id: number) => `https://embed.su/embed/movie/${id}`, tv: (id: number, s: number, e: number) => `https://embed.su/embed/tv/${id}/${s}/${e}` },
};

export type ServerKey = keyof typeof VIDEO_SERVERS;

export const TMDB_API_KEY = '45a766dcce0da3d639845fd158b346e6';

export async function fetchTMDB<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}&language=fr-FR`
    );
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}
