import { API_CONFIG, Media, Genre, TMDBResponse } from '@/types/media';

const CACHE_DURATION = 60 * 5; // 5 minutes cache

// Simple in-memory cache
const cache = new Map<string, { data: unknown; timestamp: number }>();

async function fetchWithCache<T>(url: string): Promise<T | null> {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION * 1000) {
    return cached.data as T;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    cache.set(url, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

// Fetch trending content (all, movies, TV)
export async function fetchTrending(
  mediaType: 'all' | 'movie' | 'tv' = 'all',
  timeWindow: 'day' | 'week' = 'week',
  page: number = 1
): Promise<TMDBResponse<Media> | null> {
  const url = `${API_CONFIG.tmdb.baseUrl}/trending/${mediaType}/${timeWindow}?api_key=${API_CONFIG.tmdb.apiKey}&language=${API_CONFIG.language}&page=${page}`;
  return fetchWithCache<TMDBResponse<Media>>(url);
}

// Fetch popular movies or TV shows
export async function fetchPopular(
  mediaType: 'movie' | 'tv',
  page: number = 1
): Promise<TMDBResponse<Media> | null> {
  const url = `${API_CONFIG.tmdb.baseUrl}/${mediaType}/popular?api_key=${API_CONFIG.tmdb.apiKey}&language=${API_CONFIG.language}&page=${page}`;
  return fetchWithCache<TMDBResponse<Media>>(url);
}

// Fetch top rated movies or TV shows
export async function fetchTopRated(
  mediaType: 'movie' | 'tv',
  page: number = 1
): Promise<TMDBResponse<Media> | null> {
  const url = `${API_CONFIG.tmdb.baseUrl}/${mediaType}/top_rated?api_key=${API_CONFIG.tmdb.apiKey}&language=${API_CONFIG.language}&page=${page}`;
  return fetchWithCache<TMDBResponse<Media>>(url);
}

// Fetch now playing movies
export async function fetchNowPlaying(page: number = 1): Promise<TMDBResponse<Media> | null> {
  const url = `${API_CONFIG.tmdb.baseUrl}/movie/now_playing?api_key=${API_CONFIG.tmdb.apiKey}&language=${API_CONFIG.language}&page=${page}&region=FR`;
  return fetchWithCache<TMDBResponse<Media>>(url);
}

// Fetch upcoming movies
export async function fetchUpcoming(page: number = 1): Promise<TMDBResponse<Media> | null> {
  const url = `${API_CONFIG.tmdb.baseUrl}/movie/upcoming?api_key=${API_CONFIG.tmdb.apiKey}&language=${API_CONFIG.language}&page=${page}&region=FR`;
  return fetchWithCache<TMDBResponse<Media>>(url);
}

// Fetch content by genre
export async function fetchByGenre(
  mediaType: 'movie' | 'tv',
  genreId: number,
  page: number = 1
): Promise<TMDBResponse<Media> | null> {
  const url = `${API_CONFIG.tmdb.baseUrl}/discover/${mediaType}?api_key=${API_CONFIG.tmdb.apiKey}&language=${API_CONFIG.language}&with_genres=${genreId}&sort_by=popularity.desc&page=${page}`;
  return fetchWithCache<TMDBResponse<Media>>(url);
}

// Discover content with filters
export async function fetchDiscover(
  mediaType: 'movie' | 'tv',
  options: {
    page?: number;
    genre?: number;
    sortBy?: 'popularity.desc' | 'vote_average.desc' | 'release_date.desc' | 'original_title.asc';
    voteCountGte?: number;
    withOriginalLanguage?: string;
  } = {}
): Promise<TMDBResponse<Media> | null> {
  const params = new URLSearchParams({
    api_key: API_CONFIG.tmdb.apiKey,
    language: API_CONFIG.language,
    page: String(options.page || 1),
    sort_by: options.sortBy || 'popularity.desc',
  });

  if (options.genre) params.append('with_genres', String(options.genre));
  if (options.voteCountGte) params.append('vote_count.gte', String(options.voteCountGte));
  if (options.withOriginalLanguage) params.append('with_original_language', options.withOriginalLanguage);

  const url = `${API_CONFIG.tmdb.baseUrl}/discover/${mediaType}?${params.toString()}`;
  return fetchWithCache<TMDBResponse<Media>>(url);
}

// Search content
export async function searchMedia(
  query: string,
  page: number = 1
): Promise<TMDBResponse<Media> | null> {
  const url = `${API_CONFIG.tmdb.baseUrl}/search/multi?api_key=${API_CONFIG.tmdb.apiKey}&language=${API_CONFIG.language}&query=${encodeURIComponent(query)}&page=${page}`;
  return fetchWithCache<TMDBResponse<Media>>(url);
}

// Fetch genres
export async function fetchGenres(mediaType: 'movie' | 'tv'): Promise<Genre[]> {
  const url = `${API_CONFIG.tmdb.baseUrl}/genre/${mediaType}/list?api_key=${API_CONFIG.tmdb.apiKey}&language=${API_CONFIG.language}`;
  const data = await fetchWithCache<{ genres: Genre[] }>(url);
  return data?.genres || [];
}

// Fetch all genres (merged)
export async function fetchAllGenres(): Promise<Genre[]> {
  const [movieGenres, tvGenres] = await Promise.all([
    fetchGenres('movie'),
    fetchGenres('tv'),
  ]);

  const genreMap = new Map<number, Genre>();
  movieGenres.forEach(g => genreMap.set(g.id, g));
  tvGenres.forEach(g => genreMap.set(g.id, g));

  return Array.from(genreMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

// Fetch media details
export async function fetchMediaDetails(
  mediaId: number,
  mediaType: 'movie' | 'tv'
): Promise<Media | null> {
  const url = `${API_CONFIG.tmdb.baseUrl}/${mediaType}/${mediaId}?api_key=${API_CONFIG.tmdb.apiKey}&language=${API_CONFIG.language}`;
  return fetchWithCache<Media>(url);
}

// Animation genre ID (16)
export async function fetchAnimations(page: number = 1): Promise<TMDBResponse<Media> | null> {
  // Animation genre ID is 16
  const [movies, tvShows] = await Promise.all([
    fetchByGenre('movie', 16, page),
    fetchByGenre('tv', 16, page),
  ]);

  const results: Media[] = [
    ...(movies?.results || []).map(m => ({ ...m, media_type: 'movie' as const })),
    ...(tvShows?.results || []).map(t => ({ ...t, media_type: 'tv' as const })),
  ].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

  return {
    page,
    results,
    total_pages: Math.max(movies?.total_pages || 1, tvShows?.total_pages || 1),
    total_results: (movies?.total_results || 0) + (tvShows?.total_results || 0),
  };
}

// Anime genre - using animation + original language Japanese
export async function fetchAnime(page: number = 1): Promise<TMDBResponse<Media> | null> {
  const url = `${API_CONFIG.tmdb.baseUrl}/discover/tv?api_key=${API_CONFIG.tmdb.apiKey}&language=${API_CONFIG.language}&with_genres=16&with_original_language=ja&sort_by=popularity.desc&page=${page}`;
  return fetchWithCache<TMDBResponse<Media>>(url);
}

// Get movies by multiple categories
export async function fetchMultipleCategories(
  categories: string[],
  page: number = 1
): Promise<Map<string, Media[]>> {
  const results = new Map<string, Media[]>();

  const fetchPromises = categories.map(async (category) => {
    let data: TMDBResponse<Media> | null = null;

    switch (category) {
      case 'trending':
        data = await fetchTrending('all', 'week', page);
        break;
      case 'trending-movies':
        data = await fetchTrending('movie', 'week', page);
        break;
      case 'trending-tv':
        data = await fetchTrending('tv', 'week', page);
        break;
      case 'popular-movies':
        data = await fetchPopular('movie', page);
        break;
      case 'popular-tv':
        data = await fetchPopular('tv', page);
        break;
      case 'top-rated-movies':
        data = await fetchTopRated('movie', page);
        break;
      case 'top-rated-tv':
        data = await fetchTopRated('tv', page);
        break;
      case 'now-playing':
        data = await fetchNowPlaying(page);
        break;
      case 'upcoming':
        data = await fetchUpcoming(page);
        break;
      case 'animation':
        data = await fetchAnimations(page);
        break;
      case 'anime':
        data = await fetchAnime(page);
        break;
      default:
        // Check if it's a genre ID
        const genreId = parseInt(category);
        if (!isNaN(genreId)) {
          const [movies, tvShows] = await Promise.all([
            fetchByGenre('movie', genreId, page),
            fetchByGenre('tv', genreId, page),
          ]);
          const combined: Media[] = [
            ...(movies?.results || []).map(m => ({ ...m, media_type: 'movie' as const })),
            ...(tvShows?.results || []).map(t => ({ ...t, media_type: 'tv' as const })),
          ].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
          results.set(category, combined);
          return;
        }
    }

    if (data?.results) {
      results.set(category, data.results.map(item => ({
        ...item,
        media_type: item.media_type || (item.title ? 'movie' : 'tv'),
      })));
    }
  });

  await Promise.all(fetchPromises);
  return results;
}
