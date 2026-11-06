'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

// ==========================================
// 1. 数据配置：情绪箴言与心境模式配色方案
// ==========================================
const QUOTES = [
  '允许一切发生，你已经在尽力做得很好了。',
  '先去把今天的饭吃好，天塌不下来。',
  '不用事事都有交代，对自己交代清楚就行。',
  '停下来休息不是放弃，是在积攒向前跨步的力气。',
  '今天的你不需要完美，普普通通也很珍贵。',
  '把心放宽一点，这世上除了生死，都是擦伤。',
  '不用讨好所有人，你的能量要留给滋养你的人。',
  '慢一点没关系，只要方向是对的，时间就是你的朋友。',
  '今天不想做的事情，今天就可以不做。',
  '外界的声音只是参考，你开心才最重要。',
  '别回头，身后已无风雨；往前走，天地一片澄澈。',
  '你不是机器，感到疲惫是身体在温柔地提醒你歇歇。',
  '不必凡事都争个明白，水至清则无鱼，人糊涂一点更自在。',
  '允许自己有情绪，就像天空允许乌云路过。',
  '做对的事情，不做不对的事情，内心自然安宁。',
  '今天已经过去了，把烦恼留在今晚的梦境之外吧。',
  '人生不是轨道，是一片旷野，你想怎么走都可以。',
  '少一些内耗，多一些平常心，烦恼就追不上你。',
  '去晒晒太阳，吹吹晚风，生活还有很多微小的甜。',
  '把期待降回现实，把善意留给自己。',
];

type ModeKey = 'peace' | 'anti-anxiety' | 'luck' | 'self-love';

interface ModePalette {
  name: string;
  floatWords: string[];
  themeColor: string; // 标题与标签高亮主色
  accentColor: string; // 浅色高光
  badgeBg: string; // 模式标签背景
  glowColor: string; // 环境辉光
  bgGradient: string; // 页面明亮微渐变
  // 木鱼专属拟物配色
  woodGrad: {
    start: string;
    mid: string;
    end: string;
    deep: string;
    shine: string;
    stroke: string;
    innerStroke: string;
  };
  canvasPrimary: string;
}

const MODE_CONFIG: Record<ModeKey, ModePalette> = {
  peace: {
    name: '平静放空',
    floatWords: ['功德+1', '平静+1', '松弛+1', '释怀+1', '知足+1', '清净+1', '呼吸+1'],
    themeColor: 'text-amber-300',
    accentColor: '#f59e0b',
    badgeBg: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
    glowColor: 'rgba(245, 158, 11, 0.28)',
    bgGradient: 'from-[#1e1b18] via-[#161413] to-[#11100f]',
    woodGrad: {
      start: '#93582e',
      mid: '#5e3419',
      end: '#391d0c',
      deep: '#1e0e05',
      shine: '#f5c38c',
      stroke: '#b06f3b',
      innerStroke: '#42220e',
    },
    canvasPrimary: '#f59e0b',
  },
  'anti-anxiety': {
    name: '消灭焦虑',
    floatWords: ['焦虑-1', '内耗-1', '烦恼-1', '班味-1', '疲惫-1', '杂念-1', '戾气-1'],
    themeColor: 'text-emerald-300',
    accentColor: '#10b981',
    badgeBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
    glowColor: 'rgba(16, 185, 129, 0.26)',
    bgGradient: 'from-[#141f1c] via-[#111816] to-[#0c1210]',
    woodGrad: {
      start: '#25745e',
      mid: '#154a3b',
      end: '#0c2e24',
      deep: '#061712',
      shine: '#6ee7b7',
      stroke: '#34d399',
      innerStroke: '#0d382c',
    },
    canvasPrimary: '#10b981',
  },
  luck: {
    name: '好运纳福',
    floatWords: ['好运+1', '暴富+1', '头发+1', '财气+1', '发财+1', '贵人+1', '顺利+1'],
    themeColor: 'text-yellow-300',
    accentColor: '#eab308',
    badgeBg: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300',
    glowColor: 'rgba(234, 179, 8, 0.28)',
    bgGradient: 'from-[#231e13] via-[#1a170d] to-[#120f08]',
    woodGrad: {
      start: '#a16207',
      mid: '#713f12',
      end: '#422006',
      deep: '#200f01',
      shine: '#fef08a',
      stroke: '#eab308',
      innerStroke: '#4d2803',
    },
    canvasPrimary: '#eab308',
  },
  'self-love': {
    name: '善待自己',
    floatWords: ['配得感+1', '被爱+1', '边界感+1', '自信+1', '开心+1', '治愈+1', '自由+1'],
    themeColor: 'text-rose-300',
    accentColor: '#f43f5e',
    badgeBg: 'bg-rose-500/20 border-rose-500/40 text-rose-300',
    glowColor: 'rgba(244, 63, 94, 0.28)',
    bgGradient: 'from-[#24161c] via-[#1c1015] to-[#130a0e]',
    woodGrad: {
      start: '#a23963',
      mid: '#701a40',
      end: '#430b24',
      deep: '#200411',
      shine: '#fbcfe8',
      stroke: '#f472b6',
      innerStroke: '#500e2e',
    },
    canvasPrimary: '#f43f5e',
  },
};

interface FloatingItem {
  id: number;
  text: string;
  color: string;
  offsetX: number;
  offsetY: number;
}

// 获取本地当前 YYYY-MM-DD 日期字符串
const getTodayKey = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
};

export default function CyberMuyuPage() {
  const [count, setCount] = useState<number>(0);
  const [currentMode, setCurrentMode] = useState<ModeKey>('peace');
  const [quoteIndex, setQuoteIndex] = useState<number>(0);
  const [isSoundOn, setIsSoundOn] = useState<boolean>(true);
  const [isAuto, setIsAuto] = useState<boolean>(false);
  const [isTapped, setIsTapped] = useState<boolean>(false);
  const [floatingWords, setFloatingWords] = useState<FloatingItem[]>([]);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [isCopySuccess, setIsCopySuccess] = useState<boolean>(false);
  const [quoteFading, setQuoteFading] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const posterCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const autoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeMode = MODE_CONFIG[currentMode];

  // 跨日自动清零与读取本地存储
  useEffect(() => {
    try {
      const today = getTodayKey();
      const savedDate = localStorage.getItem('muyu_date');
      const savedCount = localStorage.getItem('muyu_count');

      if (!savedDate || savedDate !== today) {
        // 新的一天，跨日自动清零
        setCount(0);
        localStorage.setItem('muyu_date', today);
        localStorage.setItem('muyu_count', '0');
      } else if (savedCount) {
        // 同一天，正常加载今日累计次数
        setCount(parseInt(savedCount, 10) || 0);
      }
    } catch {}
  }, []);

  // Web Audio API 物理木鱼声音合成（根据模式微调基频音色）
  const playWoodSound = useCallback(() => {
    if (!isSoundOn) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          audioCtxRef.current = new AudioCtx();
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      if (!audioCtxRef.current) return;

      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      let modeFreq = 620;
      if (currentMode === 'anti-anxiety') modeFreq = 540;
      if (currentMode === 'luck') modeFreq = 720;
      if (currentMode === 'self-love') modeFreq = 580;

      const baseFreq = modeFreq + (Math.random() * 30 - 15);
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.48, now + 0.13);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(baseFreq, now);
      filter.Q.setValueAtTime(4.2, now);

      gainNode.gain.setValueAtTime(0.95, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);

      // 瞬态打击声
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'sine';
      clickOsc.frequency.setValueAtTime(1150, now);
      clickOsc.frequency.exponentialRampToValueAtTime(220, now + 0.03);

      clickGain.gain.setValueAtTime(0.42, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);

      clickOsc.start(now);
      clickOsc.stop(now + 0.04);
    } catch {}
  }, [isSoundOn, currentMode]);

  // 手机触感震动反馈
  const triggerHaptic = useCallback((ms = 16) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(ms);
      } catch {}
    }
  }, []);

  // 箴言切换动画
  const triggerNextQuote = useCallback(() => {
    setQuoteFading(true);
    setTimeout(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
      setQuoteFading(false);
    }, 150);
  }, []);

  // 敲击动作（同时更新日期保护防跨夜未重置）
  const handleStrike = useCallback(() => {
    playWoodSound();
    triggerHaptic(16);

    setCount((prev) => {
      const today = getTodayKey();
      let currentBase = prev;
      try {
        const savedDate = localStorage.getItem('muyu_date');
        if (savedDate !== today) {
          currentBase = 0; // 跨天时从 0 开始
        }
      } catch {}

      const next = currentBase + 1;
      try {
        localStorage.setItem('muyu_date', today);
        localStorage.setItem('muyu_count', next.toString());
      } catch {}

      if (next % 3 === 0) {
        triggerNextQuote();
      }
      return next;
    });

    setIsTapped(true);
    setTimeout(() => setIsTapped(false), 90);

    const mode = MODE_CONFIG[currentMode];
    const word = mode.floatWords[Math.floor(Math.random() * mode.floatWords.length)];
    const newItem: FloatingItem = {
      id: Date.now() + Math.random(),
      text: word,
      color: mode.themeColor,
      offsetX: (Math.random() - 0.5) * 80,
      offsetY: (Math.random() - 0.5) * 40,
    };

    setFloatingWords((prev) => [...prev, newItem]);
    setTimeout(() => {
      setFloatingWords((prev) => prev.filter((item) => item.id !== newItem.id));
    }, 900);
  }, [currentMode, playWoodSound, triggerHaptic, triggerNextQuote]);

  // 手动清零逻辑
  const handleResetCount = useCallback(() => {
    setCount(0);
    const today = getTodayKey();
    try {
      localStorage.setItem('muyu_date', today);
      localStorage.setItem('muyu_count', '0');
    } catch {}

    triggerHaptic(30);
    setShowResetConfirm(false);

    // 飘出一个“归零放空”的特殊浮词
    const newItem: FloatingItem = {
      id: Date.now(),
      text: '万缘归零 · 从新出发',
      color: 'text-zinc-200',
      offsetX: 0,
      offsetY: -10,
    };
    setFloatingWords((prev) => [...prev, newItem]);
    setTimeout(() => {
      setFloatingWords((prev) => prev.filter((item) => item.id !== newItem.id));
    }, 1100);
  }, [triggerHaptic]);

  // 自动敲击模式
  useEffect(() => {
    if (isAuto) {
      handleStrike();
      autoTimerRef.current = setInterval(() => {
        handleStrike();
      }, 1100);
    } else {
      if (autoTimerRef.current) {
        clearInterval(autoTimerRef.current);
        autoTimerRef.current = null;
      }
    }
    return () => {
      if (autoTimerRef.current) {
        clearInterval(autoTimerRef.current);
      }
    };
  }, [isAuto, handleStrike]);

  // 键盘空格键响应
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        handleStrike();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleStrike]);

  // 生成 Canvas 分享海报
  const drawPoster = useCallback(() => {
    const canvas = posterCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const mode = MODE_CONFIG[currentMode];

    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#23222a');
    bgGrad.addColorStop(0.5, '#17161c');
    bgGrad.addColorStop(1, '#100f14');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    const radGrad = ctx.createRadialGradient(w / 2, 280, 20, w / 2, 280, 280);
    radGrad.addColorStop(0, mode.glowColor);
    radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(26, 26, w - 52, h - 52);

    ctx.strokeStyle = mode.canvasPrimary;
    ctx.globalAlpha = 0.4;
    ctx.strokeRect(32, 32, w - 64, h - 64);
    ctx.globalAlpha = 1.0;

    const now = new Date();
    const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
    const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekStr = weekDays[now.getDay()];

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '22px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${dateStr} · ${weekStr}`, w / 2, 85);

    ctx.fillStyle = mode.canvasPrimary;
    ctx.font = 'bold 36px -apple-system, sans-serif';
    ctx.fillText('赛 博 木 鱼', w / 2, 140);

    ctx.save();
    ctx.beginPath();
    ctx.arc(w / 2, 280, 85, 0, Math.PI * 2);
    ctx.strokeStyle = mode.canvasPrimary;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = mode.canvasPrimary;
    ctx.font = '26px sans-serif';
    ctx.fillText(mode.name, w / 2, 270);

    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#f1f5f9';
    ctx.fillText(`今日累计 ${count} 次`, w / 2, 305);
    ctx.restore();

    const quote = QUOTES[quoteIndex];
    ctx.fillStyle = mode.canvasPrimary;
    ctx.font = '34px sans-serif';
    ctx.fillText('“', w / 2, 440);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '28px "PingFang SC", "Hiragino Sans GB", sans-serif';
    const maxLineWidth = w - 160;
    let line = '';
    let y = 490;
    const lineHeight = 46;

    for (let i = 0; i < quote.length; i++) {
      const testLine = line + quote[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxLineWidth && i > 0) {
        ctx.fillText(line, w / 2, y);
        line = quote[i];
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, w / 2, y);

    ctx.fillStyle = mode.canvasPrimary;
    ctx.fillText('”', w / 2, y + 45);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.moveTo(100, h - 140);
    ctx.lineTo(w - 100, h - 140);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px monospace';
    ctx.fillText('mrduan.me', w / 2, h - 95);

    ctx.font = '16px -apple-system, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('平常心 · 莫向外求', w / 2, h - 65);
  }, [count, quoteIndex, currentMode]);

  useEffect(() => {
    if (isShareOpen) {
      setTimeout(drawPoster, 60);
    }
  }, [isShareOpen, drawPoster]);

  const handleCopyQuote = () => {
    const textToCopy = `【今日情绪解药】\n"${QUOTES[quoteIndex]}"\n—— 今日敲木鱼 ${count} 次 (mrduan.me)`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setIsCopySuccess(true);
        setTimeout(() => setIsCopySuccess(false), 2000);
      });
    }
  };

  const handleSaveImage = () => {
    const canvas = posterCanvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `木鱼解药_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
    } catch {}
  };

  const wood = activeMode.woodGrad;

  return (
    <div
      className={`h-[100dvh] w-full bg-gradient-to-b ${activeMode.bgGradient} text-zinc-100 flex flex-col justify-between items-center relative overflow-hidden select-none font-sans transition-colors duration-700`}
    >
      {/* 背景动态光晕 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div
          className="w-96 h-96 rounded-full blur-[110px] transition-all duration-700 opacity-90 scale-110"
          style={{ backgroundColor: activeMode.glowColor }}
        />
        <div className="absolute -top-16 w-80 h-80 rounded-full bg-white/5 blur-[90px]" />
      </div>

      {/* 顶部控制栏与模式切换 */}
      <header className="w-full max-w-md px-5 pt-4 z-20 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full animate-ping"
              style={{ backgroundColor: activeMode.accentColor }}
            />
            <span className="text-xs uppercase tracking-widest text-zinc-300 font-semibold drop-shadow-sm">
              情绪木鱼
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* 音效开关 */}
            <button
              onClick={() => setIsSoundOn(!isSoundOn)}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 flex items-center justify-center text-zinc-200 hover:text-white transition active:scale-95 shadow-sm"
              title="音效切换"
            >
              {isSoundOn ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              )}
            </button>

            {/* 自动敲击 */}
            <button
              onClick={() => setIsAuto(!isAuto)}
              className={`px-3 h-9 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border flex items-center gap-1.5 text-xs transition active:scale-95 shadow-sm ${
                isAuto
                  ? 'border-white/40 text-white font-medium bg-white/20'
                  : 'border-white/15 text-zinc-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isAuto ? 'animate-pulse' : 'bg-zinc-400'
                }`}
                style={{ backgroundColor: isAuto ? activeMode.accentColor : undefined }}
              />
              <span>自动敲</span>
            </button>

            {/* 分享海报 */}
            <button
              onClick={() => setIsShareOpen(true)}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 flex items-center justify-center text-zinc-200 hover:text-white transition active:scale-95 shadow-sm"
              title="生成今日签"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>

        {/* 4 种心境模式切换胶囊 */}
        <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/15 text-center text-xs shadow-md">
          {(Object.keys(MODE_CONFIG) as ModeKey[]).map((key) => {
            const isActive = currentMode === key;
            const item = MODE_CONFIG[key];
            return (
              <button
                key={key}
                onClick={() => setCurrentMode(key)}
                className={`py-1.5 rounded-xl transition-all duration-300 font-medium ${
                  isActive
                    ? `${item.badgeBg} border shadow-sm scale-102`
                    : 'text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </div>
      </header>

      {/* 核心敲击交互区 */}
      <main className="w-full max-w-md flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        {/* 今日累计计数器 & 清零重置功能 */}
        <div className="mb-4 text-center relative flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-zinc-400 font-medium mb-0.5">
            <span>今日累计</span>

            {/* 清零按钮 */}
            {count > 0 && !showResetConfirm && (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-zinc-200 transition active:scale-90 border border-white/5"
                title="清零重置今日计数"
              >
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-[10px]">清零</span>
              </button>
            )}

            {/* 清零二次确认胶囊 */}
            {showResetConfirm && (
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-500/20 border border-red-500/40 text-[10px] animate-fadeIn">
                <span className="text-red-300">确定清零?</span>
                <button
                  onClick={handleResetCount}
                  className="font-bold text-red-200 hover:text-white underline active:scale-95"
                >
                  是
                </button>
                <span className="text-zinc-500">/</span>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="text-zinc-400 hover:text-zinc-200 active:scale-95"
                >
                  否
                </button>
              </div>
            )}
          </div>

          <div className="text-5xl font-extralight tracking-tight text-white flex items-center justify-center gap-1.5 font-mono drop-shadow-md">
            <span>{count.toLocaleString()}</span>
            <span
              className="text-xs font-semibold px-1.5 py-0.5 rounded-md bg-white/10"
              style={{ color: activeMode.accentColor }}
            >
              次
            </span>
          </div>
        </div>

        {/* 木鱼主体点击区 */}
        <div
          onPointerDown={handleStrike}
          className={`relative cursor-pointer py-4 px-6 flex items-center justify-center transition-transform duration-75 select-none ${
            isTapped ? 'scale-90 -rotate-2' : 'scale-100'
          }`}
        >
          {/* 飘字升腾效果 */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible">
            {floatingWords.map((item) => (
              <div
                key={item.id}
                style={{
                  transform: `translate(${item.offsetX}px, ${item.offsetY}px)`,
                }}
                className={`absolute font-extrabold text-xl tracking-wider ${item.color} pointer-events-none animate-bounce drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]`}
              >
                {item.text}
              </div>
            ))}
          </div>

          {/* 模式专属多色彩 SVG 木鱼 */}
          <div className="relative w-60 h-52 sm:w-68 sm:h-60 filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.65)] transition-all duration-500">
            <svg viewBox="0 0 200 160" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="dynamicWoodGrad" cx="35%" cy="30%" r="72%">
                  <stop offset="0%" stopColor={wood.start} />
                  <stop offset="42%" stopColor={wood.mid} />
                  <stop offset="82%" stopColor={wood.end} />
                  <stop offset="100%" stopColor={wood.deep} />
                </radialGradient>

                <linearGradient id="dynamicShineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={wood.shine} stopOpacity="0.8" />
                  <stop offset="40%" stopColor={wood.shine} stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </linearGradient>
              </defs>

              <ellipse cx="100" cy="142" rx="74" ry="13" fill="rgba(0,0,0,0.45)" />

              <path
                d="M 45 130 C 18 115, 12 75, 32 45 C 52 15, 110 12, 145 28 C 178 42, 192 82, 182 110 C 172 135, 135 145, 95 142 C 68 140, 52 135, 45 130 Z"
                fill="url(#dynamicWoodGrad)"
                stroke={wood.stroke}
                strokeWidth="2.5"
                className="transition-all duration-500"
              />

              <path
                d="M 48 48 C 65 24, 108 22, 138 34 C 152 40, 160 52, 160 62 C 130 38, 75 35, 48 48 Z"
                fill="url(#dynamicShineGrad)"
                className="transition-all duration-500"
              />

              <path
                d="M 50 115 C 80 126, 125 125, 155 102 C 145 110, 105 118, 55 110 C 52 112, 50 114, 50 115 Z"
                fill="#07070a"
                stroke={wood.innerStroke}
                strokeWidth="2"
                className="transition-all duration-500"
              />

              <path
                d="M 68 85 C 80 95, 105 95, 120 85"
                fill="none"
                stroke={wood.innerStroke}
                strokeWidth="3.5"
                strokeLinecap="round"
                className="transition-all duration-500"
              />
              <circle cx="68" cy="85" r="4.5" fill={wood.innerStroke} className="transition-all duration-500" />
              <circle cx="120" cy="85" r="4.5" fill={wood.innerStroke} className="transition-all duration-500" />

              <circle
                cx="100"
                cy="72"
                r="18"
                fill={isTapped ? activeMode.accentColor : 'transparent'}
                opacity={isTapped ? 0.6 : 0}
                className="transition-all duration-150"
              />
            </svg>

            {/* 拟物木槌 */}
            <div
              style={{
                transform: isTapped ? 'rotate(-16deg) scale(0.95)' : 'rotate(12deg) scale(1)',
                transformOrigin: 'bottom right',
              }}
              className="absolute -top-3 -right-3 w-14 h-14 pointer-events-none transition-transform duration-100"
            >
              <svg viewBox="0 0 60 60" className="w-full h-full opacity-90 drop-shadow-md">
                <line x1="50" y1="50" x2="18" y2="18" stroke="#a0714f" strokeWidth="5" strokeLinecap="round" />
                <circle cx="15" cy="15" r="9" fill={wood.shine} stroke="#854d0e" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="mt-2 text-zinc-300 text-xs tracking-wider flex items-center gap-1.5 animate-pulse drop-shadow-sm font-medium">
          <span>轻触木鱼 · 放下万缘</span>
        </div>
      </main>

      {/* 底部卡片区：带有情绪价值的话语 */}
      <footer className="w-full max-w-md px-5 pb-6 pt-2 z-20">
        <div className="bg-white/10 hover:bg-white/[0.13] backdrop-blur-xl border border-white/20 rounded-2xl p-4 relative overflow-hidden shadow-xl transition-all duration-300">
          <div
            className="absolute top-0 left-0 right-0 h-[2px] transition-colors duration-500"
            style={{
              background: `linear-gradient(to right, transparent, ${activeMode.accentColor}, transparent)`,
            }}
          />

          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-1.5">
              <span style={{ color: activeMode.accentColor }}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </span>
              <span
                className="text-xs font-semibold tracking-wider transition-colors duration-300"
                style={{ color: activeMode.accentColor }}
              >
                今日情绪解药 · {activeMode.name}
              </span>
            </div>

            <button
              onClick={triggerNextQuote}
              className="text-xs text-zinc-300 hover:text-white flex items-center gap-1 transition active:scale-95 bg-white/10 hover:bg-white/15 px-2 py-0.5 rounded-lg border border-white/10"
            >
              <span>换一剂</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <div className={`min-h-[50px] flex items-center transition-opacity duration-200 ${quoteFading ? 'opacity-0' : 'opacity-100'}`}>
            <p className="text-sm text-zinc-100 leading-relaxed font-normal">{QUOTES[quoteIndex]}</p>
          </div>

          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400">
            <span>随敲击随机换签</span>
            <span className="text-zinc-300 font-mono font-medium tracking-wider">mrduan.me</span>
          </div>
        </div>
      </footer>

      {/* 分享海报弹窗 */}
      {isShareOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-zinc-900/95 border border-white/20 p-5 flex flex-col items-center shadow-2xl">
            <div className="w-full flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-zinc-200">今日禅意签</span>
              <button
                onClick={() => setIsShareOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-zinc-300 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="w-full rounded-2xl overflow-hidden shadow-2xl bg-zinc-950 border border-white/15">
              <canvas ref={posterCanvasRef} width={600} height={900} className="w-full h-auto block" />
            </div>

            <div className="w-full mt-4 flex gap-2">
              <button
                onClick={handleCopyQuote}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-xs font-medium text-zinc-200 hover:bg-white/20 transition flex items-center justify-center gap-1.5 border border-white/10"
              >
                <span>{isCopySuccess ? '已复制！' : '复制箴言'}</span>
              </button>
              <button
                onClick={handleSaveImage}
                style={{ backgroundColor: activeMode.accentColor }}
                className="flex-1 py-2.5 rounded-xl text-black font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-black/30 hover:brightness-110"
              >
                <span>保存海报</span>
              </button>
            </div>
            <p className="text-[10px] text-zinc-400 mt-2">长按或点击保存，即可直接分享到社交圈</p>
          </div>
        </div>
      )}
    </div>
  );
}