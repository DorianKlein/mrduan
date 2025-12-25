'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

export default function ParticleLoading() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置 canvas 尺寸
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // 粒子颜色
    const colors = ['#a78bfa', '#c084fc', '#e879f9', '#818cf8', '#60a5fa'];
    
    // 创建粒子
    const particles: Particle[] = [];
    const particleCount = 80;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    // 动画循环
    let animationId: number;
    const animate = () => {
      ctx.fillStyle = 'rgba(5, 1, 12, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        // 更新位置
        particle.x += particle.vx;
        particle.y += particle.vy;

        // 边界检测 - 反弹
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -1;
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -1;
        }

        // 限制在边界内
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));

        // 绘制粒子
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();

        // 绘制连接线
        particles.slice(index + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.strokeStyle = particle.color;
            ctx.globalAlpha = (1 - distance / 150) * 0.2;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#1a0933] via-[#05010c] to-[#0a1229] flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />
      <div className="relative z-10 text-center">
        <div className="mb-4">
          <div className="inline-block animate-pulse">
            <svg 
              className="w-16 h-16 text-purple-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" 
              />
            </svg>
          </div>
        </div>
        <div className="text-purple-300 text-lg font-medium mb-2">
          师兄正在努力连通网线...
        </div>
        <div className="flex gap-1 justify-center">
          <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
          <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
        </div>
      </div>
    </div>
  );
}
