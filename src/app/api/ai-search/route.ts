import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

const TMDB_API_KEY = process.env.TMDB_API_KEY || 'demo';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

interface Media {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
  popularity?: number;
}

interface ConversationMemory {
  lastTopic?: string;
  lastResults?: Media[];
  preferences?: string[];
}

// Search TMDB
async function searchTMDB(query: string, type: 'movie' | 'tv' | 'multi' = 'multi'): Promise<Media[]> {
  try {
    const endpoint = type === 'multi' 
      ? `/search/multi?query=${encodeURIComponent(query)}&language=fr-FR`
      : `/search/${type}?query=${encodeURIComponent(query)}&language=fr-FR`;
    
    const response = await fetch(`${TMDB_BASE_URL}${endpoint}&api_key=${TMDB_API_KEY}`);
    const data = await response.json();
    
    return (data.results || [])
      .filter((item: Media) => 
        (item.media_type === 'movie' || item.media_type === 'tv' || type !== 'multi') && 
        item.poster_path
      )
      .slice(0, 6);
  } catch (error) {
    console.error('TMDB search error:', error);
    return [];
  }
}

// Get popular content
async function getPopular(type: 'movie' | 'tv' = 'movie'): Promise<Media[]> {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/${type}/popular?language=fr-FR&api_key=${TMDB_API_KEY}`);
    const data = await response.json();
    return (data.results || []).slice(0, 6);
  } catch (error) {
    console.error('Get popular error:', error);
    return [];
  }
}

// Get top rated
async function getTopRated(type: 'movie' | 'tv' = 'movie'): Promise<Media[]> {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/${type}/top_rated?language=fr-FR&api_key=${TMDB_API_KEY}`);
    const data = await response.json();
    return (data.results || []).slice(0, 6);
  } catch (error) {
    console.error('Get top rated error:', error);
    return [];
  }
}

// Get by genre
async function getByGenre(genreId: number, type: 'movie' | 'tv' = 'movie'): Promise<Media[]> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/${type}?with_genres=${genreId}&sort_by=popularity.desc&language=fr-FR&api_key=${TMDB_API_KEY}`
    );
    const data = await response.json();
    return (data.results || []).slice(0, 6);
  } catch (error) {
    console.error('Get by genre error:', error);
    return [];
  }
}

// Genre mapping
const genreMap: Record<string, number> = {
  'action': 28, 'comedie': 35, 'comédie': 35, 'drame': 18, 'horreur': 27,
  'thriller': 53, 'romance': 10749, 'romantique': 10749, 'sf': 878, 'science-fiction': 878,
  'fantastique': 14, 'animation': 16, 'famille': 10751, 'documentaire': 99,
  'guerre': 10752, 'western': 37, 'musique': 10402, 'aventure': 12,
  'crime': 80, 'mystere': 9648, 'mystère': 9648
};

export async function POST(request: NextRequest) {
  try {
    const { message, memory } = await request.json();
    
    const zai = await ZAI.create();
    
    // Analyze the message and determine intent
    const systemPrompt = `Tu es Maître Netplus, un assistant cinématographique expert et passionné. Tu aides les utilisateurs à découvrir des films et séries.
    
Règles:
- Réponds de manière naturelle et conversationnelle
- Si l'utilisateur cherche quelque chose de spécifique, réponds avec un JSON: {"action": "search", "query": "terme de recherche", "type": "movie|tv|multi"}
- Si l'utilisateur demande des populaires/top, réponds: {"action": "popular", "type": "movie|tv"}
- Si l'utilisateur demande des mieux notés, réponds: {"action": "top_rated", "type": "movie|tv"}
- Si l'utilisateur mentionne un genre, réponds: {"action": "genre", "genre": "nom du genre", "type": "movie|tv"}
- Sinon, réponds normalement en texte simple

Contexte précédent: ${memory?.lastTopic || 'Nouvelle conversation'}
${memory?.preferences?.length ? `Préferences détectées: ${memory.preferences.join(', ')}` : ''}`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const aiResponse = completion.choices[0]?.message?.content || "Je ne comprends pas votre demande.";
    
    let results: Media[] = [];
    let responseText = aiResponse;
    let topic = message;
    let preferences = memory?.preferences || [];

    // Check if AI wants to search
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        if (parsed.action === 'search') {
          results = await searchTMDB(parsed.query, parsed.type || 'multi');
          responseText = `Voici ce que j'ai trouvé pour "${parsed.query}" :`;
          topic = parsed.query;
        } else if (parsed.action === 'popular') {
          results = await getPopular(parsed.type || 'movie');
          responseText = `Voici les ${parsed.type === 'tv' ? 'séries' : 'films'} les plus populaires du moment :`;
          topic = `populaire ${parsed.type}`;
        } else if (parsed.action === 'top_rated') {
          results = await getTopRated(parsed.type || 'movie');
          responseText = `Voici les ${parsed.type === 'tv' ? 'séries' : 'films'} les mieux notés :`;
          topic = `top rated ${parsed.type}`;
        } else if (parsed.action === 'genre' && genreMap[parsed.genre.toLowerCase()]) {
          const genreId = genreMap[parsed.genre.toLowerCase()];
          results = await getByGenre(genreId, parsed.type || 'movie');
          responseText = `Voici les meilleurs ${parsed.type === 'tv' ? 'séries' : 'films'} ${parsed.genre} :`;
          topic = parsed.genre;
          if (!preferences.includes(parsed.genre)) {
            preferences.push(parsed.genre);
          }
        }
      }
    } catch (parseError) {
      // Not a JSON response, use as plain text
    }

    return NextResponse.json({
      response: responseText,
      results: results.map(m => ({
        ...m,
        media_type: m.media_type || (m.title ? 'movie' : 'tv')
      })),
      topic,
      preferences
    });

  } catch (error) {
    console.error('AI Search Error:', error);
    return NextResponse.json({
      response: "Je suis désolé, une erreur s'est produite. Pouvez-vous reformuler votre demande ?",
      results: [],
      topic: null,
      preferences: []
    });
  }
}
