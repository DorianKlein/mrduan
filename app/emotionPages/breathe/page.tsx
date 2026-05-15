'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './breathe.module.css';

export default function BreathePage() {
  const [isInhaling, setIsInhaling] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [introState, setIntroState] = useState<'hidden' | 'showing' | 'fading'>('hidden');
  const [showGuide, setShowGuide] = useState(false);
  const [breathCount, setBreathCount] = useState(0);
  const [displayCount, setDisplayCount] = useState(5);
  const [isFinished, setIsFinished] = useState(false);
  const [showTapWarning, setShowTapWarning] = useState(false);
  
  const introTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pressStartTime = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const handleDismissIntro = useCallback(() => {
    setIntroState(prev => {
      if (prev === 'showing') {
        if (introTimeoutRef.current) clearTimeout(introTimeoutRef.current);
        
        // Show guide after intro fades out
        setTimeout(() => {
          setIntroState('hidden');
          setShowGuide(true);
        }, 1500); // Wait for fade out CSS transition
        
        return 'fading';
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    document.title = "静息 | 触觉呼吸";
  }, []);

  // Intro logic
  useEffect(() => {
    // Show intro text after a short delay
    const startTimeout = setTimeout(() => {
      setIntroState('showing');
      
      // Auto hide after 5s
      introTimeoutRef.current = setTimeout(() => {
        handleDismissIntro();
      }, 5000);
      
    }, 500);

    return () => {
      clearTimeout(startTimeout);
      if (introTimeoutRef.current) clearTimeout(introTimeoutRef.current);
    };
  }, [handleDismissIntro]);

  // Initialize AudioContext
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioCtxRef.current = new AudioContext();
        gainNodeRef.current = audioCtxRef.current.createGain();
        gainNodeRef.current.gain.value = 0; // Initial volume 0
        gainNodeRef.current.connect(audioCtxRef.current.destination);
      }
    } else if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  const playAudio = useCallback(() => {
    if (!audioCtxRef.current || !gainNodeRef.current) return;

    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current.disconnect();
    }

    oscillatorRef.current = audioCtxRef.current.createOscillator();
    oscillatorRef.current.type = 'sine';
    oscillatorRef.current.frequency.setValueAtTime(45, audioCtxRef.current.currentTime); // 45Hz low frequency signal
    oscillatorRef.current.connect(gainNodeRef.current);
    oscillatorRef.current.start();

    // Fade in volume over 4 seconds
    gainNodeRef.current.gain.cancelScheduledValues(audioCtxRef.current.currentTime);
    gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, audioCtxRef.current.currentTime);
    gainNodeRef.current.gain.linearRampToValueAtTime(1, audioCtxRef.current.currentTime + 4);
  }, []);

  const stopAudio = useCallback(() => {
    if (!audioCtxRef.current || !gainNodeRef.current) return;

    // Fade out volume over 6 seconds
    gainNodeRef.current.gain.cancelScheduledValues(audioCtxRef.current.currentTime);
    gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, audioCtxRef.current.currentTime);
    gainNodeRef.current.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 6);
    
    // We don't stop the oscillator immediately because it needs time to fade out nicely
  }, []);

  const handleStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault(); // Prevent text selection and context menus
    
    if (introState === 'showing') {
      handleDismissIntro();
      return;
    }

    if (isFinished) return; // Prevent interaction when finished
    
    if (!showGuide && !hasInteracted) {
      return; // Wait for intro to finish if they click too early, or let them dismiss it
    }

    if (breathCount >= 5) return;

    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    setShowTapWarning(false);
    pressStartTime.current = Date.now();

    setDisplayCount(5 - breathCount);
    setIsInhaling(true);
    setHasInteracted(true);

    // Audio API
    initAudio();
    playAudio();
  }, [initAudio, playAudio, introState, handleDismissIntro, showGuide, hasInteracted, breathCount, isFinished]);

  const handleEnd = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!isInhaling) return;
    setIsInhaling(false);

    const pressDuration = Date.now() - pressStartTime.current;
    
    if (pressDuration < 500) {
      // Considered a tap/misclick, don't increment count or play long exhale
      stopAudio();
      setShowTapWarning(true);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = setTimeout(() => {
        setShowTapWarning(false);
      }, 2000);
      return;
    }

    const newCount = breathCount + 1;
    setBreathCount(newCount);

    if (newCount >= 5) {
      // Show finished state shortly after exhale begins
      setTimeout(() => {
        setIsFinished(true);
        setShowGuide(false);
      }, 3000);
    }

    // Stop Audio
    stopAudio();
  }, [isInhaling, stopAudio, breathCount]);

  const handleReset = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsFinished(false);
    setBreathCount(0);
    setDisplayCount(5);
    setHasInteracted(false);
    setShowGuide(true);
  }, []);

  // Calculate dynamic colors based on breath count (0 to 5)
  const calculateAuraStyle = () => {
    const progress = breathCount / 5;
    
    // Default (0): rgba(160, 140, 145, 0.6)  -> Darker/grayish
    // Max (5): rgba(232, 180, 184, 0.8)     -> Pinkish/clear
    const rBase = Math.round(160 + (232 - 160) * progress);
    const gBase = Math.round(140 + (180 - 140) * progress);
    const bBase = Math.round(145 + (184 - 145) * progress);
    const aBase = 0.6 + (0.8 - 0.6) * progress;

    const rEdge = Math.round(160 + (232 - 160) * progress);
    const gEdge = Math.round(140 + (180 - 140) * progress);
    const bEdge = Math.round(145 + (184 - 145) * progress);
    const aEdge = 0.1 + (0.2 - 0.1) * progress;

    const rInhale = Math.round(200 + (255 - 200) * progress);
    const gInhale = Math.round(160 + (210 - 160) * progress);
    const bInhale = Math.round(165 + (214 - 165) * progress);

    return {
      '--aura-color-center': `rgba(${rBase}, ${gBase}, ${bBase}, ${aBase})`,
      '--aura-color-edge': `rgba(${rEdge}, ${gEdge}, ${bEdge}, ${aEdge})`,
      '--aura-color-transparent': `rgba(${rEdge}, ${gEdge}, ${bEdge}, 0)`,
      '--aura-color-inhale-center': `rgba(${rInhale}, ${gInhale}, ${bInhale}, 0.9)`,
      '--aura-color-inhale-edge': `rgba(${rBase}, ${gBase}, ${bBase}, 0.4)`,
      '--aura-color-inhale-transparent': `rgba(${rBase}, ${gBase}, ${bBase}, 0)`,
    } as React.CSSProperties;
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
        } catch (e) {}
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <div
      className={styles.container}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onContextMenu={(e) => e.preventDefault()}
      suppressHydrationWarning
    >
      {/* Top Texts */}
      <div className={`${styles.textTop} ${introState === 'showing' ? styles.textVisible : ''}`}>
        本周的工作终于要结束了。<br />
        现在的你，是不是感觉一身疲惫？
      </div>

      <div className={`${styles.textTop} ${(showGuide && !hasInteracted && !isFinished && !showTapWarning) ? styles.textVisible : ''}`}>
        按住屏幕中心进行吸气<br />松开进行呼气
      </div>

      <div className={`${styles.textTop} ${showTapWarning && !isFinished ? styles.textVisible : ''}`}>
        请长按屏幕
      </div>

      <div className={`${styles.textTop} ${(isInhaling && !isFinished && !showTapWarning) ? styles.textVisible : ''}`}>
        <div className={styles.numberText}>{displayCount}</div>
      </div>

      <div className={`${styles.textTop} ${isFinished ? styles.textVisible : ''}`}>
        辛苦了，这一周你已经做得很好了，<br />
        明天要理直气壮的休息。
      </div>

      {/* Aura Core */}
      <div 
        className={`${styles.auraContainer} ${isInhaling && !isFinished ? styles.inhale : ''} ${isFinished ? styles.finalAura : ''}`}
        style={calculateAuraStyle()}
      >
        <div className={styles.aura} />
      </div>

      {/* Reset Button */}
      <button 
        className={`${styles.resetBtn} ${isFinished ? styles.btnVisible : ''}`}
        onClick={handleReset}
        onTouchStart={handleReset}
      >
        再次呼吸
      </button>
    </div>
  );
}
