'use client';

import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Logo({ size = 'md', className }: LogoProps) {
  const sizes = {
    sm: { container: 'gap-1.5', icon: 'w-6 h-6', text: 'text-base' },
    md: { container: 'gap-2', icon: 'w-8 h-8', text: 'text-xl' },
    lg: { container: 'gap-2.5', icon: 'w-10 h-10', text: 'text-2xl' },
  };

  const s = sizes[size];

  return (
    <div className={cn("flex items-center", s.container, className)}>
      {/* Icon - Film reel inspired */}
      <div className={cn(
        "relative rounded-lg flex items-center justify-center overflow-hidden",
        s.icon,
        "bg-gradient-to-br from-primary via-amber-500 to-amber-700"
      )}>
        {/* Inner design - play triangle */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Film holes */}
          <div className="absolute inset-1 flex flex-col justify-between py-0.5">
            <div className="flex justify-between px-0.5">
              <div className="w-1 h-1 rounded-full bg-black/30" />
              <div className="w-1 h-1 rounded-full bg-black/30" />
            </div>
            <div className="flex justify-between px-0.5">
              <div className="w-1 h-1 rounded-full bg-black/30" />
              <div className="w-1 h-1 rounded-full bg-black/30" />
            </div>
          </div>
          
          {/* N letter */}
          <span className="font-black text-black text-[10px] leading-none relative z-10">N</span>
        </div>
      </div>

      {/* Text */}
      <div className="flex items-baseline leading-none">
        <span className={cn(
          "font-black tracking-tight text-foreground",
          s.text
        )}>
          NET
        </span>
        <span className={cn(
          "font-black tracking-tight text-gradient-gold",
          s.text
        )} style={{
          background: 'linear-gradient(135deg, #f0c14b 0%, #e5a00d 50%, #c78c00 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          PLUS
        </span>
      </div>
    </div>
  );
}
