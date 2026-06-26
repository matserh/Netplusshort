import { API_CONFIG, TMDBResponse, Media, MovieDetails, TVDetails, Genre } from '@/types/media';

interface FetchOptions {
  page?: number;
  region?: string;
  with_genres?: string;
  query?: string;
  sort_by?: string;
}

// Generic TMDB fetch function
async function fetchTMDB<T>(
  endpoint: string, 
  options: FetchOptions = {}
): Promise<T | null> {
  try {
    const url = new URL(`${API_CONFIG.tmdb.baseUrl}${endpoint}`);
    url.searchParams.append('api_key', API_CONFIG.tmdb.apiKey);
    url.searchParams.append('language', API_CONFIG.language);
    
    // Add optional parameters
    if (options.page) url.searchParams.append('page', String(options.page));
    if (options.region) url.searchParams.append('region', options.region);
    if (options.with_genres) url.searchParams.append('with_genres', options.with_genres);
    if (options.query) url.searchParams.append('query', options.query);
    if (options.sort_by) url.searchParams.append('sort_by', options.sort_by);
    
    const response = await fetch(url, { 
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) {
      console.error(`TMDB API Error: ${response.status}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching TMDB data:', error);
    return null;
  }
}

// Get now playing movies
export async function getNowPlayingMovies(page = 1, region = 'FR'): Promise<TMDBResponse<Media> | null> {
  return fetchTMDB<TMDBResponse<Media>>('/movie/now_playing', { page, region });
}

// Get popular movies
export async function getPopularMovies(page = 1): Promise<TMDBResponse<Media> | null> {
  return fetchTMDB<TMDBResponse<Media>>('/movie/popular', { page });
}

// Get trending TV shows
export async function getTrendingTV(page = 1): Promise<TMDBResponse<Media> | null> {
  return fetchTMDB<TMDBResponse<Media>>('/trending/tv/week', { page });
}

// Get trending all
export async function getTrendingAll(page = 1): Promise<TMDBResponse<Media> | null> {
  return fetchTMDB<TMDBResponse<Media>>('/trending/all/week', { page });
}

// Get top rated movies
export async function getTopRatedMovies(page = 1): Promise<TMDBResponse<Media> | null> {
  return fetchTMDB<TMDBResponse<Media>>('/movie/top_rated', { page });
}

// Get upcoming movies
export async function getUpcomingMovies(page = 1, region = 'FR'): Promise<TMDBResponse<Media> | null> {
  return fetchTMDB<TMDBResponse<Media>>('/movie/upcoming', { page, region });
}

// Get movie details
export async function getMovieDetails(id: number): Promise<MovieDetails | null> {
  return fetchTMDB<MovieDetails>(`/movie/${id}`);
}

// Get TV details
export async function getTVDetails(id: number): Promise<TVDetails | null> {
  return fetchTMDB<TVDetails>(`/tv/${id}`);
}

// Get TV season details
export async function getTVSeasonDetails(tvId: number, seasonNumber: number) {
  return fetchTMDB(`/tv/${tvId}/season/${seasonNumber}`);
}

// Search multi (movies + TV)
export async function searchMulti(query: string, page = 1): Promise<TMDBResponse<Media> | null> {
  return fetchTMDB<TMDBResponse<Media>>('/search/multi', { query, page });
}

// Discover movies by genre
export async function discoverMoviesByGenre(genreId: string, page = 1): Promise<TMDBResponse<Media> | null> {
  return fetchTMDB<TMDBResponse<Media>>('/discover/movie', { 
    with_genres: genreId, 
    page,
    sort_by: 'popularity.desc'
  });
}

// Discover TV by genre
export async function discoverTVByGenre(genreId: string, page = 1): Promise<TMDBResponse<Media> | null> {
  return fetchTMDB<TMDBResponse<Media>>('/discover/tv', { 
    with_genres: genreId, 
    page,
    sort_by: 'popularity.desc'
  });
}

// Get movie genres
export async function getMovieGenres(): Promise<{ genres: Genre[] } | null> {
  return fetchTMDB<{ genres: Genre[] }>('/genre/movie/list');
}

// Get TV genres
export async function getTVGenres(): Promise<{ genres: Genre[] } | null> {
  return fetchTMDB<{ genres: Genre[] }>('/genre/tv/list');
}

// Get all genres combined
export async function getAllGenres(): Promise<Genre[]> {
  const [movieGenres, tvGenres] = await Promise.all([
    getMovieGenres(),
    getTVGenres()
  ]);
  
  const genreMap = new Map<number, Genre>();
  
  movieGenres?.genres.forEach(g => genreMap.set(g.id, g));
  tvGenres?.genres.forEach(g => genreMap.set(g.id, g));
  
  return Array.from(genreMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}
