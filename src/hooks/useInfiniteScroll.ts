'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Media } from '@/types/media';

interface UseInfiniteScrollOptions {
  category: string;
  genreId?: string;
  initialData?: Media[];
  initialPage?: number;
  threshold?: number;
}

interface UseInfiniteScrollReturn {
  items: Media[];
  isLoading: boolean;
  hasMore: boolean;
  page: number;
  error: string | null;
  loadMore: () => Promise<void>;
  reset: () => void;
}

export function useInfiniteScroll({
  category,
  genreId,
  initialData = [],
  initialPage = 1,
  threshold = 200,
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const [items, setItems] = useState<Media[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(initialPage);
  const [error, setError] = useState<string | null>(null);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const fetchData = useCallback(async (pageNum: number): Promise<{ results: Media[]; hasMore: boolean }> => {
    const params = new URLSearchParams({
      category,
      page: String(pageNum),
    });
    
    if (genreId) {
      params.append('genre', genreId);
    }

    const response = await fetch(`/api/media?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch');
    
    const data = await response.json();
    return {
      results: data.results || [],
      hasMore: data.hasMore ?? false,
    };
  }, [category, genreId]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const { results, hasMore: more } = await fetchData(page + 1);
      
      setItems((prev) => {
        // Deduplicate items
        const existingIds = new Set(prev.map((item) => item.id));
        const newItems = results.filter((item) => !existingIds.has(item.id));
        return [...prev, ...newItems];
      });
      
      setPage((p) => p + 1);
      setHasMore(more);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, page, fetchData]);

  const reset = useCallback(() => {
    setItems(initialData);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
  }, [initialData, initialPage]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { rootMargin: `${threshold}px` }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, loadMore, threshold]);

  return {
    items,
    isLoading,
    hasMore,
    page,
    error,
    loadMore,
    reset,
  };
}

// Export the ref type for component use
export type { UseInfiniteScrollReturn };
