'use client';

import { LanguageProvider } from '@/contexts/LanguageContext';
import { UserProgressProvider } from '@/contexts/UserProgressContext';
import { DynamicThemeProvider } from '@/contexts/ThemeContext';
import { ReactNode } from 'react';

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <LanguageProvider>
      <UserProgressProvider>
        <DynamicThemeProvider>
          {children}
        </DynamicThemeProvider>
      </UserProgressProvider>
    </LanguageProvider>
  );
}
