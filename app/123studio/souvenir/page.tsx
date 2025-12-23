'use client';

// 1. 引入 Suspense
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import InfoCard from '@/components/InfoCard';
import AmbientBackground from '@/components/AmbientBackground';
import { getBadgeById, type BadgeConfig } from './badges-config';

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

// 2. 将原本的主页面逻辑改名为 SouvenirContent（不再是 default export）
function SouvenirContent() {
  const searchParams = useSearchParams();
  const urlBadgeId = searchParams.get('id');
  
  const [inputBadgeId, setInputBadgeId] = useState('');
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null); // 用户选择的徽章ID
  const [showInput, setShowInput] = useState(!urlBadgeId);
  const [currentBadge, setCurrentBadge] = useState<BadgeConfig | null>(null);
  const [uiVisible, setUiVisible] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [error, setError] = useState('');

  // 加载勋章配置
  useEffect(() => {
    // 优先使用 URL 参数，其次使用用户选择的ID
    const badgeId = urlBadgeId || selectedBadgeId;
    if (!badgeId) return;
    
    const badge = getBadgeById(badgeId);
    if (badge) {
      setCurrentBadge(badge);
      setError('');
    } else {
      // 如果找不到勋章，使用默认的 ziyue
      const defaultBadge = getBadgeById('ziyue');
      setCurrentBadge(defaultBadge || null);
    }
    // 每次切换勋章时重置UI
    setUiVisible(false);
  }, [urlBadgeId, selectedBadgeId]);

  // 处理ID提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedId = inputBadgeId.trim();
    const badge = getBadgeById(trimmedId);
    if (badge) {
      setSelectedBadgeId(trimmedId); // 保存用户选择的ID
      setShowInput(false);
      setError('');
    } else {
      setError('未找到该徽章，请检查ID是否正确');
    }
  };

  // 如果需要显示输入框
  if (showInput) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1a0933] via-[#05010c] to-[#0a1229] text-white px-4">
        <div className="absolute inset-0 z-0">
          <AmbientBackground />
        </div>
        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-2xl mb-4">
              123 STUDIO
            </h1>
            <p className="text-purple-300 text-sm">请输ID查看您的纪念徽章</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={inputBadgeId}
                onChange={(e) => setInputBadgeId(e.target.value)}
                placeholder="输入徽章ID"
                className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-lg backdrop-blur-md text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                style={{ fontSize: '16px' }}
                autoFocus
              />
            </div>
            
            {error && (
              <div className="text-red-400 text-sm text-center animate-pulse">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 active:scale-95"
              style={{ fontSize: '16px' }}
            >
              查看徽章
            </button>
          </form>
          
          <div className="mt-6 text-center text-xs text-purple-300/50">
            提示：id在盒子背面
          </div>
        </div>
      </div>
    );
  }

  // 如果还没加载到勋章数据，显示加载中
  if (!currentBadge) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1a0933] via-[#05010c] to-[#0a1229] text-white">
        <div className="animate-pulse text-purple-500">正在加载...</div>
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
          frontImg={currentBadge.frontImg}
          backImg={currentBadge.backImg}
          svgPath={currentBadge.svgPath}
          scale={1.2}
          autoRotate={isAutoRotating}
          themeColor={currentBadge.themeColor}
          onLoadComplete={() => setUiVisible(true)} 
        />
      </div>

      {/* UI 层 */}
      <div className={`relative z-10 w-full h-full flex flex-col justify-between px-3 md:px-4 py-3 md:py-safe pointer-events-none transition-opacity duration-1000 ${uiVisible ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* 顶部 Header */}
        <div className="flex justify-between items-start gap-2 pt-2 md:pt-8">
          <div className="flex-shrink min-w-0">
            <h1 className="text-2xl md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl">
              123<br/>STUDIO
            </h1>
            <div className="mt-2 inline-block px-2 md:px-3 py-1 border border-purple-500/30 rounded-full bg-purple-900/20 backdrop-blur-md">
              <span className="text-[10px] md:text-xs font-mono text-purple-300 tracking-widest">2025年终 · 纪念</span>
            </div>
          </div>

          {/* 右上角：旋转控制按钮 */}
          <div className="pointer-events-auto flex-shrink-0">
            <button 
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              className="flex items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full backdrop-blur-md transition-all text-white/80 hover:text-white group min-w-[44px]"
              aria-label={isAutoRotating ? '暂停旋转' : '开始旋转'}
            >
              {isAutoRotating ? <PauseIcon /> : <PlayIcon />}
              <span className="text-xs font-mono tracking-widest uppercase hidden lg:inline-block">
                {isAutoRotating ? '自动旋转 开启' : '自动旋转 关闭'}
              </span>
            </button>
          </div>
        </div>

        {/* 左上角返回按钮（仅在非URL模式下显示） */}
        {!urlBadgeId && (
          <div className="absolute top-3 left-3 md:top-8 md:left-4 pointer-events-auto">
            <button
              onClick={() => {
                setShowInput(true);
                setSelectedBadgeId(null);
                setInputBadgeId('');
              }}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full backdrop-blur-md transition-all text-white/80 hover:text-white text-xs"
            >
              ← 返回选择
            </button>
          </div>
        )}

        {/* 底部：使用新的 InfoCard 组件 */}
        <InfoCard 
          name={currentBadge.name}
          nickname={currentBadge.nickname}
          joinDate={currentBadge.joinDate}
          letterContent={currentBadge.letterContent}
        >
          {/* 把计时器作为 children 传进去 */}
          <JoinTimer startDate={currentBadge.joinDate} />
        </InfoCard>

      </div>
    </div>
  );
}

// 3. 创建一个新的 default export 组件，包裹 Suspense
export default function SouvenirPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1a0933] via-[#05010c] to-[#0a1229] text-white">
        <div className="animate-pulse text-purple-500">Loading...</div>
      </div>
    }>
      <SouvenirContent />
    </Suspense>
  );
}