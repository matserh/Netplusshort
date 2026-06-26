'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useMemo, useSyncExternalStore } from 'react';

// Supported languages
export type LanguageCode = 'fr' | 'en';

export interface Language {
  code: LanguageCode;
  name: string;
  tmdbCode: string; // TMDB API language code (e.g., 'fr-FR', 'en-US')
}

// Available languages
export const LANGUAGES: Record<LanguageCode, Language> = {
  fr: {
    code: 'fr',
    name: 'Français',
    tmdbCode: 'fr-FR',
  },
  en: {
    code: 'en',
    name: 'English',
    tmdbCode: 'en-US',
  },
};

// Default language (French)
const DEFAULT_LANGUAGE: LanguageCode = 'fr';

// Storage key for localStorage
const LANGUAGE_STORAGE_KEY = 'netplus_language';

// Detect browser language
function detectBrowserLanguage(): LanguageCode {
  // Check if running in browser
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }

  const browserLang = navigator.language || (navigator as Navigator & { userLanguage?: string }).userLanguage;
  
  if (!browserLang) {
    return DEFAULT_LANGUAGE;
  }

  // Extract the language code (e.g., 'fr' from 'fr-FR')
  const langCode = browserLang.split('-')[0].toLowerCase();

  // Check if it's a supported language
  if (langCode === 'fr') {
    return 'fr';
  } else if (langCode === 'en') {
    return 'en';
  }

  // Default to French for unsupported languages
  return DEFAULT_LANGUAGE;
}

// Store language in localStorage
function storeLanguage(lang: LanguageCode): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
}

// Create a simple store for language
let languageStore: LanguageCode | null = null;
const listeners = new Set<() => void>();

function getLanguageSnapshot(): LanguageCode {
  if (languageStore !== null) {
    return languageStore;
  }
  
  // Initialize on first access
  if (typeof window !== 'undefined') {
    // First check localStorage
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    
    if (stored && (stored === 'fr' || stored === 'en')) {
      languageStore = stored as LanguageCode;
    } else {
      // Detect from browser
      const detectedLang = detectBrowserLanguage();
      languageStore = detectedLang;
      // Store the detected language
      localStorage.setItem(LANGUAGE_STORAGE_KEY, detectedLang);
    }
  } else {
    languageStore = DEFAULT_LANGUAGE;
  }
  
  return languageStore;
}

function subscribeToLanguage(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function setLanguageStore(lang: LanguageCode): void {
  languageStore = lang;
  storeLanguage(lang);
  listeners.forEach(callback => callback());
}

// Context type
interface LanguageContextType {
  language: Language;
  languageCode: LanguageCode;
  tmdbLanguage: string;
  setLanguage: (lang: LanguageCode) => void;
  isLoading: boolean;
}

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider props
interface LanguageProviderProps {
  children: ReactNode;
}

// Language Provider component
export function LanguageProvider({ children }: LanguageProviderProps) {
  // Use useSyncExternalStore to subscribe to language changes
  const languageCode = useSyncExternalStore(
    subscribeToLanguage,
    getLanguageSnapshot,
    () => DEFAULT_LANGUAGE // Server snapshot
  );
  
  // isLoading is always false since we use sync external store
  const isLoading = false;

  // Update language
  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageStore(lang);
  }, []);

  // Get current language object
  const language = LANGUAGES[languageCode];
  const tmdbLanguage = language.tmdbCode;

  const value: LanguageContextType = useMemo(() => ({
    language,
    languageCode,
    tmdbLanguage,
    setLanguage,
    isLoading,
  }), [language, languageCode, tmdbLanguage, setLanguage, isLoading]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook to use language context
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
}

// Hook to get TMDB language code for API calls
export function useTmdbLanguage(): string {
  const { tmdbLanguage } = useLanguage();
  return tmdbLanguage;
}

// Export the context for advanced usage
export { LanguageContext };
