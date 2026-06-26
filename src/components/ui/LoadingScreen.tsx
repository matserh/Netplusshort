'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LOADING_SESSION_KEY = 'netplus_loading_shown';

// Check if loading was already shown in this session
const hasSeenLoading = (): boolean => {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(LOADING_SESSION_KEY) === 'true';
};

const markLoadingSeen = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(LOADING_SESSION_KEY, 'true');
  }
};

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoContainerRef = useRef<HTMLDivElement>(null);
  const letterNRef = useRef<HTMLSpanElement>(null);
  const dynamicTextRef = useRef<HTMLSpanElement>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const onCompleteCalledRef = useRef(false);

  // Animation principale
  const playCinematicIntro = useCallback(() => {
    if (!containerRef.current || !logoContainerRef.current || !letterNRef.current || !dynamicTextRef.current) return;

    const container = containerRef.current;
    const logoContainer = logoContainerRef.current;
    const letterN = letterNRef.current;
    const dynamicText = dynamicTextRef.current;

    // Timeline principale
    const masterTL = gsap.timeline({
      onComplete: () => {
        // Mark as seen immediately when animation completes
        markLoadingSeen();
        gsap.to(container, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.inOut',
          onComplete: () => {
            setIsComplete(true);
          }
        });
      }
    });

    // ===== PHASE 1: Apparition du N =====
    masterTL.set(letterN, { opacity: 0, scale: 2, filter: 'blur(30px)' });
    masterTL.set(dynamicText, { opacity: 0 });
    
    masterTL.to(letterN, {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      duration: 1,
      ease: 'power3.out'
    });

    // ===== PHASE 2: "Plus" apparaît (NPlus initial) =====
    masterTL.call(() => {
      dynamicText.innerHTML = '<span class="letter">P</span><span class="letter">l</span><span class="letter">u</span><span class="letter">s</span>';
    }, null, '+=0.2');
    
    masterTL.set(dynamicText.querySelectorAll('.letter'), { 
      opacity: 0, 
      y: 40,
      rotateX: -90 
    });
    
    masterTL.to(dynamicText, { opacity: 1, duration: 0.1 });
    masterTL.to(dynamicText.querySelectorAll('.letter'), {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: 0.5,
      stagger: 0.08,
      ease: 'back.out(1.7)'
    }, '<');

    // Pause pour montrer "NPlus"
    masterTL.to({}, { duration: 0.8 });

    // ===== PHASE 3: Transformation vers "NETPLUS" =====
    // "Plus" devient "ETPLUS" pour former NETPLUS
    masterTL.call(() => {
      dynamicText.innerHTML = '<span class="letter">E</span><span class="letter">T</span><span class="letter">P</span><span class="letter">L</span><span class="letter">U</span><span class="letter">S</span>';
    });
    
    masterTL.set(dynamicText.querySelectorAll('.letter'), { 
      opacity: 0, 
      y: -30,
      scale: 0.5 
    });
    
    masterTL.to(dynamicText.querySelectorAll('.letter'), {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.4,
      stagger: 0.05,
      ease: 'back.out(2)'
    });

    // ===== PHASE 4: Glow effect sur NETPLUS =====
    masterTL.to(logoContainer, {
      textShadow: '0 0 60px rgba(229, 160, 13, 0.8), 0 0 120px rgba(229, 160, 13, 0.4)',
      duration: 0.4,
      ease: 'power2.out'
    });

    // Pause pour lire "NETPLUS"
    masterTL.to({}, { duration: 1.5 });

    // ===== PHASE 5: Glow diminue =====
    masterTL.to(logoContainer, {
      textShadow: '0 0 30px rgba(229, 160, 13, 0.4)',
      duration: 0.3
    });

    // ===== PHASE 6: Retour vers "NPlus" =====
    // Animation de sortie des lettres
    masterTL.to(dynamicText.querySelectorAll('.letter'), {
      opacity: 0,
      y: 30,
      scale: 0.8,
      duration: 0.25,
      stagger: 0.03,
      ease: 'power2.in'
    });

    // Changement vers "Plus"
    masterTL.call(() => {
      dynamicText.innerHTML = '<span class="letter">P</span><span class="letter">l</span><span class="letter">u</span><span class="letter">s</span>';
    });
    
    masterTL.set(dynamicText.querySelectorAll('.letter'), { 
      opacity: 0, 
      y: -20,
      scale: 0.9 
    });
    
    masterTL.to(dynamicText.querySelectorAll('.letter'), {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.35,
      stagger: 0.05,
      ease: 'back.out(1.5)'
    });

    // Pause finale avec "NPlus"
    masterTL.to({}, { duration: 0.5 });

  }, []);

  // Check if we should show the loading screen - runs only once on mount
  useEffect(() => {
    if (hasSeenLoading()) {
      // Already shown in this session, skip immediately
      setIsComplete(true);
      // Mark that we should not show
      setShouldShow(false);
      // Call onComplete once
      if (!onCompleteCalledRef.current) {
        onCompleteCalledRef.current = true;
        onComplete();
      }
    } else {
      setShouldShow(true);
    }
  }, [onComplete]);

  // Play animation only when shouldShow is true
  useEffect(() => {
    if (!shouldShow) return;
    
    // Petit délai avant de démarrer
    const timer = setTimeout(playCinematicIntro, 200);
    return () => clearTimeout(timer);
  }, [playCinematicIntro, shouldShow]);

  // Call onComplete when animation finishes
  useEffect(() => {
    if (isComplete && shouldShow && !onCompleteCalledRef.current) {
      onCompleteCalledRef.current = true;
      onComplete();
    }
  }, [isComplete, shouldShow, onComplete]);

  if (!shouldShow || isComplete) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{
        background: '#000',
      }}
    >
      {/* Ambient particles/glow */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 30% 30%, rgba(229, 160, 13, 0.05) 0%, transparent 40%),
            radial-gradient(circle at 70% 70%, rgba(201, 140, 0, 0.05) 0%, transparent 40%)
          `
        }}
      />

      {/* Logo container */}
      <div
        ref={logoContainerRef}
        className="relative z-10 flex items-center select-none"
        style={{
          perspective: '1000px'
        }}
      >
        {/* Letter N - Always visible */}
        <span
          ref={letterNRef}
          className="inline-block"
          style={{
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: 'clamp(60px, 20vw, 150px)',
            letterSpacing: '3px',
            background: 'linear-gradient(135deg, #f0c14b 0%, #e5a00d 40%, #c78c00 70%, #8b6914 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 30px rgba(229, 160, 13, 0.4)',
            transformStyle: 'preserve-3d'
          }}
        >
          N
        </span>
        
        {/* Dynamic text container */}
        <span
          ref={dynamicTextRef}
          className="inline-flex"
          style={{
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: 'clamp(60px, 20vw, 150px)',
            letterSpacing: '3px',
            background: 'linear-gradient(135deg, #f0c14b 0%, #e5a00d 40%, #c78c00 70%, #8b6914 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Letters will be injected dynamically */}
        </span>
      </div>

      {/* Large ambient glow behind logo */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(229, 160, 13, 0.1) 0%, transparent 60%)',
          filter: 'blur(60px)',
          transform: 'translate(-50%, -50%)',
          left: '50%',
          top: '50%'
        }}
      />

      {/* CSS for letter animations */}
      <style jsx>{`
        :global(.letter) {
          display: inline-block;
          transform-origin: center bottom;
        }
      `}</style>
    </div>
  );
}
