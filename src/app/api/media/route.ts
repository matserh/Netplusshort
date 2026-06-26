import { NextRequest, NextResponse } from 'next/server';
import {
  fetchTrending,
  fetchPopular,
  fetchTopRated,
  fetchNowPlaying,
  fetchUpcoming,
  fetchByGenre,
  fetchDiscover,
  fetchAnimations,
  fetchAnime,
} from '@/lib/tmdb-api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'trending';
  const page = parseInt(searchParams.get('page') || '1');
  const genreId = searchParams.get('genre');

  try {
    let data;
    let mediaType: 'movie' | 'tv' | 'all' = 'all';

    switch (category) {
      case 'trending':
        data = await fetchTrending('all', 'week', page);
        break;
      case 'trending-movies':
        data = await fetchTrending('movie', 'week', page);
        mediaType = 'movie';
        break;
      case 'trending-tv':
        data = await fetchTrending('tv', 'week', page);
        mediaType = 'tv';
        break;
      case 'popular-movies':
        data = await fetchPopular('movie', page);
        mediaType = 'movie';
        break;
      case 'popular-tv':
        data = await fetchPopular('tv', page);
        mediaType = 'tv';
        break;
      case 'top-rated-movies':
        data = await fetchTopRated('movie', page);
        mediaType = 'movie';
        break;
      case 'top-rated-tv':
        data = await fetchTopRated('tv', page);
        mediaType = 'tv';
        break;
      case 'now-playing':
        data = await fetchNowPlaying(page);
        mediaType = 'movie';
        break;
      case 'upcoming':
        data = await fetchUpcoming(page);
        mediaType = 'movie';
        break;
      case 'animation':
        data = await fetchAnimations(page);
        break;
      case 'anime':
        data = await fetchAnime(page);
        mediaType = 'tv';
        break;
      case 'genre':
        if (!genreId) {
          return NextResponse.json({ error: 'Genre ID required' }, { status: 400 });
        }
        // Fetch both movies and TV shows for genre
        const [movies, tvShows] = await Promise.all([
          fetchByGenre('movie', parseInt(genreId), page),
          fetchByGenre('tv', parseInt(genreId), page),
        ]);
        const combined = [
          ...(movies?.results || []).map((m) => ({ ...m, media_type: 'movie' as const })),
          ...(tvShows?.results || []).map((t) => ({ ...t, media_type: 'tv' as const })),
        ].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        data = {
          page,
          results: combined,
          total_pages: Math.max(movies?.total_pages || 1, tvShows?.total_pages || 1),
          total_results: (movies?.total_results || 0) + (tvShows?.total_results || 0),
        };
        break;
      case 'discover-movies':
        data = await fetchDiscover('movie', { page, voteCountGte: 100 });
        mediaType = 'movie';
        break;
      case 'discover-tv':
        data = await fetchDiscover('tv', { page, voteCountGte: 100 });
        mediaType = 'tv';
        break;
      default:
        // Try to parse as category name
        data = await fetchTrending('all', 'week', page);
    }

    if (!data) {
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }

    // Ensure media_type is set
    const results = data.results.map((item) => ({
      ...item,
      media_type: item.media_type || mediaType === 'all' 
        ? (item.title ? 'movie' : 'tv')
        : mediaType,
    }));

    return NextResponse.json({
      page: data.page,
      results,
      totalPages: data.total_pages,
      totalResults: data.total_results,
      hasMore: data.page < data.total_pages,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
