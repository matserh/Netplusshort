'use client';

import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface AIButtonProps {
  onClick: () => void;
}

export function AIButton({ onClick }: AIButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="icon-hover relative text-primary hover:bg-primary/10 group"
      title="Assistant IA"
    >
      <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
      <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse-gold" />
    </Button>
  );
}
