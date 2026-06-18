"use client";

import React, { useState, useRef } from 'react';
import './duanwu.css';

const WORDS = ['端', '午', '安', '康'];

export default function DuanwuPage() {
  const [clickCount, setClickCount] = useState(0);
  const [placedWords, setPlacedWords] = useState<string[]>([]);
  const [flyingNode, setFlyingNode] = useState<{
    word: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);

  const boatRef = useRef<HTMLDivElement>(null);
  const placeholdersRef = useRef<(HTMLDivElement | null)[]>([]);

  const handleBoatClick = () => {
    if (clickCount >= 4 || flyingNode !== null) return;

    const currentWord = WORDS[clickCount];
    const boatEl = boatRef.current;
    const targetEl = placeholdersRef.current[clickCount];

    if (!boatEl || !targetEl) return;

    const boatRect = boatEl.getBoundingClientRect();
    const startX = boatRect.left + boatRect.width / 2;
    const startY = boatRect.top + boatRect.height / 2;

    const targetRect = targetEl.getBoundingClientRect();
    const endX = targetRect.left + targetRect.width / 2;
    const endY = targetRect.top + targetRect.height / 2;

    setFlyingNode({ word: currentWord, startX, startY, endX, endY });

    setTimeout(() => {
      setFlyingNode(null);
      setPlacedWords((prev) => [...prev, currentWord]);
      setClickCount((prev) => prev + 1);
    }, 800);
  };

  const isAllPlaced = placedWords.length === 4;

  return (
    <main className="app-container">
      <div className="sky-glow" />
      <div className="sun" />
      <div className="cloud cloud-one" />
      <div className="cloud cloud-two" />
      <div className="mountain mountain-back" />
      <div className="mountain mountain-front" />
      <div className="leaf leaf-left" />
      <div className="leaf leaf-right" />

      <section className="festival-card" aria-label="端午节祝福互动区">
        <p className="eyebrow">五月初五 · 龙舟送福</p>
        <p className="subtitle">点击龙舟，把祝福粽子送到上方，点亮节日问候。</p>

        <div className="title-container">
          {WORDS.map((word, index) => (
            <div
              key={word}
              className={`placeholder ${placedWords[index] ? 'filled' : ''}`}
              ref={(el) => { placeholdersRef.current[index] = el; }}
              aria-label={`祝福字 ${word}`}
            >
              {placedWords[index] && (
                <div className={`zongzi placed ${isAllPlaced ? 'shake' : ''}`}>
                  <span>{placedWords[index]}</span>
                </div>
              )}
            </div>
          ))}
        </div>

      </section>

      {flyingNode && (
        <div
          className="zongzi flying fly-active"
          style={{
            '--start-x': `${flyingNode.startX}px`,
            '--start-y': `${flyingNode.startY}px`,
            '--end-x': `${flyingNode.endX}px`,
            '--end-y': `${flyingNode.endY}px`,
          } as React.CSSProperties}
        >
          <span>{flyingNode.word}</span>
        </div>
      )}

      <div className="river-light river-light-one" />
      <div className="river-light river-light-two" />

      <div
        id="boat-container"
        className={`floating boat-step-${placedWords.length} ${flyingNode ? 'sending' : ''} ${isAllPlaced ? 'completed' : ''}`}
        ref={boatRef}
        onClick={handleBoatClick}
        role="button"
        tabIndex={0}
        aria-label="点击龙舟发送端午祝福"
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleBoatClick();
          }
        }}
      >
        <div className="boat-aura" />
        <svg viewBox="0 0 300 120" className="dragon-boat" aria-hidden="true">
          <line className="bg-p1" x1="100" y1="50" x2="80" y2="110" stroke="#795548" strokeWidth="4" strokeLinecap="round" />
          <line className="bg-p2" x1="150" y1="50" x2="130" y2="110" stroke="#795548" strokeWidth="4" strokeLinecap="round" />
          <line className="bg-p3" x1="200" y1="50" x2="180" y2="110" stroke="#795548" strokeWidth="4" strokeLinecap="round" />

          <path d="M 30,70 Q 150,110 270,70 L 250,95 Q 150,125 50,95 Z" fill="#D2691E" />
          <path d="M 30,70 Q 150,90 270,70 L 260,80 Q 150,105 40,80 Z" fill="#8B4513" />
          <path d="M 48,78 Q 150,102 252,78" stroke="#f9d27d" strokeWidth="4" strokeLinecap="round" fill="none" />

          <path d="M 270,70 Q 260,40 285,25 Q 275,50 250,60 Z" fill="#D32F2F" />
          <circle cx="270" cy="45" r="4" fill="#FFF" />
          <circle cx="272" cy="45" r="2" fill="#000" />
          <path d="M 285,25 Q 295,35 280,45" stroke="#FFEB3B" strokeWidth="3" fill="none" />
          <path d="M 278,58 Q 290,60 296,52" stroke="#f9d27d" strokeWidth="3" strokeLinecap="round" fill="none" />

          <path d="M 30,70 Q 20,40 10,20 Q 25,50 40,65 Z" fill="#D32F2F" />

          <circle cx="100" cy="40" r="12" fill="#FFC107" />
          <rect x="92" y="52" width="16" height="20" rx="4" fill="#F44336" />
          <path d="M 90,35 Q 100,20 110,35" stroke="#000" strokeWidth="2" fill="none" />

          <circle cx="150" cy="40" r="12" fill="#FFC107" />
          <rect x="142" y="52" width="16" height="20" rx="4" fill="#F44336" />
          <path d="M 140,35 Q 150,20 160,35" stroke="#000" strokeWidth="2" fill="none" />

          <circle cx="200" cy="40" r="12" fill="#FFC107" />
          <rect x="192" y="52" width="16" height="20" rx="4" fill="#F44336" />
          <path d="M 190,35 Q 200,20 210,35" stroke="#000" strokeWidth="2" fill="none" />

          <line className="fg-p1" x1="100" y1="60" x2="115" y2="120" stroke="#5D4037" strokeWidth="5" strokeLinecap="round" />
          <line className="fg-p2" x1="150" y1="60" x2="165" y2="120" stroke="#5D4037" strokeWidth="5" strokeLinecap="round" />
          <line className="fg-p3" x1="200" y1="60" x2="215" y2="120" stroke="#5D4037" strokeWidth="5" strokeLinecap="round" />
        </svg>
      </div>

      <div className="wave wave-back" />
      <div className="wave wave-mid" />
      <div className="wave wave-front" />

      <div className={`hint ${isAllPlaced ? 'success' : ''}`}>
        {isAllPlaced ? '愿你粽有欢喜，端午安康' : '点击龙舟，收集四枚祝福粽子'}
      </div>
    </main>
  );
}
