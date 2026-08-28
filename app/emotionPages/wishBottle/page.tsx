"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./wishBottle.module.css";

type Particle = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
};

type Message = {
  id: number;
  text: string;
  y: number;
  opacity: number;
};

const MESSAGES = [
  "今天的你也很棒 ✨",
  "慢慢来，比较快 🌱",
  "休息不是浪费时间 ☁️",
  "你已经很努力了 🫂",
  "平凡的日子也值得被纪念 📸",
  "允许自己不完美 🌙",
  "小确幸也是幸福 🍃",
  "你比想象中更坚强 💪",
  "焦虑的时候深呼吸 🌬️",
  "明天会是新的开始 🌅",
  "给自己一个拥抱 🤗",
  "一切都会好起来的 🌈",
];

export default function WishBottlePage() {
  const [collected, setCollected] = useState(0);
  const [started, setStarted] = useState(false);
  const [bottleGlow, setBottleGlow] = useState(0);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const messagesRef = useRef<Message[]>([]);
  const collectedRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const nextParticleId = useRef(0);
  const nextMessageId = useRef(0);
  const lastSpawnTime = useRef(0);

  const WIDTH = 375;
  const HEIGHT = 667;
  const TOTAL_MESSAGES = 12;
  const STARS_PER_MESSAGE = 5;
  const TOTAL_STARS = TOTAL_MESSAGES * STARS_PER_MESSAGE;

  const createParticle = useCallback((): Particle => {
    const edge = Math.floor(Math.random() * 4);
    let x, y, vx, vy;

    switch (edge) {
      case 0: // top
        x = Math.random() * WIDTH;
        y = -20;
        vx = (Math.random() - 0.5) * 1;
        vy = Math.random() * 0.5 + 0.3;
        break;
      case 1: // right
        x = WIDTH + 20;
        y = Math.random() * HEIGHT;
        vx = -(Math.random() * 0.5 + 0.3);
        vy = (Math.random() - 0.5) * 1;
        break;
      case 2: // bottom
        x = Math.random() * WIDTH;
        y = HEIGHT + 20;
        vx = (Math.random() - 0.5) * 1;
        vy = -(Math.random() * 0.5 + 0.3);
        break;
      default: // left
        x = -20;
        y = Math.random() * HEIGHT;
        vx = Math.random() * 0.5 + 0.3;
        vy = (Math.random() - 0.5) * 1;
    }

    return {
      id: nextParticleId.current++,
      x,
      y,
      vx,
      vy,
      size: Math.random() * 3 + 2,
      opacity: Math.random() * 0.5 + 0.5,
      hue: Math.random() * 60 + 30,
    };
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!started) {
      setStarted(true);
      return;
    }

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

    let collectedCount = 0;
    particlesRef.current = particlesRef.current.filter((p) => {
      const dx = p.x - clickX;
      const dy = p.y - clickY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 30) {
        collectedCount++;
        return false;
      }
      return true;
    });

    if (collectedCount > 0) {
      collectedRef.current += collectedCount;
      setCollected(collectedRef.current);
      const progress = Math.min(collectedRef.current / TOTAL_STARS, 1);
      setBottleGlow(progress);

      // 每5颗解锁一句
      if (collectedRef.current % STARS_PER_MESSAGE === 0 && collectedRef.current <= TOTAL_STARS) {
        const msgIndex = Math.floor(collectedRef.current / STARS_PER_MESSAGE) - 1;
        if (msgIndex >= 0 && msgIndex < MESSAGES.length) {
          const newMsg: Message = {
            id: nextMessageId.current++,
            text: MESSAGES[msgIndex],
            y: HEIGHT / 2,
            opacity: 1,
          };
          messagesRef.current.push(newMsg);
        }
      }

      // 收集满了显示弹窗
      if (collectedRef.current === TOTAL_STARS) {
        setTimeout(() => {
          setShowCompleteModal(true);
        }, 1000);
      }
    }
  }, [started]);

  const handleReset = useCallback(() => {
    collectedRef.current = 0;
    particlesRef.current = [];
    messagesRef.current = [];
    setCollected(0);
    setBottleGlow(0);
    setShowCompleteModal(false);
  }, []);

  useEffect(() => {
    document.title = "心语瓶 · 收集温暖";
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

    const animate = (timestamp: number) => {
      if (!ctx) return;

      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      if (started && timestamp - lastSpawnTime.current > 300) {
        if (particlesRef.current.length < 25) {
          particlesRef.current.push(createParticle());
          lastSpawnTime.current = timestamp;
        }
      }

      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;

        const inBounds = p.x > -30 && p.x < WIDTH + 30 && p.y > -30 && p.y < HEIGHT + 30;
        
        if (inBounds) {
          ctx.beginPath();
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
          gradient.addColorStop(0, `hsla(${p.hue}, 80%, 70%, ${p.opacity})`);
          gradient.addColorStop(1, `hsla(${p.hue}, 80%, 70%, 0)`);
          ctx.fillStyle = gradient;
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        return inBounds;
      });

      messagesRef.current = messagesRef.current.filter((msg) => {
        msg.y -= 0.5;
        msg.opacity -= 0.005;

        if (msg.opacity > 0) {
          ctx.save();
          ctx.font = "16px sans-serif";
          ctx.textAlign = "center";
          ctx.fillStyle = `rgba(255, 255, 255, ${msg.opacity})`;
          ctx.fillText(msg.text, WIDTH / 2, msg.y);
          ctx.restore();
        }

        return msg.opacity > 0;
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [started, createParticle]);

  return (
    <main className={styles.page}>
      <section className={styles.container}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>EMOTION COLLECTION</p>
            <h1>心语瓶</h1>
            <p className={styles.subtitle}>请点击收集飘浮的星尘</p>
          </div>
          <div className={styles.counter}>
            {collected}
            <small>星尘</small>
          </div>
        </header>

        <div className={styles.canvasWrapper}>
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            onClick={handleClick}
            onTouchStart={handleClick}
          />

          {!started && (
            <div className={styles.startHint}>
              <div className={styles.sparkle}>✦</div>
              <strong>点击开始收集</strong>
              <small>每收集5颗星尘解锁一句话</small>
            </div>
          )}

          <div 
            className={styles.bottle} 
            style={{ 
              opacity: 0.3 + bottleGlow * 0.7,
              filter: `drop-shadow(0 0 ${bottleGlow * 20}px rgba(255, 220, 150, ${bottleGlow * 0.8}))`
            }}
          >
            <div className={styles.bottleNeck} />
            <div className={styles.bottleBody}>
              <div className={styles.bottleShine} />
              <div 
                className={styles.bottleFill}
                style={{ 
                  height: `${bottleGlow * 100}%`,
                  background: `linear-gradient(180deg, 
                    rgba(255, 215, 100, ${0.3 + bottleGlow * 0.4}), 
                    rgba(255, 180, 120, ${0.2 + bottleGlow * 0.3}))`
                }}
              />
              <div className={styles.bottleProgress}>
                {collected} / {TOTAL_STARS}
              </div>
            </div>
          </div>
        </div>

        {/* <footer className={styles.footer}>
          <span>点击屏幕收集星尘</span>
          <span className={styles.dot}>·</span>
          <span>{Math.floor(collected / STARS_PER_MESSAGE)} / {TOTAL_MESSAGES} </span>
        </footer> */}
      </section>

      {showCompleteModal && (
        <div className={styles.modal} onClick={handleReset}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>🎉</div>
            <h2>收集完成！</h2>
            <p>祝你有一个美好的夜晚</p>
            <p className={styles.modalBless}>周末快乐 ✨</p>
            <button className={styles.modalButton} onClick={handleReset}>
              再次收集
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
