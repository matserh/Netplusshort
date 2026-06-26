'use client';

import { useState, useEffect } from 'react';
import { Palette } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface DynamicThemeToggleProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export function DynamicThemeToggle({ className, variant = 'default' }: DynamicThemeToggleProps) {
  const [isActive, setIsActive] = useState(false);

  // Load state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('netplus-dynamic-theme');
    if (saved === 'true') {
      setIsActive(true);
    }
  }, []);

  // Save state and apply theme
  const handleToggle = (value: boolean) => {
    setIsActive(value);
    localStorage.setItem('netplus-dynamic-theme', String(value));

    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('dynamicThemeChange', { detail: { active: value } }));
  };

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Palette className="w-3.5 h-3.5 text-primary" />
        <Switch
          checked={isActive}
          onCheckedChange={handleToggle}
          className="data-[state=checked]:bg-primary"
        />
      </div>
    );
  }

  return (
    <button
      className={cn(
        "w-full p-4 rounded-xl transition-all cursor-pointer border",
        isActive
          ? 'bg-primary/10 border-primary/30'
          : 'bg-white/5 border-white/10 hover:bg-white/8',
        className
      )}
      onClick={() => handleToggle(!isActive)}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-all",
          isActive ? 'bg-primary/20' : 'bg-white/5'
        )}>
          <Palette className={cn(
            "w-5 h-5 transition-colors",
            isActive ? 'text-primary' : 'text-white/60'
          )} />
        </div>

        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className={cn(
              "font-medium transition-colors",
              isActive ? 'text-primary' : 'text-white/80'
            )}>
              Thème Dynamique
            </span>
            {isActive && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                Actif
              </span>
            )}
          </div>
          <span className="text-xs text-white/50">
            {isActive
              ? 'Les couleurs s\'adaptent au contenu'
              : 'Activez pour des couleurs dynamiques'
            }
          </span>
        </div>

        <Switch
          checked={isActive}
          onCheckedChange={handleToggle}
          className="data-[state=checked]:bg-primary pointer-events-none"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </button>
  );
}
