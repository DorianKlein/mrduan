"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./moodCave.module.css";

type Bubble = {
  id: number;
  text: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  targetY: number;
  settled: boolean;
};

type Particle = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
};

const PLACEHOLDER_TEXTS = [
  "今天有什么让你不开心的吗？",
  "把烦恼写下来",
  "说出来会好一点的...",
  "这里很安全，可以说任何话",
];

const RELEASE_MESSAGES = [
  "已经送走了 ☁️",
  "让它随风而去 🍃",
  "不必在意了 ✨",
  "放下就好 🌙",
  "已经过去了 💫",
];

export default function MoodCavePage() {
  const [input, setInput] = useState("");
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [released, setReleased] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [placeholder, setPlaceholder] = useState(PLACEHOLDER_TEXTS[0]);
  const [showInputModal, setShowInputModal] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number | null>(null);
  const nextBubbleId = useRef(0);
  const nextParticleId = useRef(0);

  // 可调整的圆形大小参数 (建议范围 70-95)
  const CIRCLE_SIZE_PERCENT = 85;
  
  const WIDTH = 600;
  const HEIGHT = 600;

  useEffect(() => {
    document.title = "心情树洞 · 释放烦恼";
    
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholder((prev) => {
        const currentIndex = PLACEHOLDER_TEXTS.indexOf(prev);
        return PLACEHOLDER_TEXTS[(currentIndex + 1) % PLACEHOLDER_TEXTS.length];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const createBubble = useCallback((text: string): Bubble => {
    const x = WIDTH / 2 + (Math.random() - 0.5) * 100;
    const targetY = Math.random() * (HEIGHT * 0.6) + 50;
    const y = HEIGHT - 80;
    
    return {
      id: nextBubbleId.current++,
      text,
      x,
      y,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -2.5,
      opacity: 1,
      size: Math.min(text.length * 8 + 40, 150),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.01,
      targetY,
      settled: false,
    };
  }, []);

  const handleRelease = useCallback(() => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const newBubble = createBubble(trimmedInput);
    bubblesRef.current = [...bubblesRef.current, newBubble];
    setBubbles(bubblesRef.current);

    setInput("");
    setReleased((prev) => prev + 1);
    setShowInputModal(false);

    const randomMessage = RELEASE_MESSAGES[Math.floor(Math.random() * RELEASE_MESSAGES.length)];
    setToastMessage(randomMessage);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }, [input, createBubble]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleRelease();
    }
  }, [handleRelease]);

  const handlePop = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    const scaleY = HEIGHT / rect.height;

    let clientX, clientY;
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const clickX = (clientX - rect.left) * scaleX;
    const clickY = (clientY - rect.top) * scaleY;

    let popped = false;
    bubblesRef.current = bubblesRef.current.filter((bubble) => {
      const dx = bubble.x - clickX;
      const dy = bubble.y - clickY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < bubble.size / 2 && !popped) {
        popped = true;
        
        for (let i = 0; i < 12; i++) {
          const angle = (Math.PI * 2 * i) / 12;
          const speed = Math.random() * 2 + 2;
          particlesRef.current.push({
            id: nextParticleId.current++,
            x: bubble.x,
            y: bubble.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 3 + 2,
            opacity: 1,
            color: `hsl(${Math.random() * 40 + 30}, 70%, 60%)`,
          });
        }
        
        return false;
      }
      return true;
    });

    if (popped) {
      setBubbles(bubblesRef.current);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = WIDTH * dpr;
    canvas.height = HEIGHT * dpr;
    canvas.style.width = `${WIDTH}px`;
    canvas.style.height = `${HEIGHT}px`;
    ctx.scale(dpr, dpr);

    const animate = () => {
      if (!ctx) return;

      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      bubblesRef.current = bubblesRef.current.filter((bubble) => {
        if (!bubble.settled) {
          if (bubble.y <= bubble.targetY) {
            bubble.settled = true;
            bubble.vy = 0;
            bubble.y = bubble.targetY;
          } else {
            bubble.y += bubble.vy;
          }
        } else {
          bubble.vx += (Math.random() - 0.5) * 0.05;
          bubble.vx *= 0.98;
          bubble.vy = Math.sin(Date.now() * 0.001 + bubble.id) * 0.2;
          bubble.y += bubble.vy;
        }

        bubble.x += bubble.vx;
        bubble.rotation += bubble.rotationSpeed;

        if (bubble.x < bubble.size / 2) {
          bubble.x = bubble.size / 2;
          bubble.vx *= -0.8;
        }
        if (bubble.x > WIDTH - bubble.size / 2) {
          bubble.x = WIDTH - bubble.size / 2;
          bubble.vx *= -0.8;
        }

        if (bubble.opacity > 0) {
          ctx.save();
          ctx.globalAlpha = bubble.opacity;
          ctx.translate(bubble.x, bubble.y);
          ctx.rotate(bubble.rotation);

          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, bubble.size / 2);
          gradient.addColorStop(0, 'rgba(200, 133, 63, 0.15)');
          gradient.addColorStop(0.7, 'rgba(200, 133, 63, 0.08)');
          gradient.addColorStop(1, 'rgba(200, 133, 63, 0)');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(0, 0, bubble.size / 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(200, 133, 63, 0.3)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = 'rgba(31, 36, 33, 0.6)';
          ctx.font = '14px Inter';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          const maxWidth = bubble.size - 20;
          const words = bubble.text.split('');
          let line = '';
          let y = 0;
          const lineHeight = 20;
          const lines: string[] = [];

          for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i];
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && i > 0) {
              lines.push(line);
              line = words[i];
            } else {
              line = testLine;
            }
          }
          lines.push(line);

          const totalHeight = lines.length * lineHeight;
          y = -totalHeight / 2 + lineHeight / 2;

          lines.forEach((line) => {
            ctx.fillText(line, 0, y);
            y += lineHeight;
          });

          ctx.restore();
        }

        return bubble.opacity > 0;
      });

      setBubbles(bubblesRef.current);
      
      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.15;
        particle.opacity -= 0.02;

        if (particle.opacity > 0) {
          ctx.save();
          ctx.globalAlpha = particle.opacity;
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        return particle.opacity > 0;
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <main className={styles.page}>
      <section className={styles.container}>
        <header className={styles.header}>
          <h1>
            心情<em>树洞</em>
          </h1>
          <p className={styles.subtitle}>说出来，然后放下</p>
        </header>
        <button 
            className={styles.addButton}
            onClick={() => setShowInputModal(true)}
            aria-label="添加烦恼"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        <div className={styles.canvasWrapper}>
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            onClick={handlePop}
            onTouchStart={handlePop}
          />
          
          {bubbles.length === 0 && (
            <div className={styles.emptyHint}>
              <div className={styles.emptyIcon}>🌙</div>
              <p>晚上好</p>
              <p className={styles.emptySubtext}>点击右上角添加烦恼</p>
            </div>
          )}
        </div>

        <footer className={styles.footer}>
          <span>已释放 {released} 个烦恼</span>
          {released > 0 && (
            <>
              <span className={styles.dot}>·</span>
              <span>点击气泡可以戳破</span>
            </>
          )}
        </footer>
      </section>

      {showToast && (
        <div className={styles.toast}>
          {toastMessage}
        </div>
      )}

      {showInputModal && (
        <div className={styles.modal} onClick={() => setShowInputModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>写下你的烦恼</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowInputModal(false)}
              >
                ✕
              </button>
            </div>
            <textarea
              className={styles.modalTextarea}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              maxLength={50}
              rows={4}
              autoFocus
            />
            <div className={styles.modalFooter}>
              <span className={styles.counter}>
                {input.length} / 50
              </span>
              <div className={styles.modalHint}>
                按回车键释放
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
