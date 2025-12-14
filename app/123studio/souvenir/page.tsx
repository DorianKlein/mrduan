'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import InfoCard from '@/components/InfoCard';
import AmbientBackground from '@/components/AmbientBackground';

const Badge3DModel = dynamic(() => import('@/components/Badge3D'), { 
  ssr: false,
  loading: () => <div className="animate-pulse text-purple-500 text-center mt-40">Loading Assets...</div>
});

const PASSWORD = 'duankaiyi';

// 加入时长计时器组件
function JoinTimer({ startDate }: { startDate: string }) {
  const [duration, setDuration] = useState<string>('');

  useEffect(() => {
    const start = new Date(startDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = now - start;

      if (diff < 0) {
        setDuration('即将加入...');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const h = hours.toString().padStart(2, '0');
      const m = minutes.toString().padStart(2, '0');
      const s = seconds.toString().padStart(2, '0');

      setDuration(`${days}天 ${h}时 ${m}分 ${s}秒`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startDate]);

  if (!duration) return <span className="opacity-0">计算中...</span>;

  return (
    <span className="text-purple-300 font-mono font-bold">
      {duration}
    </span>
  );
}

// 简单的 SVG 图标：暂停和播放
const PauseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

export default function SouvenirPage() {
  const [uiVisible, setUiVisible] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(true); // ✅ 新增：控制旋转状态
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState('');

  const JOIN_DATE = "2023-09-01 10:00:00"; 

  const LETTER_TO_ZIYUE = `
    紫悦，很高兴你能成为工作室的第一批核心成员。
    
    还记得你刚来面试的时候，带着那本厚厚的手绘本，眼神里既紧张又充满光芒。这两年，看着你从一个只会画草图的新生，变成现在能独当一面的设计负责人，我真的很骄傲。
    
    这枚徽章不仅仅是个纪念品，它是你在这里留下的痕迹。无论未来你去哪里读研、去哪里工作，这里永远是你的起点。
    
    Keep creating, keep shining.
    —— 你的技术总监 & 朋友
  `;

  const handleUnlock = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (passwordInput.trim() === PASSWORD) {
      setIsAuthorized(true);
      setAuthError('');
      setPasswordInput('');
      return;
    }

    setAuthError('密码错误，无法访问。');
  };

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#1a0933] via-[#05010c] to-[#0a1229] px-6 text-white">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur">
          <h1 className="text-lg font-semibold uppercase tracking-[0.4em] text-purple-200">Access Required</h1>
          <p className="mt-3 text-sm text-purple-100/80">请输入访问密码以继续浏览 123 Studio Souvenir 页面。</p>
          <form className="mt-6 space-y-4" onSubmit={handleUnlock}>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-purple-200/90">Password</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(event) => {
                  setPasswordInput(event.target.value);
                  if (authError) setAuthError('');
                }}
                className="mt-2 w-full rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm text-white placeholder-purple-200/40 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40"
                placeholder="输入密码"
                autoFocus
              />
            </div>
            {authError && (
              <p className="text-xs font-medium text-rose-300">{authError}</p>
            )}
            <button
              type="submit"
              className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:from-purple-400 hover:to-indigo-400"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col justify-between">
      
      <div className="absolute inset-0 z-0">
        <AmbientBackground />
      </div>

      {/* 3D 背景层 */}
      <div className="absolute inset-0 z-0">
        <Badge3DModel 
          frontImg="/badges/ziyue.png"
          backImg="/badges/ziyue-back.png"
          svgPath="/badges/ziyue-shape.svg"
          scale={1.2}
          autoRotate={isAutoRotating} // ✅ 传入控制信号
          onLoadComplete={() => setUiVisible(true)} 
        />
      </div>

      {/* UI 层 */}
      <div className={`relative z-10 w-full h-full flex flex-col justify-between p-8 pointer-events-none transition-opacity duration-1000 ${uiVisible ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* 顶部 Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl">
              123<br/>STUDIO
            </h1>
            <div className="mt-2 inline-block px-3 py-1 border border-purple-500/30 rounded-full bg-purple-900/20 backdrop-blur-md">
              <span className="text-xs font-mono text-purple-300 tracking-widest">2025年终 · 纪念</span>
            </div>
          </div>

          {/* ✅ 右上角：旋转控制按钮 (替换了原来的 BLOCK 信息) */}
          <div className="pointer-events-auto">
            <button 
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full backdrop-blur-md transition-all text-white/80 hover:text-white group"
            >
              {isAutoRotating ? <PauseIcon /> : <PlayIcon />}
              <span className="text-xs font-mono tracking-widest uppercase hidden md:inline-block">
                {isAutoRotating ? '自动旋转 开启' : '自动旋转 关闭'}
              </span>
            </button>
          </div>
        </div>

        {/* 🔥 底部：使用新的 InfoCard 组件 */}
        {/* 注意：InfoCard 内部自带 pointer-events-auto，所以不用担心点击问题 */}
        <InfoCard 
          name="程紫月"
          nickname="紫悦"
          joinDate="2023-09-01 10:00:00"
          letterContent={LETTER_TO_ZIYUE}
        >
          {/* 把计时器作为 children 传进去 */}
          <JoinTimer startDate="2023-09-01 10:00:00" />
        </InfoCard>

      </div>
    </div>
  );
}