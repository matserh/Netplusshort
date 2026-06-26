'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

// Progress data structure
export interface UserProgress {
  moviesWatched: number;
  animeWatched: number;
  nCoins: number; // 1 movie = 1N, 1 anime = 1N, need 5N total for dynamic theme
  dynamicThemeEnabled: boolean;
  dynamicThemeActive: boolean;
  watchedContent: number[]; // Track watched content IDs (array for JSON serialization)
}

// Storage key for localStorage
const PROGRESS_STORAGE_KEY = 'netplus_progress';

// Default progress
const DEFAULT_PROGRESS: UserProgress = {
  moviesWatched: 0,
  animeWatched: 0,
  nCoins: 0,
  dynamicThemeEnabled: false,
  dynamicThemeActive: false,
  watchedContent: [],
};

// Anime genre IDs from TMDB
const ANIME_GENRE_IDS = [16]; // 16 = Animation genre

// Context type
interface UserProgressContextType {
  progress: UserProgress;
  moviesWatched: number;
  animeWatched: number;
  nCoins: number;
  dynamicThemeEnabled: boolean;
  dynamicThemeActive: boolean;
  nCoinsRequired: number;
  // Functions
  watchMovie: (id: number) => boolean; // Returns true if newly watched
  watchAnime: (id: number) => boolean; // Returns true if newly watched
  watchContent: (id: number, genreIds: number[], isMovie: boolean) => boolean; // Auto-detect type
  canEnableDynamicTheme: () => boolean;
  enableDynamicTheme: () => boolean; // Returns true if successful
  toggleDynamicTheme: () => void;
  resetProgress: () => void;
}

// Create context with a default value to prevent undefined errors
const UserProgressContext = createContext<UserProgressContextType | null>(null);

// Provider props
interface UserProgressProviderProps {
  children: ReactNode;
}

// Check if content is anime based on genre IDs
function isAnimeContent(genreIds: number[]): boolean {
  return genreIds.some(genreId => ANIME_GENRE_IDS.includes(genreId));
}

// Load progress from localStorage
function loadProgressFromStorage(): UserProgress {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_PROGRESS };
  }
  
  const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
  
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_PROGRESS,
        ...parsed,
        watchedContent: parsed.watchedContent || [],
      };
    } catch {
      return { ...DEFAULT_PROGRESS };
    }
  }
  
  return { ...DEFAULT_PROGRESS };
}

// Save progress to localStorage
function saveProgressToStorage(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}

// User Progress Provider component
export function UserProgressProvider({ children }: UserProgressProviderProps) {
  // Initialize state with a lazy initializer that reads from localStorage on mount
  const [progress, setProgress] = useState<UserProgress>(() => {
    // Return default for SSR
    if (typeof window === 'undefined') {
      return DEFAULT_PROGRESS;
    }
    // Load from localStorage on client
    return loadProgressFromStorage();
  });

  // Watch a movie (returns true if newly watched)
  const watchMovie = useCallback((id: number): boolean => {
    let newlyWatched = false;
    
    setProgress(prev => {
      if (prev.watchedContent.includes(id)) {
        return prev;
      }
      
      newlyWatched = true;
      const newProgress: UserProgress = {
        ...prev,
        moviesWatched: prev.moviesWatched + 1,
        nCoins: prev.nCoins + 1,
        watchedContent: [...prev.watchedContent, id],
      };
      
      saveProgressToStorage(newProgress);
      return newProgress;
    });
    
    return newlyWatched;
  }, []);

  // Watch anime (returns true if newly watched)
  const watchAnime = useCallback((id: number): boolean => {
    let newlyWatched = false;
    
    setProgress(prev => {
      if (prev.watchedContent.includes(id)) {
        return prev;
      }
      
      newlyWatched = true;
      const newProgress: UserProgress = {
        ...prev,
        animeWatched: prev.animeWatched + 1,
        nCoins: prev.nCoins + 1,
        watchedContent: [...prev.watchedContent, id],
      };
      
      saveProgressToStorage(newProgress);
      return newProgress;
    });
    
    return newlyWatched;
  }, []);

  // Watch content with auto-detection of type
  const watchContent = useCallback((id: number, genreIds: number[], isMovie: boolean): boolean => {
    // Determine if it's anime based on genre
    if (isAnimeContent(genreIds)) {
      return watchAnime(id);
    }
    
    // Otherwise, treat as movie or TV show
    if (isMovie) {
      return watchMovie(id);
    } else {
      // TV shows count as anime if they have animation genre, otherwise as movie for simplicity
      return watchMovie(id);
    }
  }, [watchMovie, watchAnime]);

  // Check if user can enable dynamic theme
  const canEnableDynamicTheme = useCallback((): boolean => {
    return progress.nCoins >= 5 && !progress.dynamicThemeEnabled;
  }, [progress.nCoins, progress.dynamicThemeEnabled]);

  // Enable dynamic theme (deduct 5N)
  const enableDynamicTheme = useCallback((): boolean => {
    if (progress.nCoins < 5 || progress.dynamicThemeEnabled) {
      return false;
    }
    
    let success = false;
    
    setProgress(prev => {
      if (prev.nCoins < 5 || prev.dynamicThemeEnabled) {
        return prev;
      }
      
      success = true;
      const newProgress: UserProgress = {
        ...prev,
        nCoins: prev.nCoins - 5,
        dynamicThemeEnabled: true,
        dynamicThemeActive: true,
      };
      
      saveProgressToStorage(newProgress);
      return newProgress;
    });
    
    return success;
  }, [progress.nCoins, progress.dynamicThemeEnabled]);

  // Toggle dynamic theme on/off
  const toggleDynamicTheme = useCallback(() => {
    setProgress(prev => {
      if (!prev.dynamicThemeEnabled) {
        return prev;
      }
      
      const newProgress: UserProgress = {
        ...prev,
        dynamicThemeActive: !prev.dynamicThemeActive,
      };
      
      saveProgressToStorage(newProgress);
      return newProgress;
    });
  }, []);

  // Reset progress (for testing/debugging)
  const resetProgress = useCallback(() => {
    const newProgress = { ...DEFAULT_PROGRESS };
    saveProgressToStorage(newProgress);
    setProgress(newProgress);
  }, []);

  const value: UserProgressContextType = useMemo(() => ({
    progress,
    moviesWatched: progress.moviesWatched,
    animeWatched: progress.animeWatched,
    nCoins: progress.nCoins,
    dynamicThemeEnabled: progress.dynamicThemeEnabled,
    dynamicThemeActive: progress.dynamicThemeActive,
    nCoinsRequired: 5,
    watchMovie,
    watchAnime,
    watchContent,
    canEnableDynamicTheme,
    enableDynamicTheme,
    toggleDynamicTheme,
    resetProgress,
  }), [progress, watchMovie, watchAnime, watchContent, canEnableDynamicTheme, enableDynamicTheme, toggleDynamicTheme, resetProgress]);

  return (
    <UserProgressContext.Provider value={value}>
      {children}
    </UserProgressContext.Provider>
  );
}

// Hook to use user progress context
export function useUserProgress(): UserProgressContextType {
  const context = useContext(UserProgressContext);
  
  if (context === null) {
    throw new Error('useUserProgress must be used within a UserProgressProvider');
  }
  
  return context;
}

// Export the context for advanced usage
export { UserProgressContext };
