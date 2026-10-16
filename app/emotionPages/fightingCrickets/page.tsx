'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
// 在 Next.js 项目的 components/emotionPages/cyberCricket/ 目录下使用时，可取消下方注释直接引入同级样式文件：
// import './cyber-cricket.css';

type CricketId = 'fire' | 'rock' | 'wind' | 'void' | 'light';
type SelectionSlot = CricketId | 'random';
type Side = 'p1' | 'p2';

interface CricketSpec {
  id: CricketId;
  name: string;
  title: string;
  icon: string;
  color: string;
  secondaryColor: string;
  glowColor: string;
  radius: number;
  baseSpeed: number;
  mass: number;
  maxHp: number;
  baseAtk: number;
  wallSkillDesc: string;
  clashSkillDesc: string;
}

const CRICKETS: Record<CricketId, CricketSpec> = {
  fire: {
    id: 'fire',
    name: '绯樱暴君',
    title: '元气 · 冲刺',
    icon: '🌸',
    color: '#ff7597',
    secondaryColor: '#ffd6e0',
    glowColor: 'rgba(255, 117, 151, 0.42)',
    radius: 34,
    baseSpeed: 1.45,
    mass: 1.05,
    maxHp: 320,
    baseAtk: 26,
    wallSkillDesc: '碰壁叠加花焰加速，越跑越快',
    clashSkillDesc: '借冲刺势能把对手重重弹开',
  },
  rock: {
    id: 'rock',
    name: '琥珀重装',
    title: '暖阳 · 守护',
    icon: '🍯',
    color: '#f5a65b',
    secondaryColor: '#ffecc8',
    glowColor: 'rgba(245, 166, 91, 0.42)',
    radius: 41,
    baseSpeed: 1.1,
    mass: 1.65,
    maxHp: 420,
    baseAtk: 22,
    wallSkillDesc: '多次碰壁张开暖阳护盾并震出减速波',
    clashSkillDesc: '身板厚重减免伤害，并反弹一部分冲击力',
  },
  wind: {
    id: 'wind',
    name: '晴空幻影',
    title: '轻风 · 分身',
    icon: '🦋',
    color: '#6ec6ff',
    secondaryColor: '#dcf2ff',
    glowColor: 'rgba(110, 198, 255, 0.45)',
    radius: 28,
    baseSpeed: 1.9,
    mass: 0.78,
    maxHp: 270,
    baseAtk: 19,
    wallSkillDesc: '碰壁有概率唤出小分身一起围殴对手',
    clashSkillDesc: '碰撞触发微风酥麻，短暂打断对手节奏',
  },
  void: {
    id: 'void',
    name: '星云黑洞',
    title: '微醺 · 汲取',
    icon: '🔮',
    color: '#b388eb',
    secondaryColor: '#ede0ff',
    glowColor: 'rgba(179, 136, 235, 0.45)',
    radius: 35,
    baseSpeed: 1.3,
    mass: 1.18,
    maxHp: 350,
    baseAtk: 23,
    wallSkillDesc: '碰壁释放星云引力，把对手轻轻拉向自己',
    clashSkillDesc: '碰撞攻击的同时汲取元气，恢复自身体力',
  },
  light: {
    id: 'light',
    name: '薄荷棱镜',
    title: '星光 · 折射',
    icon: '✨',
    color: '#5cd6a9',
    secondaryColor: '#d8faed',
    glowColor: 'rgba(92, 214, 169, 0.45)',
    radius: 29,
    baseSpeed: 1.6,
    mass: 0.85,
    maxHp: 285,
    baseAtk: 20,
    wallSkillDesc: '每次碰壁折射出柔光射线，远距离消耗对手',
    clashSkillDesc: '交锋时轻巧弹开，并在原地留下一颗星光泡泡',
  },
};

const CRICKET_LIST: CricketSpec[] = Object.values(CRICKETS);

const EMOTION_STAKES = [
  { id: 'luck', label: '✨ 今日好运加持', winQuote: '好运已签收！今天连微风都是甜的，诸事顺遂～', loseQuote: '小圆球替你挡掉了今天唯一的小水逆，接下来全是好事！' },
  { id: 'relax', label: '🧘 烦恼原地清零', winQuote: '刚才那波漂亮反击，已经把不开心统统撞碎啦！', loseQuote: '胜负只是小插曲，伸个懒腰，今天也要对自己温柔一点～' },
  { id: 'offwork', label: '🍹 准时下班开溜', winQuote: '元气拉满！今天顺顺利利，到点立刻快乐收工！', loseQuote: '休息片刻充充电，轻松快乐的心情已经提前到账啦！' },
];

interface FighterEntity {
  side: Side;
  spec: CricketSpec;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  shield: number;
  nitroStacks: number;
  wallCount: number;
  berserkTimer: number;
  slowTimer: number;
  stunTimer: number;
  invulnTimer: number;
  rotation: number;
  trail: Array<{ x: number; y: number; r: number; alpha: number; color: string }>;
}

interface CloneOrb {
  owner: Side;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  color: string;
}

interface LaserBeam {
  owner: Side;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  life: number;
  maxLife: number;
  color: string;
}

interface PrismMine {
  owner: Side;
  x: number;
  y: number;
  radius: number;
  timer: number;
  maxTimer: number;
  color: string;
}

interface ShockwaveRing {
  x: number;
  y: number;
  r: number;
  maxR: number;
  color: string;
  alpha: number;
  lineWidth: number;
  inward?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  alpha: number;
  decay: number;
}

interface FloatingText {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  scale: number;
  alpha: number;
}

const CRICKET_STYLES = `/* ==========================================================================
   元气电子斗蛐蛐 · 柔和奶油马卡龙主题 (Soft Pastel & Minimalist Theme)
   路径建议: components/emotionPages/cyberCricket/cyber-cricket.css
   ========================================================================== */

:root {
  --cc-bg-page: #fdf8fa;
  --cc-bg-shell: #fffcfd;
  --cc-bg-card: #ffffff;
  --cc-bg-soft: #faf2f6;
  --cc-border-subtle: #f2e2ea;
  --cc-text-main: #4a3a45;
  --cc-text-dim: #9b8794;
  --cc-accent-pink: #ff85a1;
  --cc-accent-peach: #ffa894;
  --cc-accent-lavender: #b392f0;
  --cc-accent-mint: #68d391;
  --cc-accent-sky: #6ec6ff;
}

.cc-viewport-wrapper {
  width: 100%;
  min-height: 100dvh;
  background: linear-gradient(155deg, #fff9fb 0%, #fdf0f5 50%, #f4f0ff 100%);
  color: var(--cc-text-main);
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-x: hidden;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

.cc-mobile-shell {
  width: 100%;
  max-width: 420px;
  min-height: 100dvh;
  background: var(--cc-bg-shell);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  box-shadow: 0 16px 48px rgba(198, 152, 176, 0.22);
}

@media (min-width: 480px) {
  .cc-viewport-wrapper {
    padding: 14px 0;
  }
  .cc-mobile-shell {
    min-height: min(840px, 94dvh);
    height: min(840px, 94dvh);
    border-radius: 34px;
    border: 2px solid #f7e8f0;
  }
}

/* 顶部极简导航栏 */
.cc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px 10px;
  background: rgba(255, 252, 253, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--cc-border-subtle);
  z-index: 20;
}

.cc-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cc-brand-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 99px;
  background: #ffe5ec;
  color: #e85d80;
}

.cc-brand-title {
  font-size: 15px;
  font-weight: 800;
  color: var(--cc-text-main);
  letter-spacing: 0.3px;
}

.cc-header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cc-icon-btn {
  background: var(--cc-bg-soft);
  border: 1px solid var(--cc-border-subtle);
  color: var(--cc-text-main);
  border-radius: 999px;
  padding: 5px 11px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.18s ease;
}

.cc-icon-btn:hover {
  background: #f5e6ee;
}

.cc-icon-btn:active {
  transform: scale(0.96);
}

/* 备战选角大厅 */
.cc-lobby {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px 16px 16px;
  gap: 10px;
  overflow-y: auto;
}

/* 1v1 柔和展示台 */
.cc-vs-stage {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 8px;
  background: linear-gradient(180deg, #fff7fa 0%, #ffffff 100%);
  border: 1px solid var(--cc-border-subtle);
  border-radius: 22px;
  padding: 12px 10px;
  box-shadow: 0 4px 16px rgba(218, 175, 196, 0.12);
}

.cc-slot-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 6px;
  border-radius: 18px;
  background: #ffffff;
  border: 1.5px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cc-slot-tag {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 9px;
  border-radius: 99px;
  margin-bottom: 8px;
}

.cc-orb-preview {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  position: relative;
  margin-bottom: 6px;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cc-slot-card:hover .cc-orb-preview {
  transform: scale(1.06);
}

.cc-vs-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.cc-vs-badge {
  font-size: 14px;
  font-weight: 800;
  color: #d8a2b8;
  letter-spacing: 1px;
}

/* 统一柔和卡片容器 */
.cc-bet-box {
  background: var(--cc-bg-card);
  border: 1px solid var(--cc-border-subtle);
  border-radius: 20px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 9px;
  box-shadow: 0 4px 14px rgba(218, 175, 196, 0.08);
}

.cc-section-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--cc-text-dim);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cc-bet-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.cc-bet-btn {
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid var(--cc-border-subtle);
  background: var(--cc-bg-soft);
  color: var(--cc-text-main);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.18s ease;
}

.cc-bet-btn.selected-p1 {
  background: #eaf6ff;
  border-color: #8fd3ff;
  color: #2b7bb9;
}

.cc-bet-btn.selected-p2 {
  background: #fff0f4;
  border-color: #ffa6bd;
  color: #d94b72;
}

/* 蛐蛐圆球选择网格 */
.cc-roster-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.cc-cricket-option {
  background: #fcf8fa;
  border: 1.5px solid #f3e6ed;
  border-radius: 16px;
  padding: 8px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.16s ease;
  text-align: center;
}

.cc-cricket-option:hover {
  background: #fff2f7;
}

.cc-cricket-option:active {
  transform: scale(0.96);
}

.cc-mini-orb {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  margin-bottom: 4px;
}

/* 极简技能说明条 */
.cc-detail-card {
  background: #fdf6f9;
  border-radius: 14px;
  padding: 9px 12px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--cc-text-main);
}

/* 底部开战柔和渐变按钮 */
.cc-start-btn {
  margin-top: auto;
  width: 100%;
  padding: 14px;
  border-radius: 99px;
  border: none;
  background: linear-gradient(135deg, #ff85a1 0%, #ffa894 100%);
  color: #ffffff;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.5px;
  cursor: pointer;
  box-shadow: 0 8px 22px rgba(255, 133, 161, 0.35);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.cc-start-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 26px rgba(255, 133, 161, 0.45);
}

.cc-start-btn:active {
  transform: scale(0.98);
}

/* 战斗舞台层 */
.cc-arena-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 10px 14px 14px;
  gap: 8px;
  position: relative;
}

.cc-hud-top {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  border: 1px solid var(--cc-border-subtle);
  border-radius: 18px;
  padding: 9px 12px;
  box-shadow: 0 4px 12px rgba(218, 175, 196, 0.1);
}

.cc-hp-bar-track {
  width: 100%;
  height: 9px;
  background: #f5ebf0;
  border-radius: 99px;
  overflow: hidden;
  position: relative;
}

.cc-hp-bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.15s ease-out;
}

.cc-timer-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 轻柔解说气泡条 */
.cc-commentary-banner {
  background: #fff5f8;
  border: 1px solid #f8dce6;
  border-radius: 99px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  color: #7d5a6d;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 30px;
}

/* 奶油果冻风物理擂台容器 */
.cc-canvas-wrap {
  flex: 1;
  width: 100%;
  min-height: 350px;
  position: relative;
  border-radius: 26px;
  overflow: hidden;
  background: radial-gradient(circle at 50% 45%, #ffffff 0%, #fdf4f8 75%, #f7e6ef 100%);
  border: 2px solid #f3dce7;
  box-shadow: inset 0 0 30px rgba(235, 195, 215, 0.28);
}

.cc-canvas-wrap.sudden-death {
  border-color: #ff9ebb;
  box-shadow: inset 0 0 36px rgba(255, 141, 161, 0.25);
}

.cc-canvas-wrap.screen-shake {
  animation: cc-shake 0.2s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

/* 底部蓄力助威按钮 */
.cc-controls-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cc-berserk-btn {
  flex: 1;
  position: relative;
  overflow: hidden;
  padding: 13px 16px;
  border-radius: 99px;
  border: none;
  background: linear-gradient(135deg, #ff85a1 0%, #ffb38a 100%);
  color: #ffffff;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 6px 18px rgba(255, 133, 161, 0.35);
  transition: all 0.15s ease;
  touch-action: manipulation;
}

.cc-berserk-btn.charging {
  transform: scale(0.97);
  box-shadow: 0 0 24px rgba(255, 133, 161, 0.65);
}

.cc-berserk-btn.used {
  background: #f3eaf0;
  color: #b5a2ae;
  box-shadow: none;
  cursor: not-allowed;
}

.cc-charge-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.35);
  pointer-events: none;
  transition: width 0.05s linear;
}

/* 柔和结算弹窗 */
.cc-result-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 248, 251, 0.78);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 40;
  animation: cc-fade-in 0.25s ease-out;
}

.cc-result-card {
  width: 100%;
  background: #ffffff;
  border: 1.5px solid #f5dce8;
  border-radius: 26px;
  padding: 22px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 16px 40px rgba(196, 148, 172, 0.22);
}

@keyframes cc-shake {
  10%, 90% { transform: translate3d(-1.5px, 1px, 0); }
  20%, 80% { transform: translate3d(2px, -1.5px, 0); }
  30%, 50%, 70% { transform: translate3d(-2.5px, 1.5px, 0); }
  40%, 60% { transform: translate3d(2.5px, -1px, 0); }
}

@keyframes cc-fade-in {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}
`;

export default function CyberCricketPage() {
  const [phase, setPhase] = useState<'lobby' | 'battle'>('lobby');
  const [editingSide, setEditingSide] = useState<Side>('p1');
  const [p1Slot, setP1Slot] = useState<SelectionSlot>('fire');
  const [p2Slot, setP2Slot] = useState<SelectionSlot>('random');
  const [betSide, setBetSide] = useState<Side>('p1');
  const [stakeId, setStakeId] = useState<string>('luck');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  const [actualP1, setActualP1] = useState<CricketSpec>(CRICKETS.fire);
  const [actualP2, setActualP2] = useState<CricketSpec>(CRICKETS.wind);
  const [hudState, setHudState] = useState({
    p1HpPct: 100,
    p1Berserk: false,
    p2HpPct: 100,
    p2Berserk: false,
    suddenDeath: false,
  });

  const [commentary, setCommentary] = useState<string>('🌸 选两颗喜欢的果冻圆球，开启轻松解压小对决～');
  const [screenShake, setScreenShake] = useState<boolean>(false);

  const [berserkUsed, setBerserkUsed] = useState<boolean>(false);
  const [isChargingBerserk, setIsChargingBerserk] = useState<boolean>(false);
  const [chargeProgress, setChargeProgress] = useState<number>(0);

  const [battleResult, setBattleResult] = useState<{
    winner: Side;
    betWon: boolean;
    reason: string;
    mvpTitle: string;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundEnabledRef = useRef<boolean>(true);
  const chargeTimerRef = useRef<number | null>(null);
  const chargeValRef = useRef<number>(0);
  const isChargingRef = useRef<boolean>(false);
  const berserkUsedRef = useRef<boolean>(false);
  const betSideRef = useRef<Side>('p1');

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    betSideRef.current = betSide;
  }, [betSide]);

  // 轻柔治愈系音效合成 (Soft Marimba / Bubble Chime Web Audio)
  const playSfx = useCallback(
    (type: 'wall' | 'clash' | 'skill' | 'laser' | 'berserk' | 'explosion' | 'win' | 'charge') => {
      if (!soundEnabledRef.current) return;
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const now = ctx.currentTime;

        if (type === 'wall') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(340 + Math.random() * 80, now);
          osc.frequency.exponentialRampToValueAtTime(480, now + 0.08);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.08);
        } else if (type === 'clash') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(280, now);
          osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);
          gain.gain.setValueAtTime(0.14, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.12);
        } else if (type === 'laser' || type === 'skill') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(520, now);
          osc.frequency.exponentialRampToValueAtTime(760, now + 0.14);
          gain.gain.setValueAtTime(0.09, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.14);
        } else if (type === 'explosion') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(90, now + 0.18);
          gain.gain.setValueAtTime(0.14, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.18);
        } else if (type === 'charge') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(330, now);
          osc.frequency.linearRampToValueAtTime(660, now + 0.35);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.35);
        } else if (type === 'berserk' || type === 'win') {
          [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.07);
            gain.gain.setValueAtTime(0.11, now + idx * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.28);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.07);
            osc.stop(now + idx * 0.07 + 0.28);
          });
        }
      } catch {
        // 忽略音频自动播放限制
      }
    },
    []
  );

  const triggerShake = useCallback(() => {
    setScreenShake(true);
    window.setTimeout(() => setScreenShake(false), 200);
  }, []);

  const engineRef = useRef<{
    p1: FighterEntity | null;
    p2: FighterEntity | null;
    clones: CloneOrb[];
    lasers: LaserBeam[];
    mines: PrismMine[];
    rings: ShockwaveRing[];
    particles: Particle[];
    texts: FloatingText[];
    hitStopFrames: number;
    timeLeft: number;
    finished: boolean;
    triggerBerserkNow: (powerBonus: number) => void;
  }>({
    p1: null,
    p2: null,
    clones: [],
    lasers: [],
    mines: [],
    rings: [],
    particles: [],
    texts: [],
    hitStopFrames: 0,
    timeLeft: 40,
    finished: false,
    triggerBerserkNow: () => {
      return;
    },
  });

  const pickRandomCricket = (excludeId?: CricketId): CricketSpec => {
    const pool = excludeId ? CRICKET_LIST.filter((c) => c.id !== excludeId) : CRICKET_LIST;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const handleRandomizeBoth = () => {
    const first = pickRandomCricket();
    const second = pickRandomCricket(first.id);
    setP1Slot(first.id);
    setP2Slot(second.id);
    playSfx('skill');
  };

  const startBattle = () => {
    const chosenP1 = p1Slot === 'random' ? pickRandomCricket() : CRICKETS[p1Slot];
    const chosenP2 = p2Slot === 'random' ? pickRandomCricket(chosenP1.id) : CRICKETS[p2Slot];

    setActualP1(chosenP1);
    setActualP2(chosenP2);
    setBerserkUsed(false);
    berserkUsedRef.current = false;
    setIsChargingBerserk(false);
    isChargingRef.current = false;
    setChargeProgress(0);
    chargeValRef.current = 0;
    setBattleResult(null);

    setHudState({
      p1HpPct: 100,
      p1Berserk: false,
      p2HpPct: 100,
      p2Berserk: false,
      suddenDeath: false,
    });

    const betTargetName = betSide === 'p1' ? chosenP1.name : chosenP2.name;
    setCommentary(`✨ 对决开始！正在为【${betTargetName}】加油助威～`);
    playSfx('berserk');
    setPhase('battle');
  };

  const handleBerserkStart = () => {
    if (berserkUsedRef.current || phase !== 'battle' || battleResult) return;
    isChargingRef.current = true;
    setIsChargingBerserk(true);
    chargeValRef.current = 0.2;
    setChargeProgress(20);
    playSfx('charge');

    if (chargeTimerRef.current) {
      window.clearInterval(chargeTimerRef.current);
    }
    chargeTimerRef.current = window.setInterval(() => {
      if (!isChargingRef.current) return;
      chargeValRef.current = Math.min(1, chargeValRef.current + 0.08);
      setChargeProgress(Math.round(chargeValRef.current * 100));
      if (chargeValRef.current >= 1) {
        handleBerserkRelease();
      }
    }, 60);
  };

  const handleBerserkRelease = () => {
    if (!isChargingRef.current || berserkUsedRef.current) return;
    isChargingRef.current = false;
    setIsChargingBerserk(false);
    if (chargeTimerRef.current) {
      window.clearInterval(chargeTimerRef.current);
      chargeTimerRef.current = null;
    }
    const powerBonus = 1 + chargeValRef.current * 0.35;
    berserkUsedRef.current = true;
    setBerserkUsed(true);
    setChargeProgress(100);
    engineRef.current.triggerBerserkNow(powerBonus);
  };

  // 柔和奶油风 Canvas 物理与技能循环
  useEffect(() => {
    if (phase !== 'battle') return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = wrap.clientWidth || 360;
    let height = wrap.clientHeight || 420;

    const updateSize = () => {
      if (!wrap || !canvas) return;
      const rect = wrap.getBoundingClientRect();
      width = Math.max(280, Math.floor(rect.width));
      height = Math.max(330, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    const angle1 = (Math.random() * 0.6 - 0.3) + 0.35;
    const angle2 = Math.PI + (Math.random() * 0.6 - 0.3) - 0.35;

    const createFighter = (side: Side, spec: CricketSpec, startX: number, startY: number, ang: number): FighterEntity => ({
      side,
      spec,
      x: startX,
      y: startY,
      vx: Math.cos(ang) * spec.baseSpeed,
      vy: Math.sin(ang) * spec.baseSpeed,
      radius: spec.radius,
      hp: spec.maxHp,
      maxHp: spec.maxHp,
      shield: spec.id === 'rock' ? 30 : 0,
      nitroStacks: 0,
      wallCount: 0,
      berserkTimer: 0,
      slowTimer: 0,
      stunTimer: 0,
      invulnTimer: 0,
      rotation: 0,
      trail: [],
    });

    const p1 = createFighter('p1', actualP1, width * 0.28, height * 0.38, angle1);
    const p2 = createFighter('p2', actualP2, width * 0.72, height * 0.62, angle2);

    const state = engineRef.current;
    state.p1 = p1;
    state.p2 = p2;
    state.clones = [];
    state.lasers = [];
    state.mines = [];
    state.rings = [];
    state.particles = [];
    state.texts = [];
    state.hitStopFrames = 0;
    state.timeLeft = 40;
    state.finished = false;

    const spawnParticles = (x: number, y: number, color: string, count = 8, speedMul = 0.75) => {
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = (1.0 + Math.random() * 2.4) * speedMul;
        state.particles.push({
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          r: 2.5 + Math.random() * 2.5,
          color,
          alpha: 0.9,
          decay: 0.025 + Math.random() * 0.018,
        });
      }
    };

    const addFloatingText = (x: number, y: number, text: string, color: string, scale = 1) => {
      state.texts.push({
        x: Math.max(42, Math.min(width - 42, x)),
        y: Math.max(28, Math.min(height - 20, y)),
        vy: -1.0,
        text,
        color,
        scale,
        alpha: 1,
      });
    };

    const applyDamage = (attacker: FighterEntity, defender: FighterEntity, rawDmg: number, effectLabel = '') => {
      let dmg = Math.max(4, Math.round(rawDmg));
      if (state.timeLeft <= 15) {
        dmg = Math.round(dmg * 1.35);
      }
      if (defender.berserkTimer > 0) {
        dmg = Math.round(dmg * 0.72);
      }
      if (defender.spec.id === 'rock') {
        dmg = Math.round(dmg * 0.75);
      }

      if (defender.shield > 0) {
        const absorbed = Math.min(defender.shield, dmg);
        defender.shield -= absorbed;
        dmg -= absorbed;
        if (absorbed > 0 && effectLabel) {
          addFloatingText(defender.x, defender.y - defender.radius - 8, '护盾抵挡', '#e09145', 0.95);
        }
      }

      if (dmg > 0) {
        defender.hp = Math.max(0, defender.hp - dmg);
        if (effectLabel) {
          addFloatingText(
            defender.x,
            defender.y - defender.radius - 10,
            effectLabel,
            attacker.berserkTimer > 0 ? '#ff6b8b' : attacker.spec.color,
            dmg >= 38 ? 1.18 : 1.0
          );
        }
      }
      return dmg;
    };

    const triggerWallSkill = (fighter: FighterEntity, enemy: FighterEntity, forceUltimate = false) => {
      fighter.wallCount += 1;
      const spec = fighter.spec;

      if (spec.id === 'fire') {
        const prev = fighter.nitroStacks;
        fighter.nitroStacks = Math.min(3, fighter.nitroStacks + (forceUltimate ? 2 : 1));
        const boost = 1.04 + fighter.nitroStacks * 0.04;
        fighter.vx *= boost;
        fighter.vy *= boost;
        spawnParticles(fighter.x, fighter.y, spec.color, 7, 0.8);
        if (fighter.nitroStacks > prev) {
          addFloatingText(fighter.x, fighter.y - 24, '🌸花焰加速', '#e85d80', 0.95);
        }
        if (fighter.nitroStacks === 3) {
          setCommentary(`🌸【${spec.name}】花焰蓄满，下一撞元气满满！`);
        }
      } else if (spec.id === 'rock') {
        if (forceUltimate || fighter.wallCount % 3 === 0) {
          fighter.shield = Math.min(110, fighter.shield + 50);
          state.rings.push({
            x: fighter.x,
            y: fighter.y,
            r: fighter.radius,
            maxR: 145,
            color: '#f5a65b',
            alpha: 0.75,
            lineWidth: 3.5,
          });
          const dist = Math.hypot(enemy.x - fighter.x, enemy.y - fighter.y);
          if (dist <= 155) {
            enemy.slowTimer = 2.2;
            enemy.vx *= 0.7;
            enemy.vy *= 0.7;
            applyDamage(fighter, enemy, 14, '柔波减速');
          }
          playSfx('skill');
          addFloatingText(fighter.x, fighter.y - 26, '🍯暖阳护盾', '#e08b3e', 1.0);
          setCommentary(`🍯【${spec.name}】张开暖阳护盾，稳稳守护全场～`);
        }
      } else if (spec.id === 'wind') {
        const myClones = state.clones.filter((c) => c.owner === fighter.side);
        const chance = fighter.berserkTimer > 0 || forceUltimate ? 0.75 : 0.36;
        if (myClones.length < 2 && Math.random() < chance) {
          const ang = Math.atan2(enemy.y - fighter.y, enemy.x - fighter.x) + (Math.random() * 0.5 - 0.25);
          state.clones.push({
            owner: fighter.side,
            x: fighter.x,
            y: fighter.y,
            vx: Math.cos(ang) * 2.1,
            vy: Math.sin(ang) * 2.1,
            radius: 15,
            life: 4.0,
            color: spec.color,
          });
          playSfx('skill');
          addFloatingText(fighter.x, fighter.y - 24, '🦋幻影分身', '#4a9fd8', 1.0);
          setCommentary(`🦋【${spec.name}】唤出轻风小分身，一起包围对手～`);
        }
      } else if (spec.id === 'void') {
        if (forceUltimate || fighter.wallCount % 2 === 1) {
          state.rings.push({
            x: fighter.x,
            y: fighter.y,
            r: 125,
            maxR: fighter.radius,
            color: '#b388eb',
            alpha: 0.7,
            lineWidth: 2.5,
            inward: true,
          });
          const dx = fighter.x - enemy.x;
          const dy = fighter.y - enemy.y;
          const dist = Math.max(20, Math.hypot(dx, dy));
          const pullForce = forceUltimate ? 1.2 : 0.75;
          enemy.vx += (dx / dist) * pullForce;
          enemy.vy += (dy / dist) * pullForce;
          addFloatingText(fighter.x, fighter.y - 24, '🔮星云牵引', '#9362d6', 0.95);
          if (Math.random() < 0.4) {
            setCommentary(`🔮【${spec.name}】释放星云引力，悄悄打乱对手步伐～`);
          }
        }
      } else if (spec.id === 'light') {
        playSfx('laser');
        const angles = [
          Math.atan2(enemy.y - fighter.y, enemy.x - fighter.x),
          Math.atan2(height / 2 - fighter.y, width / 2 - fighter.x) + (Math.random() * 0.5 - 0.25),
        ];
        angles.forEach((ang, idx) => {
          const rayLen = 400;
          const x2 = fighter.x + Math.cos(ang) * rayLen;
          const y2 = fighter.y + Math.sin(ang) * rayLen;
          state.lasers.push({
            owner: fighter.side,
            x1: fighter.x,
            y1: fighter.y,
            x2,
            y2,
            life: 0.28,
            maxLife: 0.28,
            color: idx === 0 ? '#5cd6a9' : '#ff9ebb',
          });

          const A = enemy.x - fighter.x;
          const B = enemy.y - fighter.y;
          const C = x2 - fighter.x;
          const D = y2 - fighter.y;
          const dot = A * C + B * D;
          const lenSq = C * C + D * D;
          const param = lenSq !== 0 ? Math.max(0, Math.min(1, dot / lenSq)) : -1;
          const xx = fighter.x + param * C;
          const yy = fighter.y + param * D;
          const distToRay = Math.hypot(enemy.x - xx, enemy.y - yy);

          if (distToRay <= enemy.radius + 7) {
            applyDamage(fighter, enemy, idx === 0 ? 15 : 11, idx === 0 ? '✨柔光折射' : '');
            spawnParticles(enemy.x, enemy.y, '#5cd6a9', 6, 0.75);
          }
        });
        if (Math.random() < 0.4) {
          setCommentary(`✨【${spec.name}】借墙折射出星光射线，优雅命中！`);
        }
      }
    };

    state.triggerBerserkNow = (powerBonus: number) => {
      const target = betSideRef.current === 'p1' ? p1 : p2;
      const rival = betSideRef.current === 'p1' ? p2 : p1;
      target.berserkTimer = 5.5 * powerBonus;
      target.radius = Math.round(target.spec.radius * 1.22);
      target.shield += Math.round(35 * powerBonus);

      const dx = rival.x - target.x;
      const dy = rival.y - target.y;
      const dist = Math.max(1, Math.hypot(dx, dy));
      const dashSpeed = target.spec.baseSpeed * 1.25;
      target.vx = (dx / dist) * dashSpeed;
      target.vy = (dy / dist) * dashSpeed;

      state.rings.push({
        x: target.x,
        y: target.y,
        r: target.radius,
        maxR: 185,
        color: '#ff85a1',
        alpha: 0.85,
        lineWidth: 4,
      });
      spawnParticles(target.x, target.y, '#ff85a1', 18, 1.1);
      addFloatingText(target.x, target.y - 32, '💖元气暴走!', '#e85d80', 1.25);
      triggerWallSkill(target, rival, true);
      playSfx('berserk');
      triggerShake();
      setCommentary(`💖 心愿注入！【${target.spec.name}】元气大爆发，全速冲向对手！`);
    };

    const secondInterval = window.setInterval(() => {
      if (state.finished) return;
      state.timeLeft = Math.max(0, state.timeLeft - 1);
      if (state.timeLeft === 15) {
        setCommentary('🌸 决胜时刻到！场地轻轻向内聚拢，胜负即将揭晓～');
        playSfx('berserk');
      }
    }, 1000);

    let lastHudSync = 0;

    const loop = (timestamp: number) => {
      if (state.finished) return;

      if (state.hitStopFrames > 0) {
        state.hitStopFrames -= 1;
        animId = window.requestAnimationFrame(loop);
        return;
      }

      const dtScale = isChargingRef.current ? 0.45 : 1.0;

      const shrinkRatio = state.timeLeft <= 15 ? (15 - state.timeLeft) / 15 : 0;
      const padX = Math.round(shrinkRatio * (width * 0.15));
      const padY = Math.round(shrinkRatio * (height * 0.13));
      const minX = 10 + padX;
      const maxX = width - 10 - padX;
      const minY = 10 + padY;
      const maxY = height - 10 - padY;

      const stepFighter = (f: FighterEntity, enemy: FighterEntity) => {
        if (f.berserkTimer > 0) {
          f.berserkTimer = Math.max(0, f.berserkTimer - 0.016 * dtScale);
          if (f.berserkTimer === 0) {
            f.radius = f.spec.radius;
          }
        }
        if (f.slowTimer > 0) f.slowTimer = Math.max(0, f.slowTimer - 0.016 * dtScale);
        if (f.stunTimer > 0) f.stunTimer = Math.max(0, f.stunTimer - 0.016 * dtScale);
        if (f.invulnTimer > 0) f.invulnTimer = Math.max(0, f.invulnTimer - 0.016 * dtScale);

        const curSpd = Math.hypot(f.vx, f.vy);
        let targetMinSpd = f.spec.baseSpeed;
        if (f.spec.id === 'fire') {
          targetMinSpd *= 1 + f.nitroStacks * 0.08;
        }
        if (f.berserkTimer > 0) {
          targetMinSpd *= 1.18;
        }
        if (f.slowTimer > 0) {
          targetMinSpd *= 0.68;
        }
        if (state.timeLeft <= 15) {
          targetMinSpd *= 1.08;
        }
        const maxAllowedSpd = targetMinSpd * 1.22;

        if (f.stunTimer > 0) {
          f.vx *= 0.88;
          f.vy *= 0.88;
        } else if (curSpd < targetMinSpd && curSpd > 0.01) {
          const factor = (curSpd + (targetMinSpd - curSpd) * 0.08) / curSpd;
          f.vx *= factor;
          f.vy *= factor;
        } else if (curSpd > maxAllowedSpd) {
          const factor = maxAllowedSpd / curSpd;
          f.vx *= factor;
          f.vy *= factor;
        } else if (curSpd <= 0.01) {
          const randAng = Math.random() * Math.PI * 2;
          f.vx = Math.cos(randAng) * targetMinSpd;
          f.vy = Math.sin(randAng) * targetMinSpd;
        }

        f.x += f.vx * dtScale;
        f.y += f.vy * dtScale;
        f.rotation += curSpd * 0.02 * dtScale;

        f.trail.push({
          x: f.x,
          y: f.y,
          r: f.radius * 0.75,
          alpha: f.berserkTimer > 0 ? 0.38 : 0.24,
          color: f.berserkTimer > 0 ? '#ff85a1' : f.spec.color,
        });
        if (f.trail.length > 7) {
          f.trail.shift();
        }

        let hitWall = false;
        if (f.x - f.radius < minX) {
          f.x = minX + f.radius;
          f.vx = Math.abs(f.vx);
          f.vy += (Math.random() - 0.5) * 0.22;
          hitWall = true;
        } else if (f.x + f.radius > maxX) {
          f.x = maxX - f.radius;
          f.vx = -Math.abs(f.vx);
          f.vy += (Math.random() - 0.5) * 0.22;
          hitWall = true;
        }

        if (f.y - f.radius < minY) {
          f.y = minY + f.radius;
          f.vy = Math.abs(f.vy);
          f.vx += (Math.random() - 0.5) * 0.22;
          hitWall = true;
        } else if (f.y + f.radius > maxY) {
          f.y = maxY - f.radius;
          f.vy = -Math.abs(f.vy);
          f.vx += (Math.random() - 0.5) * 0.22;
          hitWall = true;
        }

        if (hitWall) {
          playSfx('wall');
          spawnParticles(f.x, f.y, f.spec.color, 5, 0.6);
          triggerWallSkill(f, enemy, false);
        }
      };

      stepFighter(p1, p2);
      stepFighter(p2, p1);

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.hypot(dx, dy);
      const minDist = p1.radius + p2.radius;

      if (dist > 0 && dist < minDist) {
        const overlap = minDist - dist;
        const nx = dx / dist;
        const ny = dy / dist;
        const totalMass = p1.spec.mass + p2.spec.mass;
        p1.x -= nx * overlap * (p2.spec.mass / totalMass);
        p1.y -= ny * overlap * (p2.spec.mass / totalMass);
        p2.x += nx * overlap * (p1.spec.mass / totalMass);
        p2.y += ny * overlap * (p1.spec.mass / totalMass);

        const kx = p1.vx - p2.vx;
        const ky = p1.vy - p2.vy;
        const relVel = Math.hypot(kx, ky);
        const p = (2 * (nx * kx + ny * ky)) / totalMass;
        const restitution = 1.02;

        p1.vx = (p1.vx - p * p2.spec.mass * nx) * restitution;
        p1.vy = (p1.vy - p * p2.spec.mass * ny) * restitution;
        p2.vx = (p2.vx + p * p1.spec.mass * nx) * restitution;
        p2.vy = (p2.vy + p * p1.spec.mass * ny) * restitution;

        if (p1.invulnTimer <= 0 && p2.invulnTimer <= 0) {
          p1.invulnTimer = 0.2;
          p2.invulnTimer = 0.2;

          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;

          playSfx('clash');
          state.hitStopFrames = relVel > 5.2 ? 3 : 2;
          if (relVel > 5.0 || p1.nitroStacks >= 2 || p2.nitroStacks >= 2 || p1.berserkTimer > 0 || p2.berserkTimer > 0) {
            triggerShake();
          }

          spawnParticles(midX, midY, '#ff85a1', 10, 0.9);
          state.rings.push({
            x: midX,
            y: midY,
            r: 8,
            maxR: 58,
            color: '#ffb3c6',
            alpha: 0.75,
            lineWidth: 2.5,
          });

          const resolveMeleeHit = (attacker: FighterEntity, defender: FighterEntity, pushSign: number) => {
            const spd = Math.hypot(attacker.vx, attacker.vy);
            let raw = attacker.spec.baseAtk * (0.8 + spd * 0.14);
            if (attacker.berserkTimer > 0) {
              raw *= 1.48;
            }

            let label = '砰砰!';
            if (attacker.spec.id === 'fire') {
              if (attacker.nitroStacks > 0) {
                raw *= 1 + attacker.nitroStacks * 0.3;
                label = attacker.nitroStacks === 3 ? '🌸满花重击!' : '🌸花焰冲撞';
                defender.vx += nx * pushSign * (0.75 + attacker.nitroStacks * 0.28);
                defender.vy += ny * pushSign * (0.75 + attacker.nitroStacks * 0.28);
                attacker.nitroStacks = 0;
              }
            } else if (attacker.spec.id === 'wind') {
              defender.stunTimer = 0.28;
              label = '🦋轻风酥麻';
              spawnParticles(defender.x, defender.y, '#6ec6ff', 7, 0.8);
            } else if (attacker.spec.id === 'light') {
              attacker.vx -= nx * pushSign * 1.05;
              attacker.vy -= ny * pushSign * 1.05;
              label = '✨轻巧借力';
              if (state.mines.length < 3) {
                state.mines.push({
                  owner: attacker.side,
                  x: midX,
                  y: midY,
                  radius: 18,
                  timer: 1.2,
                  maxTimer: 1.2,
                  color: '#5cd6a9',
                });
              }
            }

            const actualDealt = applyDamage(attacker, defender, raw, label);

            if (attacker.spec.id === 'void' && actualDealt > 0) {
              const heal = Math.max(4, Math.round(actualDealt * 0.45));
              attacker.hp = Math.min(attacker.maxHp, attacker.hp + heal);
              addFloatingText(attacker.x, attacker.y + 18, '🔮汲取回血', '#9362d6', 0.95);
            }

            if (defender.spec.id === 'rock' && actualDealt > 0) {
              const reflect = Math.max(5, Math.round(actualDealt * 0.48));
              attacker.hp = Math.max(0, attacker.hp - reflect);
              addFloatingText(attacker.x, attacker.y - 26, '🍯暖盾反震', '#e08b3e', 0.95);
            }
          };

          resolveMeleeHit(p1, p2, 1);
          resolveMeleeHit(p2, p1, -1);

          if (p1.hp > 0 && p1.hp < p1.maxHp * 0.25) {
            setCommentary(`💓 【${p1.spec.name}】体力告急，快看看能不能靠碰壁逆转！`);
          } else if (p2.hp > 0 && p2.hp < p2.maxHp * 0.25) {
            setCommentary(`✨ 优势很大！【${p2.spec.name}】快要招架不住啦～`);
          }
        }
      }

      // 更新分身球
      for (let i = state.clones.length - 1; i >= 0; i--) {
        const clone = state.clones[i];
        clone.life -= 0.016 * dtScale;
        if (clone.life <= 0) {
          state.clones.splice(i, 1);
          continue;
        }
        const target = clone.owner === 'p1' ? p2 : p1;
        const ownerEntity = clone.owner === 'p1' ? p1 : p2;

        const ang = Math.atan2(target.y - clone.y, target.x - clone.x);
        clone.vx = clone.vx * 0.94 + Math.cos(ang) * 0.18;
        clone.vy = clone.vy * 0.94 + Math.sin(ang) * 0.18;
        clone.x += clone.vx * dtScale;
        clone.y += clone.vy * dtScale;

        if (clone.x - clone.radius < minX || clone.x + clone.radius > maxX) clone.vx *= -1;
        if (clone.y - clone.radius < minY || clone.y + clone.radius > maxY) clone.vy *= -1;

        if (Math.hypot(target.x - clone.x, target.y - clone.y) < target.radius + clone.radius) {
          applyDamage(ownerEntity, target, 14, '🦋分身助阵');
          spawnParticles(clone.x, clone.y, clone.color, 7, 0.75);
          playSfx('wall');
          state.clones.splice(i, 1);
        }
      }

      // 更新星光泡泡炸弹
      for (let i = state.mines.length - 1; i >= 0; i--) {
        const mine = state.mines[i];
        mine.timer -= 0.016 * dtScale;
        if (mine.timer <= 0) {
          const target = mine.owner === 'p1' ? p2 : p1;
          const ownerEntity = mine.owner === 'p1' ? p1 : p2;
          playSfx('explosion');
          state.rings.push({
            x: mine.x,
            y: mine.y,
            r: 8,
            maxR: 80,
            color: '#5cd6a9',
            alpha: 0.8,
            lineWidth: 3.5,
          });
          spawnParticles(mine.x, mine.y, '#5cd6a9', 12, 1.0);
          const distToTarget = Math.hypot(target.x - mine.x, target.y - mine.y);
          if (distToTarget <= 80 + target.radius) {
            applyDamage(ownerEntity, target, 26, '✨星光绽放!');
            const ang = Math.atan2(target.y - mine.y, target.x - mine.x);
            target.vx += Math.cos(ang) * 1.3;
            target.vy += Math.sin(ang) * 1.3;
          }
          state.mines.splice(i, 1);
        }
      }

      // 胜负判定
      if (p1.hp <= 0 || p2.hp <= 0 || state.timeLeft <= 0) {
        state.finished = true;
        let winnerSide: Side = 'p1';
        let reason = '';
        if (p1.hp <= 0 && p2.hp <= 0) {
          winnerSide = 'p1';
          reason = '双方同时力竭，我方凭借微弱优势胜出～';
        } else if (p2.hp <= 0) {
          winnerSide = 'p1';
          reason = `【${p1.spec.name}】一路元气冲撞，赢得了本局胜利！`;
        } else if (p1.hp <= 0) {
          winnerSide = 'p2';
          reason = `【${p2.spec.name}】发挥出色，拿下了这场对决！`;
        } else {
          const p1Pct = p1.hp / p1.maxHp;
          const p2Pct = p2.hp / p2.maxHp;
          winnerSide = p1Pct >= p2Pct ? 'p1' : 'p2';
          reason = '时间结束，按场上剩余体力判定胜出～';
        }

        const betWon = winnerSide === betSideRef.current;
        const winFighter = winnerSide === 'p1' ? p1 : p2;
        const mvpTitle =
          winFighter.hp < winFighter.maxHp * 0.25
            ? '🌸 逆风翻盘小锦鲤'
            : winFighter.wallCount >= 10
            ? '🦋 灵巧弹射达人'
            : '👑 全场元气主角';

        playSfx('win');
        setBattleResult({
          winner: winnerSide,
          betWon,
          reason,
          mvpTitle,
        });
      }

      if (timestamp - lastHudSync > 90 || state.finished) {
        lastHudSync = timestamp;
        setHudState({
          p1HpPct: Math.max(0, Math.round((p1.hp / p1.maxHp) * 100)),
          p1Berserk: p1.berserkTimer > 0,
          p2HpPct: Math.max(0, Math.round((p2.hp / p2.maxHp) * 100)),
          p2Berserk: p2.berserkTimer > 0,
          suddenDeath: state.timeLeft <= 15,
        });
      }

      // ==================== 绘制柔和奶油风擂台 ====================
      ctx.clearRect(0, 0, width, height);

      // 中心浅粉装饰圆环
      ctx.save();
      ctx.strokeStyle = 'rgba(232, 165, 190, 0.22)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 56, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(232, 165, 190, 0.12)';
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 110, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 缩圈柔粉边界
      if (padX > 0 || padY > 0 || state.timeLeft <= 15) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 166, 189, 0.15)';
        ctx.fillRect(0, 0, width, minY);
        ctx.fillRect(0, maxY, width, height - maxY);
        ctx.fillRect(0, minY, minX, maxY - minY);
        ctx.fillRect(maxX, minY, width - maxX, maxY - minY);

        ctx.strokeStyle = '#ff85a1';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 6]);
        ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
        ctx.restore();
      }

      // 绘制星光泡泡
      state.mines.forEach((mine) => {
        ctx.save();
        const pulse = 1 + Math.sin(timestamp * 0.02) * 0.15;
        ctx.strokeStyle = mine.color;
        ctx.fillStyle = 'rgba(92, 214, 169, 0.22)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mine.x, mine.y, mine.radius * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });

      // 绘制柔光射线
      for (let i = state.lasers.length - 1; i >= 0; i--) {
        const l = state.lasers[i];
        l.life -= 0.016;
        if (l.life <= 0) {
          state.lasers.splice(i, 1);
          continue;
        }
        const alpha = l.life / l.maxLife;
        ctx.save();
        ctx.strokeStyle = l.color;
        ctx.globalAlpha = alpha * 0.85;
        ctx.lineWidth = 4.5 * alpha + 1;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(l.x2, l.y2);
        ctx.stroke();
        ctx.restore();
      }

      // 绘制涟漪圆环
      for (let i = state.rings.length - 1; i >= 0; i--) {
        const ring = state.rings[i];
        if (ring.inward) {
          ring.r -= 3.4;
          ring.alpha -= 0.03;
        } else {
          ring.r += (ring.maxR - ring.r) * 0.14 + 1.2;
          ring.alpha -= 0.032;
        }
        if (ring.alpha <= 0 || (ring.inward && ring.r <= ring.maxR)) {
          state.rings.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.strokeStyle = ring.color;
        ctx.globalAlpha = Math.max(0, ring.alpha);
        ctx.lineWidth = ring.lineWidth;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, Math.max(2, ring.r), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 绘制轻风小分身
      state.clones.forEach((clone) => {
        ctx.save();
        ctx.fillStyle = clone.color;
        ctx.globalAlpha = 0.78;
        ctx.beginPath();
        ctx.arc(clone.x, clone.y, clone.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      });

      // 绘制果冻质感主圆球
      const drawFighter = (f: FighterEntity) => {
        f.trail.forEach((t, idx) => {
          const ratio = (idx + 1) / f.trail.length;
          ctx.save();
          ctx.fillStyle = t.color;
          ctx.globalAlpha = ratio * t.alpha * 0.35;
          ctx.beginPath();
          ctx.arc(t.x, t.y, t.r * ratio, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        ctx.save();
        ctx.translate(f.x, f.y);

        // 蓄力柔和花环
        if (isChargingRef.current && f.side === betSideRef.current) {
          ctx.save();
          ctx.strokeStyle = '#ff85a1';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([5, 5]);
          ctx.rotate(f.rotation * 2);
          ctx.beginPath();
          ctx.arc(0, 0, f.radius + 12 + chargeValRef.current * 7, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // 暴走暖粉光圈
        if (f.berserkTimer > 0) {
          ctx.save();
          ctx.strokeStyle = '#ff85a1';
          ctx.lineWidth = 3;
          ctx.setLineDash([6, 4]);
          ctx.rotate(-f.rotation * 1.4);
          ctx.beginPath();
          ctx.arc(0, 0, f.radius + 8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // 护盾光圈
        if (f.shield > 0) {
          ctx.save();
          ctx.strokeStyle = '#f5a65b';
          ctx.fillStyle = 'rgba(245, 166, 91, 0.14)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, f.radius + 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }

        // 果冻圆球渐变主体
        const grad = ctx.createRadialGradient(-f.radius * 0.32, -f.radius * 0.32, 2, 0, 0, f.radius);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.28, f.spec.secondaryColor);
        grad.addColorStop(0.95, f.spec.color);

        ctx.shadowColor = f.spec.glowColor;
        ctx.shadowBlur = 14;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, f.radius, 0, Math.PI * 2);
        ctx.fill();

        // 果冻高光小圆点
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.beginPath();
        ctx.arc(-f.radius * 0.3, -f.radius * 0.3, f.radius * 0.22, 0, Math.PI * 2);
        ctx.fill();

        // 外圈白色柔边与体力进度环
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, f.radius - 1, 0, Math.PI * 2);
        ctx.stroke();

        const hpRatio = Math.max(0, f.hp / f.maxHp);
        ctx.strokeStyle = f.side === 'p1' ? '#5ab2f7' : '#ff7597';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, 0, f.radius - 1.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * hpRatio);
        ctx.stroke();

        // 中心图标随球体放大
        ctx.shadowBlur = 0;
        ctx.font = `${Math.round(f.radius * 0.62)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(f.spec.icon, 0, 2);

        // 阵营小标签
        ctx.fillStyle = f.side === 'p1' ? '#4a90d9' : '#e85d80';
        ctx.font = '800 11px sans-serif';
        ctx.fillText(f.side === 'p1' ? '我方' : '对手', 0, -f.radius - 10);

        ctx.restore();
      };

      drawFighter(p1);
      drawFighter(p2);

      // 绘制粒子
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const pt = state.particles[i];
        pt.x += pt.vx * dtScale;
        pt.y += pt.vy * dtScale;
        pt.alpha -= pt.decay;
        if (pt.alpha <= 0) {
          state.particles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 绘制轻柔招式提示字
      for (let i = state.texts.length - 1; i >= 0; i--) {
        const ft = state.texts[i];
        ft.y += ft.vy * dtScale;
        ft.alpha -= 0.022;
        if (ft.alpha <= 0) {
          state.texts.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.font = `800 ${Math.round(12 * ft.scale)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.lineWidth = 3.5;
        ctx.strokeText(ft.text, ft.x, ft.y);
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      animId = window.requestAnimationFrame(loop);
    };

    animId = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(animId);
      window.clearInterval(secondInterval);
      window.removeEventListener('resize', updateSize);
    };
  }, [phase, actualP1, actualP2, playSfx, triggerShake]);

  const currentEditingSlot = editingSide === 'p1' ? p1Slot : p2Slot;
  const previewSpec: CricketSpec =
    currentEditingSlot === 'random'
      ? CRICKETS.fire
      : CRICKETS[currentEditingSlot];

  const activeStake = EMOTION_STAKES.find((s) => s.id === stakeId) || EMOTION_STAKES[0];

  const renderSlotPreview = (side: Side, slot: SelectionSlot) => {
    const isEditing = editingSide === side;
    const isRandom = slot === 'random';
    const spec = isRandom ? null : CRICKETS[slot];
    const sideColor = side === 'p1' ? '#6ec6ff' : '#ff85a1';

    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => setEditingSide(side)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setEditingSide(side);
        }}
        className="cc-slot-card"
        style={{
          borderColor: isEditing ? sideColor : '#f5e8ef',
          background: isEditing ? (side === 'p1' ? '#f5fbff' : '#fff7fa') : '#ffffff',
        }}
      >
        <span
          className="cc-slot-tag"
          style={{
            background: side === 'p1' ? '#e6f4ff' : '#ffe8ef',
            color: side === 'p1' ? '#3b86c4' : '#e0587c',
          }}
        >
          {side === 'p1' ? '我方圆球' : '对手圆球'}
        </span>

        <div
          className="cc-orb-preview"
          style={{
            background: isRandom
              ? 'radial-gradient(circle at 30% 30%, #fff0f5, #d8b4f8)'
              : `radial-gradient(circle at 30% 30%, #ffffff, ${spec?.secondaryColor} 35%, ${spec?.color} 100%)`,
            boxShadow: isRandom ? '0 6px 14px rgba(179, 136, 235, 0.35)' : `0 6px 14px ${spec?.glowColor}`,
          }}
        >
          {isRandom ? '🎲' : spec?.icon}
        </div>

        <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--cc-text-main)' }}>
          {isRandom ? '随机盲盒' : spec?.name}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--cc-text-dim)', marginTop: '2px' }}>
          {isRandom ? '开局揭晓' : spec?.title}
        </div>
      </div>
    );
  };

  return (
    <div className="cc-viewport-wrapper">
      <style>{CRICKET_STYLES}</style>

      <div className="cc-mobile-shell">
        {/* 顶部栏 */}
        <header className="cc-header">
          <div className="cc-brand">
            <span className="cc-brand-badge">元气解压</span>
            <span className="cc-brand-title">果冻圆球斗蛐蛐</span>
          </div>
          <div className="cc-header-actions">
            <button
              type="button"
              className="cc-icon-btn"
              onClick={() => setShowGuideModal(true)}
            >
              📖 规则
            </button>
            <button
              type="button"
              className="cc-icon-btn"
              onClick={() => setSoundEnabled((prev) => !prev)}
            >
              {soundEnabled ? '🔊 音效' : '🔇 静音'}
            </button>
          </div>
        </header>

        {/* ==================== 阶段 1: 柔和精简选角大厅 ==================== */}
        {phase === 'lobby' && (
          <main className="cc-lobby">
            {/* 1v1 对战席位 */}
            <section className="cc-vs-stage">
              {renderSlotPreview('p1', p1Slot)}

              <div className="cc-vs-divider">
                <span className="cc-vs-badge">VS</span>
                <button
                  type="button"
                  className="cc-icon-btn"
                  onClick={handleRandomizeBoth}
                  title="双方随机配对"
                >
                  🔀 洗牌
                </button>
              </div>

              {renderSlotPreview('p2', p2Slot)}
            </section>

            {/* 圆球选择与一句话简介合并在一个清爽卡片中 */}
            <section className="cc-bet-box">
              <div className="cc-section-label">
                <span>
                  正在为{' '}
                  <strong style={{ color: editingSide === 'p1' ? '#3b86c4' : '#e0587c' }}>
                    {editingSide === 'p1' ? '我方' : '对手'}
                  </strong>{' '}
                  挑选圆球：
                </span>
                <button
                  type="button"
                  onClick={() => setEditingSide(editingSide === 'p1' ? 'p2' : 'p1')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#e0587c',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  切换选角方 ⇄
                </button>
              </div>

              <div className="cc-roster-grid">
                {CRICKET_LIST.map((c) => {
                  const selected = currentEditingSlot === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className="cc-cricket-option"
                      onClick={() => {
                        if (editingSide === 'p1') setP1Slot(c.id);
                        else setP2Slot(c.id);
                        playSfx('wall');
                      }}
                      style={{
                        borderColor: selected ? c.color : '#f3e6ed',
                        background: selected ? '#fff5f8' : '#fcf8fa',
                      }}
                    >
                      <div
                        className="cc-mini-orb"
                        style={{
                          background: `radial-gradient(circle at 30% 30%, #ffffff, ${c.secondaryColor} 35%, ${c.color} 100%)`,
                          boxShadow: `0 4px 10px ${c.glowColor}`,
                        }}
                      >
                        {c.icon}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--cc-text-main)' }}>{c.name}</div>
                      <div style={{ fontSize: '10px', color: 'var(--cc-text-dim)' }}>{c.title}</div>
                    </button>
                  );
                })}

                <button
                  type="button"
                  className="cc-cricket-option"
                  onClick={() => {
                    if (editingSide === 'p1') setP1Slot('random');
                    else setP2Slot('random');
                    playSfx('skill');
                  }}
                  style={{
                    borderColor: currentEditingSlot === 'random' ? '#b388eb' : '#f3e6ed',
                    background: currentEditingSlot === 'random' ? '#f6f0ff' : '#fcf8fa',
                  }}
                >
                  <div
                    className="cc-mini-orb"
                    style={{
                      background: 'radial-gradient(circle at 30% 30%, #ffffff, #d8b4f8)',
                      boxShadow: '0 4px 10px rgba(179, 136, 235, 0.35)',
                    }}
                  >
                    🎲
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#8a5cf5' }}>随机抽签</div>
                  <div style={{ fontSize: '10px', color: 'var(--cc-text-dim)' }}>盲盒出战</div>
                </button>
              </div>

              {/* 简洁技能一句话说明 */}
              <div className="cc-detail-card">
                {currentEditingSlot === 'random' ? (
                  <div style={{ color: 'var(--cc-text-dim)' }}>
                    🎲 <strong>随机盲盒：</strong>开局自动抽取一颗果冻圆球登场，给今天留一点小惊喜～
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div>
                      <strong style={{ color: '#e0587c' }}>碰壁效果：</strong>
                      <span>{previewSpec.wallSkillDesc}</span>
                    </div>
                    <div>
                      <strong style={{ color: '#3b86c4' }}>相撞效果：</strong>
                      <span>{previewSpec.clashSkillDesc}</span>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 赛前支持与今日小确幸心愿 */}
            <section className="cc-bet-box">
              <div className="cc-section-label">
                <span>🌷 选择支持方与今日小确幸：</span>
              </div>
              <div className="cc-bet-buttons">
                <button
                  type="button"
                  className={`cc-bet-btn ${betSide === 'p1' ? 'selected-p1' : ''}`}
                  onClick={() => setBetSide('p1')}
                >
                  <span>🔵 押 P1 我方赢</span>
                </button>
                <button
                  type="button"
                  className={`cc-bet-btn ${betSide === 'p2' ? 'selected-p2' : ''}`}
                  onClick={() => setBetSide('p2')}
                >
                  <span>🔴 押 P2 对手赢</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {EMOTION_STAKES.map((stake) => (
                  <button
                    key={stake.id}
                    type="button"
                    onClick={() => setStakeId(stake.id)}
                    style={{
                      flex: 1,
                      padding: '6px 8px',
                      borderRadius: '99px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: stakeId === stake.id ? '1px solid #ff85a1' : '1px solid #f2e2ea',
                      background: stakeId === stake.id ? '#fff0f4' : '#fcf8fa',
                      color: stakeId === stake.id ? '#e0587c' : 'var(--cc-text-dim)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {stake.label}
                  </button>
                ))}
              </div>
            </section>

            <button type="button" className="cc-start-btn" onClick={startBattle}>
              ⚡ 放入斗盆 · 全自动开战！
            </button>
          </main>
        )}

        {/* ==================== 阶段 2: 柔和果冻擂台对决 ==================== */}
        {phase === 'battle' && (
          <main className="cc-arena-view">
            {/* 顶部极简体力条 */}
            <section className="cc-hud-top">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700 }}>
                  <span style={{ color: '#3b86c4' }}>
                    {actualP1.icon} {actualP1.name}
                  </span>
                </div>
                <div className="cc-hp-bar-track">
                  <div
                    className="cc-hp-bar-fill"
                    style={{
                      width: `${hudState.p1HpPct}%`,
                      background: 'linear-gradient(90deg, #8fd3ff, #5ab2f7)',
                    }}
                  />
                </div>
              </div>

              <div className="cc-timer-box">
                <span
                  style={{
                    fontSize: '11px',
                    color: hudState.suddenDeath ? '#e0587c' : '#b594a6',
                    fontWeight: 800,
                    padding: '3px 9px',
                    borderRadius: '99px',
                    background: hudState.suddenDeath ? '#ffe8ef' : '#faf2f6',
                  }}
                >
                  {hudState.suddenDeath ? '🌸 决胜时刻' : 'VS'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '12px', fontWeight: 700 }}>
                  <span style={{ color: '#e0587c' }}>
                    {actualP2.name} {actualP2.icon}
                  </span>
                </div>
                <div className="cc-hp-bar-track">
                  <div
                    className="cc-hp-bar-fill"
                    style={{
                      width: `${hudState.p2HpPct}%`,
                      background: 'linear-gradient(90deg, #ff85a1, #ffb3c6)',
                      marginLeft: 'auto',
                    }}
                  />
                </div>
              </div>
            </section>

            {/* 温柔解说提示条 */}
            <div className="cc-commentary-banner">
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {commentary}
              </span>
            </div>

            {/* 奶油果冻物理擂台 */}
            <div
              ref={wrapRef}
              className={`cc-canvas-wrap ${hudState.suddenDeath ? 'sudden-death' : ''} ${screenShake ? 'screen-shake' : ''}`}
            >
              <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
            </div>

            {/* 底部控制台 */}
            <section className="cc-controls-bar">
              <button
                type="button"
                className="cc-icon-btn"
                onClick={() => setPhase('lobby')}
                style={{ padding: '13px 15px', borderRadius: '99px' }}
              >
                ↩ 换蛐蛐
              </button>

              <button
                type="button"
                disabled={berserkUsed}
                onMouseDown={handleBerserkStart}
                onMouseUp={handleBerserkRelease}
                onMouseLeave={handleBerserkRelease}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleBerserkStart();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleBerserkRelease();
                }}
                className={`cc-berserk-btn ${!berserkUsed ? 'ready' : 'used'} ${isChargingBerserk ? 'charging' : ''}`}
              >
                {!berserkUsed && (
                  <div
                    className="cc-charge-fill"
                    style={{ width: `${chargeProgress}%` }}
                  />
                )}
                <span style={{ position: 'relative', zIndex: 2 }}>
                  {berserkUsed
                    ? '✨ 本局心愿助威已释放'
                    : isChargingBerserk
                    ? '💖 蓄力注入中... 松开爆发！'
                    : `💖 按住蓄力 · 助【${betSide === 'p1' ? actualP1.name : actualP2.name}】爆发`}
                </span>
              </button>
            </section>

            {/* 极简治愈结算弹窗 */}
            {battleResult && (
              <div className="cc-result-overlay">
                <div className="cc-result-card">
                  <div style={{ textAlign: 'center' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '99px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: '#ffe8ef',
                        color: '#e0587c',
                        marginBottom: '8px',
                      }}
                    >
                      {battleResult.mvpTitle}
                    </span>
                    <h2 style={{ margin: '0 0 6px', fontSize: '21px', fontWeight: 800, color: 'var(--cc-text-main)' }}>
                      {battleResult.winner === 'p1'
                        ? `🎉 【${actualP1.name}】获胜啦！`
                        : `🎉 【${actualP2.name}】获胜啦！`}
                    </h2>
                    <div style={{ fontSize: '12px', color: 'var(--cc-text-dim)' }}>{battleResult.reason}</div>
                  </div>

                  <div
                    style={{
                      background: '#fff5f8',
                      border: '1px solid #f8dce6',
                      borderRadius: '16px',
                      padding: '14px',
                      fontSize: '13px',
                      lineHeight: 1.6,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontWeight: 800, color: '#e0587c', marginBottom: '4px' }}>
                      {battleResult.betWon
                        ? `🌷 心愿达成 · ${activeStake.label}`
                        : `🌈 温柔签语 · 霉运已替你挡下`}
                    </div>
                    <div style={{ color: 'var(--cc-text-main)' }}>
                      {battleResult.betWon ? activeStake.winQuote : activeStake.loseQuote}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      type="button"
                      className="cc-bet-btn"
                      onClick={() => setPhase('lobby')}
                      style={{ padding: '12px', fontSize: '13px', borderRadius: '99px' }}
                    >
                      🔄 换蛐蛐重选
                    </button>
                    <button
                      type="button"
                      className="cc-start-btn"
                      onClick={startBattle}
                      style={{ padding: '12px', fontSize: '14px', marginTop: 0 }}
                    >
                      ⚡ 原班人马再战
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        )}

        {/* 简洁玩法说明弹窗 */}
        {showGuideModal && (
          <div className="cc-result-overlay" onClick={() => setShowGuideModal(false)}>
            <div className="cc-result-card" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#e0587c' }}>
                  📖 玩法小贴士
                </h3>
                <button
                  type="button"
                  className="cc-icon-btn"
                  onClick={() => setShowGuideModal(false)}
                >
                  ✕ 关闭
                </button>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--cc-text-main)', lineHeight: 1.65, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  🌸 <strong>挑选圆球：</strong>为我方和对手各选一颗果冻圆球，也可以交给<strong>「随机抽签」</strong>。
                </div>
                <div>
                  ✨ <strong>自动碰撞：</strong>放入斗盆后全程自动弹射，碰壁与相撞都会触发专属小技能。
                </div>
                <div>
                  💖 <strong>按住助威：</strong>每局可以<strong>按住底部按钮蓄力并松开</strong>，为你支持的圆球注入一次元气爆发！
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}