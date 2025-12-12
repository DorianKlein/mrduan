'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Badge3DModel = dynamic(() => import('@/components/Badge3D'), { 
  ssr: false,
  loading: () => <div className="animate-pulse text-purple-500 text-center mt-40">Loading Assets...</div>
});

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

  const JOIN_DATE = "2023-09-01 10:00:00"; 

  return (
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden flex flex-col justify-between">
      
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
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl">
              123<br/>STUDIO
            </h1>
            <div className="mt-2 inline-block px-3 py-1 border border-purple-500/30 rounded-full bg-purple-900/20 backdrop-blur-md">
              <span className="text-xs font-mono text-purple-300 tracking-widest">Year-end commemoration</span>
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
                {isAutoRotating ? 'Auto Rotate On' : 'Auto Rotate Off'}
              </span>
            </button>
          </div>
        </div>

        {/* 底部 Info */}
        <div className="flex justify-between items-end">
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 p-6 rounded-2xl max-w-sm pointer-events-auto"> 
            <h2 className="text-2xl font-bold text-white mb-1">
              小紫悦 <span className="text-sm font-normal text-gray-400 ml-2">/ QQ弹弹</span>
            </h2>
            <p className="text-sm text-gray-400 font-mono leading-relaxed mb-4">
              Core Member badge. Access to exclusive workshops.<br/>
              <span className="text-purple-400 mt-1 block text-xs">● Verified Owner</span>
            </p>

            <div className="border-t border-white/10 pt-3 mt-3">
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">加入工作室时长</p>
              <JoinTimer startDate={JOIN_DATE} />
            </div>
          </div>

          {/* ✅ 已移除原来的 Connect Wallet 按钮 */}
        </div>

      </div>
    </div>
  );
}