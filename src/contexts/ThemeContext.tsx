'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect, useRef } from 'react';

// RGB color type
interface RGB {
  r: number;
  g: number;
  b: number;
}

// HSL color type
interface HSL {
  h: number;
  s: number;
  l: number;
}

// Theme color data
export interface ThemeColors {
  primary: string;
  primaryForeground: string;
  accent: string;
  accentForeground: string;
}

// Context type
interface DynamicThemeContextType {
  isActive: boolean;
  currentColors: ThemeColors | null;
  currentImageUrl: string | null;
  extractColorsFromImage: (imageUrl: string) => Promise<ThemeColors | null>;
  applyTheme: (colors: ThemeColors) => void;
  resetTheme: () => void;
  isExtracting: boolean;
}

// Default Netplus gold colors
const DEFAULT_COLORS: ThemeColors = {
  primary: '#e5a00d',
  primaryForeground: '#000000',
  accent: '#f0c14b',
  accentForeground: '#000000',
};

// Create context
const DynamicThemeContext = createContext<DynamicThemeContextType | undefined>(undefined);

// Provider props
interface DynamicThemeProviderProps {
  children: ReactNode;
}

// Convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Convert HSL to hex
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Check if color is light or dark
function isLightColor(r: number, g: number, b: number): boolean {
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

// Generate theme colors from a dominant color
function generateThemeColors(dominantRgb: RGB): ThemeColors {
  const hsl = rgbToHsl(dominantRgb.r, dominantRgb.g, dominantRgb.b);
  
  // Adjust saturation and lightness for better UI colors
  const primaryH = hsl.h;
  const primaryS = Math.min(80, Math.max(50, hsl.s));
  const primaryL = Math.min(55, Math.max(40, hsl.l));
  
  const primary = hslToHex(primaryH, primaryS, primaryL);
  
  // Generate accent color (slightly lighter/different hue)
  const accentH = (primaryH + 20) % 360;
  const accentS = Math.min(70, primaryS + 10);
  const accentL = Math.min(60, primaryL + 15);
  
  const accent = hslToHex(accentH, accentS, accentL);
  
  // Foreground colors based on primary brightness
  const foreground = isLightColor(dominantRgb.r, dominantRgb.g, dominantRgb.b) ? '#000000' : '#ffffff';
  
  return {
    primary,
    primaryForeground: foreground,
    accent,
    accentForeground: foreground,
  };
}

// Dynamic Theme Provider component
export function DynamicThemeProvider({ children }: DynamicThemeProviderProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentColors, setCurrentColors] = useState<ThemeColors | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const previousColorsRef = useRef<ThemeColors | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('netplus-dynamic-theme');
    if (saved === 'true') {
      setIsActive(true);
    }
  }, []);

  // Listen for changes from the toggle component
  useEffect(() => {
    const handleChange = (e: CustomEvent<{ active: boolean }>) => {
      setIsActive(e.detail.active);
    };
    window.addEventListener('dynamicThemeChange', handleChange as EventListener);
    return () => window.removeEventListener('dynamicThemeChange', handleChange as EventListener);
  }, []);

  // Create canvas for color extraction
  useEffect(() => {
    if (typeof window !== 'undefined') {
      canvasRef.current = document.createElement('canvas');
      canvasRef.current.width = 100;
      canvasRef.current.height = 100;
    }
  }, []);

  // Extract dominant colors from an image
  const extractColorsFromImage = useCallback(async (imageUrl: string): Promise<ThemeColors | null> => {
    if (!canvasRef.current) return null;
    
    setIsExtracting(true);
    
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageUrl;
      });
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      
      // Draw image at small size for performance
      const size = 50;
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);
      
      // Get pixel data
      const imageData = ctx.getImageData(0, 0, size, size);
      const pixels = imageData.data;
      
      // Color quantization using simple k-means-like approach
      const colorCounts: Map<string, { count: number; r: number; g: number; b: number }> = new Map();
      
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];
        
        // Skip transparent pixels
        if (a < 128) continue;
        
        // Skip very dark or very light pixels
        const brightness = (r + g + b) / 3;
        if (brightness < 20 || brightness > 235) continue;
        
        // Quantize colors (reduce to fewer distinct colors)
        const qr = Math.round(r / 32) * 32;
        const qg = Math.round(g / 32) * 32;
        const qb = Math.round(b / 32) * 32;
        
        const key = `${qr},${qg},${qb}`;
        
        const existing = colorCounts.get(key);
        if (existing) {
          existing.count++;
        } else {
          colorCounts.set(key, { count: 1, r: qr, g: qg, b: qb });
        }
      }
      
      // Find the most vibrant dominant color
      let dominantColor: RGB | null = null;
      let maxScore = 0;
      
      colorCounts.forEach((color) => {
        const hsl = rgbToHsl(color.r, color.g, color.b);
        
        // Score based on saturation and count
        // Prefer more saturated, mid-lightness colors
        const saturationScore = hsl.s;
        const lightnessScore = 100 - Math.abs(hsl.l - 50) * 2;
        const countScore = Math.log(color.count + 1) * 10;
        
        const score = saturationScore * 0.4 + lightnessScore * 0.3 + countScore * 0.3;
        
        if (score > maxScore) {
          maxScore = score;
          dominantColor = { r: color.r, g: color.g, b: color.b };
        }
      });
      
      if (!dominantColor) {
        // Fallback: find most common color
        let maxCount = 0;
        colorCounts.forEach((color) => {
          if (color.count > maxCount) {
            maxCount = color.count;
            dominantColor = { r: color.r, g: color.g, b: color.b };
          }
        });
      }
      
      if (!dominantColor) {
        return null;
      }
      
      const themeColors = generateThemeColors(dominantColor);
      setCurrentColors(themeColors);
      setCurrentImageUrl(imageUrl);
      
      return themeColors;
    } catch (error) {
      console.error('Error extracting colors:', error);
      return null;
    } finally {
      setIsExtracting(false);
    }
  }, []);

  // Apply theme colors to CSS variables
  const applyTheme = useCallback((colors: ThemeColors) => {
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    
    // Add transition class for smooth color change
    root.style.transition = 'background-color 0.5s ease, color 0.5s ease';
    
    // Apply colors to CSS variables
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--primary-foreground', colors.primaryForeground);
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--accent-foreground', colors.accentForeground);
    
    // Also set ring color for focus states
    root.style.setProperty('--ring', colors.primary);
    
    previousColorsRef.current = colors;
  }, []);

  // Reset to default theme
  const resetTheme = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    
    root.style.setProperty('--primary', DEFAULT_COLORS.primary);
    root.style.setProperty('--primary-foreground', DEFAULT_COLORS.primaryForeground);
    root.style.setProperty('--accent', DEFAULT_COLORS.accent);
    root.style.setProperty('--accent-foreground', DEFAULT_COLORS.accentForeground);
    root.style.setProperty('--ring', DEFAULT_COLORS.primary);
    
    setCurrentColors(null);
    setCurrentImageUrl(null);
  }, []);

  // Handle dynamic theme active state changes
  useEffect(() => {
    if (!isActive && previousColorsRef.current) {
      resetTheme();
    }
  }, [isActive, resetTheme]);

  const value: DynamicThemeContextType = useMemo(() => ({
    isActive,
    currentColors,
    currentImageUrl,
    extractColorsFromImage,
    applyTheme,
    resetTheme,
    isExtracting,
  }), [isActive, currentColors, currentImageUrl, extractColorsFromImage, applyTheme, resetTheme, isExtracting]);

  return (
    <DynamicThemeContext.Provider value={value}>
      {children}
    </DynamicThemeContext.Provider>
  );
}

// Hook to use dynamic theme context
export function useDynamicTheme(): DynamicThemeContextType {
  const context = useContext(DynamicThemeContext);
  
  if (context === undefined) {
    throw new Error('useDynamicTheme must be used within a DynamicThemeProvider');
  }
  
  return context;
}

// Export the context for advanced usage
export { DynamicThemeContext };
