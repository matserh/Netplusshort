import { NextResponse } from 'next/server';
import { fetchAllGenres } from '@/lib/tmdb-api';

export async function GET() {
  try {
    const genres = await fetchAllGenres();
    return NextResponse.json({ genres });
  } catch (error) {
    console.error('Genres API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch genres' }, { status: 500 });
  }
}
