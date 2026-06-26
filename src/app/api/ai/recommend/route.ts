import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { API_CONFIG, Media } from '@/types/media';

interface Recommendation {
  id: number;
  title: string;
  type: 'movie' | 'tv';
  rating: number;
  year: number;
  reason: string;
  poster_path?: string;
  media?: Media;
}

// Genre mapping for mood-based searches
const GENRE_MAP: Record<string, { movie: number[]; tv: number[] }> = {
  action: { movie: [28], tv: [10759] },
  horreur: { movie: [27, 53], tv: [27] },
  peur: { movie: [27, 53], tv: [27] },
  comedie: { movie: [35], tv: [35] },
  rire: { movie: [35], tv: [35] },
  drame: { movie: [18], tv: [18] },
  romance: { movie: [10749], tv: [10766] },
  amour: { movie: [10749], tv: [10766] },
  scifi: { movie: [878], tv: [10765] },
  science: { movie: [878], tv: [10765] },
  fantastique: { movie: [14], tv: [10765] },
  thriller: { movie: [53], tv: [] },
  mystere: { movie: [9648], tv: [9648] },
  animation: { movie: [16], tv: [16] },
  anime: { movie: [16], tv: [16] },
  aventure: { movie: [12], tv: [10759] },
  documentaire: { movie: [99], tv: [99] },
  crime: { movie: [80], tv: [80] },
  guerre: { movie: [10752], tv: [10768] },
  western: { movie: [37], tv: [] },
  famille: { movie: [10751], tv: [10762] },
  musique: { movie: [10402], tv: [] },
};

// Keywords that indicate specific content type
const CONTENT_TYPE_KEYWORDS = {
  movie: ['film', 'movie', 'cinéma', 'cinema', 'long métrage'],
  tv: ['série', 'serie', 'series', 'tv', 'télé', 'tele', 'show', 'épisode', 'episode', 'saison']
};

// System prompt for the AI
const SYSTEM_PROMPT = `Tu es un assistant expert en cinéma et séries TV. Tu dois analyser la demande de l'utilisateur et extraire les informations pour rechercher du contenu.

Réponds UNIQUEMENT avec un objet JSON valide (pas de markdown, pas de code blocks):
{
  "searchQuery": "terme de recherche en anglais si l'utilisateur mentionne un titre spécifique, sinon vide",
  "genres": ["liste des genres en français détectés"],
  "contentType": "movie" ou "tv" ou "both",
  "mood": "l'humeur détectée",
  "response": "ta réponse amicale et enthousiaste en français (2-3 phrases max)"
}

Exemples:
- "Je veux voir un film d'horreur" → genres: ["horreur"], contentType: "movie"
- "Montre-moi une série de science-fiction" → genres: ["scifi"], contentType: "tv"
- "Un film d'action avec Tom Cruise" → searchQuery: "Tom Cruise", genres: ["action"], contentType: "movie"
- "Je suis triste, console-moi" → genres: ["drame", "romance"], contentType: "both", mood: "triste"
- "Un anime japonais" → genres: ["anime"], contentType: "tv"
- "Naruto" → searchQuery: "Naruto", contentType: "tv"`;

// Search TMDB by query
async function searchByQuery(query: string, contentType: 'movie' | 'tv' | 'both'): Promise<Recommendation[]> {
  const results: Recommendation[] = [];
  const types = contentType === 'both' ? ['movie', 'tv'] : [contentType];

  for (const type of types) {
    try {
      const url = `${API_CONFIG.tmdb.baseUrl}/search/${type}?api_key=${API_CONFIG.tmdb.apiKey}&language=${API_CONFIG.language}&query=${encodeURIComponent(query)}&page=1`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        const items = (data.results || []).slice(0, 4).map((item: Media) => ({
          id: item.id,
          title: item.title || item.name || 'Titre inconnu',
          type: type as 'movie' | 'tv',
          rating: item.vote_average || 0,
          year: new Date(item.release_date || item.first_air_date || '2020').getFullYear(),
          reason: type === 'movie' ? 'Film' : 'Série',
          poster_path: item.poster_path,
          media: { ...item, media_type: type }
        }));
        results.push(...items);
      }
    } catch (error) {
      console.error(`Search error for ${type}:`, error);
    }
  }

  return results.slice(0, 6);
}

// Discover by genres
async function discoverByGenres(genres: number[], contentType: 'movie' | 'tv' | 'both'): Promise<Recommendation[]> {
  const results: Recommendation[] = [];
  const types = contentType === 'both' ? ['movie', 'tv'] : [contentType];

  for (const type of types) {
    try {
      const params = new URLSearchParams({
        api_key: API_CONFIG.tmdb.apiKey,
        language: API_CONFIG.language,
        sort_by: 'popularity.desc',
        page: '1',
        with_genres: genres.slice(0, 2).join(',')
      });

      const url = `${API_CONFIG.tmdb.baseUrl}/discover/${type}?${params.toString()}`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        const items = (data.results || []).slice(0, 4).map((item: Media) => ({
          id: item.id,
          title: item.title || item.name || 'Titre inconnu',
          type: type as 'movie' | 'tv',
          rating: item.vote_average || 0,
          year: new Date(item.release_date || item.first_air_date || '2020').getFullYear(),
          reason: getReasonForType(type),
          poster_path: item.poster_path,
          media: { ...item, media_type: type }
        }));
        results.push(...items);
      }
    } catch (error) {
      console.error(`Discover error for ${type}:`, error);
    }
  }

  return results.slice(0, 6);
}

// Get trending content
async function getTrending(): Promise<Recommendation[]> {
  try {
    const url = `${API_CONFIG.tmdb.baseUrl}/trending/all/week?api_key=${API_CONFIG.tmdb.apiKey}&language=${API_CONFIG.language}`;
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      return (data.results || [])
        .filter((item: Media) => item.media_type === 'movie' || item.media_type === 'tv')
        .slice(0, 6)
        .map((item: Media) => ({
          id: item.id,
          title: item.title || item.name || 'Titre inconnu',
          type: item.media_type as 'movie' | 'tv',
          rating: item.vote_average || 0,
          year: new Date(item.release_date || item.first_air_date || '2020').getFullYear(),
          reason: 'Tendance cette semaine',
          poster_path: item.poster_path,
          media: item
        }));
    }
  } catch (error) {
    console.error('Trending error:', error);
  }
  return [];
}

function getReasonForType(type: string): string {
  return type === 'movie' ? 'Film recommandé' : 'Série recommandée';
}

// Detect content type from message
function detectContentType(message: string): 'movie' | 'tv' | 'both' {
  const lower = message.toLowerCase();
  if (CONTENT_TYPE_KEYWORDS.movie.some(kw => lower.includes(kw))) return 'movie';
  if (CONTENT_TYPE_KEYWORDS.tv.some(kw => lower.includes(kw))) return 'tv';
  return 'both';
}

// Detect genres from message
function detectGenres(message: string): string[] {
  const lower = message.toLowerCase();
  const detected: string[] = [];

  for (const genre of Object.keys(GENRE_MAP)) {
    if (lower.includes(genre)) {
      detected.push(genre);
    }
  }

  return detected;
}

// Extract potential title from message
function extractTitle(message: string): string | null {
  // Look for quoted text
  const quoted = message.match(/["""«»]([^"""«»]+)["""«»]/);
  if (quoted) return quoted[1].trim();

  // Look for "un film/une série X" pattern
  const patterns = [
    /(?:je veux voir|cherche|montre[- ]moi|trouve|regarder?)\s+(?:un[e]?\s+)?(?:film|série|saison|épisode)?\s+(?:de\s+)?([^\n.,!?]+)/i,
    /(?:film|série|saison)\s+(.+?)(?:\s+avec|\s+de|\s+$)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const title = match[1].trim();
      if (title.length > 2 && title.length < 100) {
        return title;
      }
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    let searchQuery = '';
    let genres: string[] = [];
    let contentType: 'movie' | 'tv' | 'both' = 'both';
    let aiResponse = "J'ai trouvé quelques contenus pour toi !";

    // Quick detection without AI for common patterns
    const detectedGenres = detectGenres(message);
    const detectedType = detectContentType(message);
    const potentialTitle = extractTitle(message);

    contentType = detectedType;
    genres = detectedGenres;

    // Build messages array with history for memory
    const messagesForAI: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Add conversation history for memory
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messagesForAI.push({
            role: msg.role,
            content: msg.content
          });
        }
      }
    }

    // Add current message
    messagesForAI.push({ role: 'user', content: message });

    // Use AI for more complex understanding
    try {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: messagesForAI,
        temperature: 0.3
      });

      const content = completion.choices[0]?.message?.content;
      if (content) {
        try {
          // Clean the response - remove markdown code blocks if present
          const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
          const parsed = JSON.parse(cleaned);

          if (parsed.searchQuery) searchQuery = parsed.searchQuery;
          if (parsed.genres?.length) genres = parsed.genres;
          if (parsed.contentType && ['movie', 'tv', 'both'].includes(parsed.contentType)) {
            contentType = parsed.contentType;
          }
          if (parsed.response) aiResponse = parsed.response;
        } catch {
          // JSON parsing failed, use detected values
          console.log('AI response was not valid JSON, using detected values');
        }
      }
    } catch (aiError) {
      console.log('AI call failed, using fallback:', aiError);
    }

    // If we found a potential title, prioritize direct search
    if (potentialTitle && !searchQuery) {
      searchQuery = potentialTitle;
    }

    let recommendations: Recommendation[] = [];

    // Search strategy
    if (searchQuery) {
      // Direct search by title
      recommendations = await searchByQuery(searchQuery, contentType);
    }

    if (recommendations.length === 0 && genres.length > 0) {
      // Search by genres
      const genreIds: number[] = [];
      for (const g of genres) {
        const mapped = GENRE_MAP[g.toLowerCase()];
        if (mapped) {
          const ids = contentType === 'tv' ? mapped.tv : contentType === 'movie' ? mapped.movie : [...mapped.movie, ...mapped.tv];
          genreIds.push(...ids);
        }
      }
      if (genreIds.length > 0) {
        recommendations = await discoverByGenres([...new Set(genreIds)], contentType);
      }
    }

    // Fallback to trending if nothing found
    if (recommendations.length === 0) {
      recommendations = await getTrending();
      if (recommendations.length > 0) {
        aiResponse = "Je n'ai pas trouvé exactement ce que tu cherches, mais voici les tendances du moment :";
      } else {
        aiResponse = "Désolé, je n'ai rien trouvé. Essaie avec d'autres termes !";
      }
    }

    return NextResponse.json({
      message: aiResponse,
      recommendations,
      askSummary: recommendations.length > 0
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      error: 'Internal error',
      message: "Oups, j'ai eu un problème. Peux-tu reformuler ?",
      recommendations: []
    }, { status: 500 });
  }
}
