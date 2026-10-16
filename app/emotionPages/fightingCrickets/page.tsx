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
  sizeLabel: string;
  speedLabel: string;
  radius: number;
  baseSpeed: number;
  mass: number;
  maxHp: number;
  baseAtk: number;
  wallSkillName: string;
  wallSkillDesc: string;
  clashSkillName: string;
  clashSkillDesc: string;
}

const CRICKETS: Record<CricketId, CricketSpec> = {
  fire: {
    id: 'fire',
    name: '赤焰暴君',
    title: '狂战 · 火',
    icon: '🔥',
    color: '#ff3b5c',
    secondaryColor: '#ff9a00',
    glowColor: 'rgba(255, 59, 92, 0.65)',
    sizeLabel: '中型',
    speedLabel: '常速',
    radius: 23,
    baseSpeed: 2.5,
    mass: 1.05,
    maxHp: 320,
    baseAtk: 26,
    wallSkillName: '蓄力氮气弹射',
    wallSkillDesc: '碰壁叠加烈焰加速并拖出火尾，越撞越快。',
    clashSkillName: '动能重击',
    clashSkillDesc: '借冲刺势能打出破甲重击，将对手猛烈撞退。',
  },
  rock: {
    id: 'rock',
    name: '玄铁重装',
    title: '反伤 · 岩',
    icon: '🛡️',
    color: '#f5a623',
    secondaryColor: '#ffe082',
    glowColor: 'rgba(245, 166, 35, 0.65)',
    sizeLabel: '大型',
    speedLabel: '慢速',
    radius: 29,
    baseSpeed: 1.85,
    mass: 1.65,
    maxHp: 420,
    baseAtk: 22,
    wallSkillName: '震地护盾',
    wallSkillDesc: '多次碰壁后开启金光护盾，并震出减速冲击波。',
    clashSkillName: '荆棘铁壁',
    clashSkillDesc: '身板厚重减免伤害，并将冲击力反弹给对手。',
  },
  wind: {
    id: 'wind',
    name: '疾风幻影',
    title: '连击 · 雷',
    icon: '⚡',
    color: '#00f0ff',
    secondaryColor: '#80f8ff',
    glowColor: 'rgba(0, 240, 255, 0.65)',
    sizeLabel: '小型',
    speedLabel: '迅捷',
    radius: 18,
    baseSpeed: 3.3,
    mass: 0.78,
    maxHp: 270,
    baseAtk: 19,
    wallSkillName: '分身残影',
    wallSkillDesc: '碰壁时概率分裂出电光幻象，多球协同围殴。',
    clashSkillName: '高频电弧',
    clashSkillDesc: '碰撞触发连锁感电，短暂麻痹对手打断节奏。',
  },
  void: {
    id: 'void',
    name: '噬魂黑洞',
    title: '吸血 · 暗',
    icon: '🌀',
    color: '#b845ff',
    secondaryColor: '#e29eff',
    glowColor: 'rgba(184, 69, 255, 0.65)',
    sizeLabel: '中型',
    speedLabel: '中慢',
    radius: 24,
    baseSpeed: 2.15,
    mass: 1.18,
    maxHp: 350,
    baseAtk: 23,
    wallSkillName: '引力脉冲',
    wallSkillDesc: '碰壁释放暗紫引力波，强行把对手拉向自己。',
    clashSkillName: '生命汲取',
    clashSkillDesc: '碰撞攻击对手的同时汲取能量，恢复自身生命。',
  },
  light: {
    id: 'light',
    name: '极光棱镜',
    title: '弹幕 · 光',
    icon: '💎',
    color: '#38ff8e',
    secondaryColor: '#ffffff',
    glowColor: 'rgba(56, 255, 142, 0.65)',
    sizeLabel: '小型',
    speedLabel: '常速',
    radius: 19,
    baseSpeed: 2.7,
    mass: 0.85,
    maxHp: 285,
    baseAtk: 20,
    wallSkillName: '折射激光',
    wallSkillDesc: '每次碰壁发射折射激光束，远距离穿透削血。',
    clashSkillName: '闪避卸力',
    clashSkillDesc: '交锋时借力弹开脱身，并在原地留下延时炸弹。',
  },
};

const CRICKET_LIST: CricketSpec[] = Object.values(CRICKETS);

const EMOTION_STAKES = [
  { id: 'luck', label: '✨ 今日好运加持', winQuote: '好运已到账！今天连呼吸都是顺风局！', loseQuote: '电子蛐蛐替你踩了今日唯一的坑，接下来全是坦途！' },
  { id: 'relax', label: '🧘 烦恼原地清零', winQuote: '刚才那波漂亮反击，已经把烦心事统统撞碎了！', loseQuote: '胜败乃兵家常事，深呼吸，给心情放个轻松假！' },
  { id: 'offwork', label: '🍹 准时下班开溜', winQuote: '气势如虹！今天状态拉满，到点潇洒走人！', loseQuote: '虽然蛐蛐惜败，但摸鱼回血的快乐实打实到手了！' },
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
   几何电子斗蛐蛐 (Cyber Cricket Arena)
   路径建议: components/emotionPages/cyberCricket/cyber-cricket.css
   ========================================================================== */

:root {
  --cc-bg-deep: #070810;
  --cc-bg-panel: #101322;
  --cc-bg-card: rgba(22, 27, 48, 0.85);
  --cc-border-subtle: rgba(255, 255, 255, 0.09);
  --cc-text-main: #f3f6ff;
  --cc-text-dim: #8f9bb7;
  --cc-fire: #ff3b5c;
  --cc-rock: #f5a623;
  --cc-wind: #00f0ff;
  --cc-void: #b845ff;
  --cc-light: #38ff8e;
  --cc-gold: #ffd700;
}

.cc-viewport-wrapper {
  width: 100%;
  min-height: 100dvh;
  background: radial-gradient(circle at 50% 15%, #171b34 0%, #070810 70%);
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
  max-width: 430px;
  min-height: 100dvh;
  background: linear-gradient(180deg, #0b0d19 0%, #070811 100%);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.85), 0 0 1px 1px rgba(255, 255, 255, 0.08);
}

@media (min-width: 480px) {
  .cc-viewport-wrapper {
    padding: 12px 0;
  }
  .cc-mobile-shell {
    min-height: min(860px, 95dvh);
    height: min(860px, 95dvh);
    border-radius: 32px;
    border: 2px solid rgba(255, 255, 255, 0.12);
  }
}

/* 顶部导航栏 */
.cc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 8px;
  background: rgba(11, 13, 25, 0.85);
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
  font-weight: 800;
  letter-spacing: 0.5px;
  padding: 2px 7px;
  border-radius: 6px;
  background: linear-gradient(135deg, #ff3b5c, #b845ff);
  color: #fff;
  box-shadow: 0 2px 10px rgba(255, 59, 92, 0.35);
}

.cc-brand-title {
  font-size: 15px;
  font-weight: 800;
  background: linear-gradient(90deg, #ffffff, #b9c6e8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.cc-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cc-icon-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--cc-text-main);
  border-radius: 999px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.18s ease;
}

.cc-icon-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}

.cc-icon-btn:active {
  transform: scale(0.95);
}

/* 情绪价值连胜/气运条 */
.cc-mood-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 16px;
  background: rgba(255, 215, 0, 0.06);
  border-bottom: 1px solid rgba(255, 215, 0, 0.14);
  font-size: 12px;
}

.cc-mood-quote {
  color: #ffd97d;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 65%;
}

.cc-mood-score {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  color: #fff;
}

/* 备战选角大厅 */
.cc-lobby {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px 14px 16px;
  gap: 10px;
  overflow-y: auto;
}

.cc-vs-stage {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 8px;
  background: radial-gradient(circle at 50% 50%, rgba(45, 58, 108, 0.35), rgba(16, 19, 34, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  padding: 12px 10px;
  position: relative;
}

.cc-slot-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 8px;
  border-radius: 14px;
  background: rgba(10, 12, 22, 0.65);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.cc-slot-card.active-editing {
  background: rgba(255, 255, 255, 0.07);
}

.cc-slot-tag {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 99px;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.cc-orb-preview {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 900;
  position: relative;
  margin-bottom: 6px;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cc-slot-card:hover .cc-orb-preview {
  transform: scale(1.08);
}

.cc-vs-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.cc-vs-badge {
  font-size: 18px;
  font-weight: 900;
  font-style: italic;
  background: linear-gradient(180deg, #ffd700, #ff5e3a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 12px rgba(255, 94, 58, 0.4);
}

/* 押注选择器 */
.cc-bet-box {
  background: var(--cc-bg-card);
  border: 1px solid var(--cc-border-subtle);
  border-radius: 14px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
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
  background: rgba(0, 240, 255, 0.16);
  border-color: #00f0ff;
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.25);
}

.cc-bet-btn.selected-p2 {
  background: rgba(255, 59, 92, 0.16);
  border-color: #ff3b5c;
  box-shadow: 0 0 14px rgba(255, 59, 92, 0.25);
}

/* 蛐蛐图鉴选择网格 */
.cc-roster-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.cc-cricket-option {
  background: rgba(18, 22, 40, 0.9);
  border: 1.5px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 8px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.16s ease;
  text-align: center;
}

.cc-cricket-option:hover {
  background: rgba(30, 36, 64, 0.95);
}

.cc-cricket-option:active {
  transform: scale(0.96);
}

.cc-mini-orb {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  margin-bottom: 5px;
}

/* 选中蛐蛐详情卡 */
.cc-detail-card {
  background: rgba(15, 19, 36, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.45;
}

/* 底部开战大按钮 */
.cc-start-btn {
  margin-top: auto;
  width: 100%;
  padding: 14px;
  border-radius: 16px;
  border: none;
  background: linear-gradient(135deg, #ff3b5c 0%, #ff7b00 50%, #ffd700 100%);
  color: #090a10;
  font-size: 16px;
  font-weight: 900;
  letter-spacing: 1px;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(255, 59, 92, 0.45);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.cc-start-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 28px rgba(255, 59, 92, 0.6);
}

.cc-start-btn:active {
  transform: scale(0.98);
}

/* 战斗舞台层 */
.cc-arena-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 8px 12px 12px;
  gap: 8px;
  position: relative;
}

.cc-hud-top {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 8px;
  background: rgba(14, 17, 32, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 8px 10px;
}

.cc-hp-bar-track {
  width: 100%;
  height: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 99px;
  overflow: hidden;
  position: relative;
}

.cc-hp-bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.12s ease-out;
}

.cc-timer-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 56px;
}

.cc-timer-num {
  font-size: 20px;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
}

.cc-timer-num.danger {
  color: #ff3b5c;
  animation: cc-pulse-fast 0.55s infinite alternate;
}

/* 弹幕解说条 */
.cc-commentary-banner {
  background: rgba(16, 20, 38, 0.92);
  border-left: 3px solid #ffd700;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 700;
  color: #f8f9ff;
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
}

/* Canvas 物理擂台容器 */
.cc-canvas-wrap {
  flex: 1;
  width: 100%;
  min-height: 350px;
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  background: #06070f;
  border: 2px solid rgba(255, 255, 255, 0.14);
  box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.9);
}

.cc-canvas-wrap.sudden-death {
  border-color: rgba(255, 59, 92, 0.75);
  box-shadow: inset 0 0 45px rgba(255, 59, 92, 0.28), 0 0 18px rgba(255, 59, 92, 0.35);
}

.cc-canvas-wrap.screen-shake {
  animation: cc-shake 0.22s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

/* 底部压住/点击暴走控制台 */
.cc-controls-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cc-berserk-btn {
  flex: 1;
  position: relative;
  overflow: hidden;
  padding: 13px 16px;
  border-radius: 16px;
  border: 2px solid rgba(255, 215, 0, 0.65);
  background: linear-gradient(135deg, #2b1222 0%, #4a1535 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 20px rgba(255, 59, 92, 0.35);
  transition: all 0.15s ease;
  touch-action: manipulation;
}

.cc-berserk-btn.ready {
  background: linear-gradient(135deg, #ff2a54 0%, #ff7b00 60%, #ffd000 100%);
  color: #0b0c14;
  border-color: #ffffff;
  box-shadow: 0 0 24px rgba(255, 123, 0, 0.65);
}

.cc-berserk-btn.charging {
  transform: scale(0.97);
  box-shadow: 0 0 32px rgba(255, 215, 0, 0.95);
}

.cc-berserk-btn.used {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.38);
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

/* 结算弹窗 */
.cc-result-overlay {
  position: absolute;
  inset: 0;
  background: rgba(6, 8, 16, 0.86);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  z-index: 40;
  animation: cc-fade-in 0.25s ease-out;
}

.cc-result-card {
  width: 100%;
  background: linear-gradient(180deg, #161b33 0%, #0d1021 100%);
  border: 1.5px solid rgba(255, 215, 0, 0.35);
  border-radius: 22px;
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.85);
}

@keyframes cc-pulse-fast {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.12); opacity: 0.78; }
}

@keyframes cc-shake {
  10%, 90% { transform: translate3d(-2px, 1px, 0); }
  20%, 80% { transform: translate3d(3px, -2px, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 2px, 0); }
  40%, 60% { transform: translate3d(4px, -1px, 0); }
}

@keyframes cc-fade-in {
  from { opacity: 0; transform: scale(0.95); }
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

  // 战斗 HUD 极简同步状态
  const [actualP1, setActualP1] = useState<CricketSpec>(CRICKETS.fire);
  const [actualP2, setActualP2] = useState<CricketSpec>(CRICKETS.wind);
  const [hudState, setHudState] = useState({
    p1HpPct: 100,
    p1Shield: false,
    p1Berserk: false,
    p2HpPct: 100,
    p2Shield: false,
    p2Berserk: false,
    suddenDeath: false,
  });

  const [commentary, setCommentary] = useState<string>('🎙️ 选好你的本命圆球，放入斗盆即可自动开撞！');
  const [screenShake, setScreenShake] = useState<boolean>(false);

  // 场外暴走（压住蓄力 / 松开释放，每局1次）
  const [berserkUsed, setBerserkUsed] = useState<boolean>(false);
  const [isChargingBerserk, setIsChargingBerserk] = useState<boolean>(false);
  const [chargeProgress, setChargeProgress] = useState<number>(0);

  // 极简结算弹窗状态
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
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(220 + Math.random() * 90, now);
          osc.frequency.exponentialRampToValueAtTime(85, now + 0.09);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.09);
        } else if (type === 'clash') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.exponentialRampToValueAtTime(42, now + 0.14);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.14);
        } else if (type === 'laser') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(820, now);
          osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.12);
        } else if (type === 'skill') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(340, now);
          osc.frequency.exponentialRampToValueAtTime(680, now + 0.15);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.15);
        } else if (type === 'explosion') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(115, now);
          osc.frequency.exponentialRampToValueAtTime(28, now + 0.22);
          gain.gain.setValueAtTime(0.22, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.22);
        } else if (type === 'charge') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.linearRampToValueAtTime(620, now + 0.35);
          gain.gain.setValueAtTime(0.09, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.35);
        } else if (type === 'berserk') {
          [261.6, 329.6, 392.0, 523.2].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now + idx * 0.04);
            gain.gain.setValueAtTime(0.13, now + idx * 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.04);
            osc.stop(now + idx * 0.04 + 0.3);
          });
        } else if (type === 'win') {
          [392.0, 493.88, 587.33, 783.99].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.09);
            gain.gain.setValueAtTime(0.15, now + idx * 0.09);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.32);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.09);
            osc.stop(now + idx * 0.09 + 0.32);
          });
        }
      } catch {
        // 忽略浏览器自动播放限制异常
      }
    },
    []
  );

  const triggerShake = useCallback(() => {
    setScreenShake(true);
    window.setTimeout(() => setScreenShake(false), 220);
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
    setCommentary(`🎲 重新洗牌！【${first.name}】对决【${second.name}】！`);
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
      p1Shield: chosenP1.id === 'rock',
      p1Berserk: false,
      p2HpPct: 100,
      p2Shield: chosenP2.id === 'rock',
      p2Berserk: false,
      suddenDeath: false,
    });

    const betTargetName = betSide === 'p1' ? chosenP1.name : chosenP2.name;
    setCommentary(`🔥 比赛开始！你支持了【${betTargetName}】，关键时刻长按下方按钮助它暴走！`);
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

  // 核心 Canvas 物理与技能循环（节奏放缓、去除数字噪音）
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

    const spawnParticles = (x: number, y: number, color: string, count = 10, speedMul = 0.85) => {
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = (1.1 + Math.random() * 2.8) * speedMul;
        state.particles.push({
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          r: 2 + Math.random() * 2.8,
          color,
          alpha: 1,
          decay: 0.024 + Math.random() * 0.018,
        });
      }
    };

    const addFloatingText = (x: number, y: number, text: string, color: string, scale = 1) => {
      state.texts.push({
        x: Math.max(40, Math.min(width - 40, x)),
        y: Math.max(28, Math.min(height - 20, y)),
        vy: -1.1,
        text,
        color,
        scale,
        alpha: 1,
      });
    };

    const applyDamage = (attacker: FighterEntity, defender: FighterEntity, rawDmg: number, effectLabel = '') => {
      let dmg = Math.max(4, Math.round(rawDmg));
      if (state.timeLeft <= 15) {
        dmg = Math.round(dmg * 1.38);
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
          addFloatingText(defender.x, defender.y - defender.radius - 8, '🛡️抵挡', '#ffe082', 0.95);
        }
      }

      if (dmg > 0) {
        defender.hp = Math.max(0, defender.hp - dmg);
        if (effectLabel) {
          addFloatingText(
            defender.x,
            defender.y - defender.radius - 10,
            effectLabel,
            attacker.berserkTimer > 0 ? '#ffd700' : attacker.spec.color,
            dmg >= 38 ? 1.25 : 1.0
          );
        }
      }
      return dmg;
    };

    // 触发碰壁反弹技能
    const triggerWallSkill = (fighter: FighterEntity, enemy: FighterEntity, forceUltimate = false) => {
      fighter.wallCount += 1;
      const spec = fighter.spec;

      if (spec.id === 'fire') {
        const prev = fighter.nitroStacks;
        fighter.nitroStacks = Math.min(3, fighter.nitroStacks + (forceUltimate ? 2 : 1));
        const boost = 1.08 + fighter.nitroStacks * 0.08;
        fighter.vx *= boost;
        fighter.vy *= boost;
        spawnParticles(fighter.x, fighter.y, '#ff5e3a', 8, 0.9);
        if (fighter.nitroStacks > prev) {
          addFloatingText(fighter.x, fighter.y - 24, '🔥烈焰加速', '#ff9a00', 0.95);
        }
        if (fighter.nitroStacks === 3) {
          setCommentary(`🔥【${spec.name}】全身烈焰拉满，下一撞威力惊人！`);
        }
      } else if (spec.id === 'rock') {
        if (forceUltimate || fighter.wallCount % 3 === 0) {
          fighter.shield = Math.min(110, fighter.shield + 50);
          state.rings.push({
            x: fighter.x,
            y: fighter.y,
            r: fighter.radius,
            maxR: 150,
            color: '#f5a623',
            alpha: 0.92,
            lineWidth: 4,
          });
          const dist = Math.hypot(enemy.x - fighter.x, enemy.y - fighter.y);
          if (dist <= 160) {
            enemy.slowTimer = 2.2;
            enemy.vx *= 0.68;
            enemy.vy *= 0.68;
            applyDamage(fighter, enemy, 14, '震波减速');
          }
          playSfx('skill');
          addFloatingText(fighter.x, fighter.y - 26, '🛡️震地护盾', '#ffe082', 1.0);
          setCommentary(`🛡️【${spec.name}】碰壁开启震地护盾，震波压制全场！`);
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
            vx: Math.cos(ang) * 3.8,
            vy: Math.sin(ang) * 3.8,
            radius: 10,
            life: 4.0,
            color: spec.color,
          });
          playSfx('skill');
          addFloatingText(fighter.x, fighter.y - 24, '⚡幻影分身', '#00f0ff', 1.0);
          setCommentary(`⚡【${spec.name}】碰壁分化出电光残影，前后夹击对手！`);
        }
      } else if (spec.id === 'void') {
        if (forceUltimate || fighter.wallCount % 2 === 1) {
          state.rings.push({
            x: fighter.x,
            y: fighter.y,
            r: 130,
            maxR: fighter.radius,
            color: '#b845ff',
            alpha: 0.88,
            lineWidth: 3,
            inward: true,
          });
          const dx = fighter.x - enemy.x;
          const dy = fighter.y - enemy.y;
          const dist = Math.max(20, Math.hypot(dx, dy));
          const pullForce = forceUltimate ? 2.1 : 1.25;
          enemy.vx += (dx / dist) * pullForce;
          enemy.vy += (dy / dist) * pullForce;
          addFloatingText(fighter.x, fighter.y - 24, '🌀引力拉扯', '#e29eff', 0.95);
          if (Math.random() < 0.4) {
            setCommentary(`🌀【${spec.name}】释放引力脉冲，强行把对手扯离原路线！`);
          }
        }
      } else if (spec.id === 'light') {
        playSfx('laser');
        const angles = [
          Math.atan2(enemy.y - fighter.y, enemy.x - fighter.x),
          Math.atan2(height / 2 - fighter.y, width / 2 - fighter.x) + (Math.random() * 0.5 - 0.25),
        ];
        angles.forEach((ang, idx) => {
          const rayLen = 420;
          const x2 = fighter.x + Math.cos(ang) * rayLen;
          const y2 = fighter.y + Math.sin(ang) * rayLen;
          state.lasers.push({
            owner: fighter.side,
            x1: fighter.x,
            y1: fighter.y,
            x2,
            y2,
            life: 0.3,
            maxLife: 0.3,
            color: idx === 0 ? '#38ff8e' : '#ffffff',
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
            applyDamage(fighter, enemy, idx === 0 ? 15 : 11, idx === 0 ? '⚡极光穿透' : '');
            spawnParticles(enemy.x, enemy.y, '#38ff8e', 7, 0.8);
          }
        });
        if (Math.random() < 0.4) {
          setCommentary(`💎【${spec.name}】借墙壁折射出极光射线，远程消耗对手！`);
        }
      }
    };

    // 绑定场外暴走触发器
    state.triggerBerserkNow = (powerBonus: number) => {
      const target = betSideRef.current === 'p1' ? p1 : p2;
      const rival = betSideRef.current === 'p1' ? p2 : p1;
      target.berserkTimer = 5.5 * powerBonus;
      target.radius = Math.round(target.spec.radius * 1.24);
      target.shield += Math.round(35 * powerBonus);

      const dx = rival.x - target.x;
      const dy = rival.y - target.y;
      const dist = Math.max(1, Math.hypot(dx, dy));
      const dashSpeed = target.spec.baseSpeed * 1.55;
      target.vx = (dx / dist) * dashSpeed;
      target.vy = (dy / dist) * dashSpeed;

      state.rings.push({
        x: target.x,
        y: target.y,
        r: target.radius,
        maxR: 195,
        color: '#ffd700',
        alpha: 1,
        lineWidth: 5,
      });
      spawnParticles(target.x, target.y, '#ffd700', 22, 1.25);
      addFloatingText(target.x, target.y - 32, '🔥全盛暴走!', '#ffd700', 1.35);
      triggerWallSkill(target, rival, true);
      playSfx('berserk');
      triggerShake();
      setCommentary(`🚨 场外助威生效！【${target.spec.name}】体型暴涨，气势全开冲向对手！`);
    };

    const secondInterval = window.setInterval(() => {
      if (state.finished) return;
      state.timeLeft = Math.max(0, state.timeLeft - 1);
      if (state.timeLeft === 15) {
        setCommentary('⚡ 进入最后缩圈决战时刻！四壁带电收缩，对决全面升温！');
        playSfx('berserk');
        triggerShake();
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

      // 蓄力时子弹时间慢放
      const dtScale = isChargingRef.current ? 0.42 : 1.0;

      // 死斗模式缩圈边界
      const shrinkRatio = state.timeLeft <= 15 ? (15 - state.timeLeft) / 15 : 0;
      const padX = Math.round(shrinkRatio * (width * 0.16));
      const padY = Math.round(shrinkRatio * (height * 0.14));
      const minX = 8 + padX;
      const maxX = width - 8 - padX;
      const minY = 8 + padY;
      const maxY = height - 8 - padY;

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
          targetMinSpd *= 1 + f.nitroStacks * 0.14;
        }
        if (f.berserkTimer > 0) {
          targetMinSpd *= 1.32;
        }
        if (f.slowTimer > 0) {
          targetMinSpd *= 0.65;
        }
        if (state.timeLeft <= 15) {
          targetMinSpd *= 1.15;
        }
        const maxAllowedSpd = targetMinSpd * 1.35;

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
        f.rotation += curSpd * 0.025 * dtScale;

        f.trail.push({
          x: f.x,
          y: f.y,
          r: f.radius * (f.spec.id === 'fire' && f.nitroStacks > 0 ? 0.9 : 0.76),
          alpha: f.berserkTimer > 0 ? 0.55 : 0.34,
          color: f.berserkTimer > 0 ? '#ffd700' : f.spec.color,
        });
        if (f.trail.length > 8) {
          f.trail.shift();
        }

        let hitWall = false;
        if (f.x - f.radius < minX) {
          f.x = minX + f.radius;
          f.vx = Math.abs(f.vx);
          f.vy += (Math.random() - 0.5) * 0.45;
          hitWall = true;
        } else if (f.x + f.radius > maxX) {
          f.x = maxX - f.radius;
          f.vx = -Math.abs(f.vx);
          f.vy += (Math.random() - 0.5) * 0.45;
          hitWall = true;
        }

        if (f.y - f.radius < minY) {
          f.y = minY + f.radius;
          f.vy = Math.abs(f.vy);
          f.vx += (Math.random() - 0.5) * 0.45;
          hitWall = true;
        } else if (f.y + f.radius > maxY) {
          f.y = maxY - f.radius;
          f.vy = -Math.abs(f.vy);
          f.vx += (Math.random() - 0.5) * 0.45;
          hitWall = true;
        }

        if (hitWall) {
          playSfx('wall');
          spawnParticles(f.x, f.y, f.spec.color, 5, 0.65);
          triggerWallSkill(f, enemy, false);
        }
      };

      stepFighter(p1, p2);
      stepFighter(p2, p1);

      // 主圆球敌我肉搏碰撞
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
        const restitution = 1.03;

        p1.vx = (p1.vx - p * p2.spec.mass * nx) * restitution;
        p1.vy = (p1.vy - p * p2.spec.mass * ny) * restitution;
        p2.vx = (p2.vx + p * p1.spec.mass * nx) * restitution;
        p2.vy = (p2.vy + p * p1.spec.mass * ny) * restitution;

        if (p1.invulnTimer <= 0 && p2.invulnTimer <= 0) {
          p1.invulnTimer = 0.18;
          p2.invulnTimer = 0.18;

          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;

          playSfx('clash');
          state.hitStopFrames = relVel > 5.5 ? 3 : 2;
          if (relVel > 5.2 || p1.nitroStacks >= 2 || p2.nitroStacks >= 2 || p1.berserkTimer > 0 || p2.berserkTimer > 0) {
            triggerShake();
          }

          spawnParticles(midX, midY, '#ffffff', 12, 1.0);
          state.rings.push({
            x: midX,
            y: midY,
            r: 8,
            maxR: 62,
            color: '#ffffff',
            alpha: 0.8,
            lineWidth: 2.5,
          });

          const resolveMeleeHit = (attacker: FighterEntity, defender: FighterEntity, pushSign: number) => {
            const spd = Math.hypot(attacker.vx, attacker.vy);
            let raw = attacker.spec.baseAtk * (0.8 + spd * 0.14);
            if (attacker.berserkTimer > 0) {
              raw *= 1.5;
            }

            let label = '重击!';
            if (attacker.spec.id === 'fire') {
              if (attacker.nitroStacks > 0) {
                raw *= 1 + attacker.nitroStacks * 0.32;
                label = attacker.nitroStacks === 3 ? '💥烈焰破甲!' : '🔥破甲重击';
                defender.vx += nx * pushSign * (1.3 + attacker.nitroStacks * 0.55);
                defender.vy += ny * pushSign * (1.3 + attacker.nitroStacks * 0.55);
                attacker.nitroStacks = 0;
              }
            } else if (attacker.spec.id === 'wind') {
              defender.stunTimer = 0.28;
              label = '⚡感电麻痹';
              spawnParticles(defender.x, defender.y, '#00f0ff', 8, 0.9);
            } else if (attacker.spec.id === 'light') {
              attacker.vx -= nx * pushSign * 1.85;
              attacker.vy -= ny * pushSign * 1.85;
              label = '💎借力闪避';
              if (state.mines.length < 4) {
                state.mines.push({
                  owner: attacker.side,
                  x: midX,
                  y: midY,
                  radius: 14,
                  timer: 1.2,
                  maxTimer: 1.2,
                  color: '#38ff8e',
                });
              }
            }

            const actualDealt = applyDamage(attacker, defender, raw, label);

            if (attacker.spec.id === 'void' && actualDealt > 0) {
              const heal = Math.max(4, Math.round(actualDealt * 0.45));
              attacker.hp = Math.min(attacker.maxHp, attacker.hp + heal);
              addFloatingText(attacker.x, attacker.y + 18, '🌀生命汲取', '#38ff8e', 0.95);
            }

            if (defender.spec.id === 'rock' && actualDealt > 0) {
              const reflect = Math.max(5, Math.round(actualDealt * 0.48));
              attacker.hp = Math.max(0, attacker.hp - reflect);
              addFloatingText(attacker.x, attacker.y - 26, '🛡️荆棘反伤', '#f5a623', 0.95);
            }
          };

          resolveMeleeHit(p1, p2, 1);
          resolveMeleeHit(p2, p1, -1);

          if (p1.hp > 0 && p1.hp < p1.maxHp * 0.25) {
            setCommentary(`😱 危！【${p1.spec.name}】陷入残血，看能否靠撞墙绝地反击！`);
          } else if (p2.hp > 0 && p2.hp < p2.maxHp * 0.25) {
            setCommentary(`🔥 优势明显！【${p2.spec.name}】已经摇摇欲坠！`);
          }
        }
      }

      // 更新疾风幻影分身球
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
        clone.vx = clone.vx * 0.94 + Math.cos(ang) * 0.32;
        clone.vy = clone.vy * 0.94 + Math.sin(ang) * 0.32;
        clone.x += clone.vx * dtScale;
        clone.y += clone.vy * dtScale;

        if (clone.x - clone.radius < minX || clone.x + clone.radius > maxX) clone.vx *= -1;
        if (clone.y - clone.radius < minY || clone.y + clone.radius > maxY) clone.vy *= -1;

        if (Math.hypot(target.x - clone.x, target.y - clone.y) < target.radius + clone.radius) {
          applyDamage(ownerEntity, target, 14, '⚡残影围殴');
          spawnParticles(clone.x, clone.y, clone.color, 8, 0.85);
          playSfx('wall');
          state.clones.splice(i, 1);
        }
      }

      // 更新极光棱镜延时炸弹
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
            maxR: 84,
            color: '#38ff8e',
            alpha: 0.92,
            lineWidth: 4,
          });
          spawnParticles(mine.x, mine.y, '#38ff8e', 14, 1.1);
          const distToTarget = Math.hypot(target.x - mine.x, target.y - mine.y);
          if (distToTarget <= 84 + target.radius) {
            applyDamage(ownerEntity, target, 28, '💥极光炸弹!');
            const ang = Math.atan2(target.y - mine.y, target.x - mine.x);
            target.vx += Math.cos(ang) * 2.5;
            target.vy += Math.sin(ang) * 2.5;
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
          reason = '双方极限对撞同归于尽，我方险胜一筹！';
        } else if (p2.hp <= 0) {
          winnerSide = 'p1';
          reason = `【${p1.spec.name}】正面对决将对手彻底击溃！`;
        } else if (p1.hp <= 0) {
          winnerSide = 'p2';
          reason = `【${p2.spec.name}】火力全开拿下了本局胜利！`;
        } else {
          const p1Pct = p1.hp / p1.maxHp;
          const p2Pct = p2.hp / p2.maxHp;
          winnerSide = p1Pct >= p2Pct ? 'p1' : 'p2';
          reason = '对决时间到，按场上剩余状态判定胜出！';
        }

        const betWon = winnerSide === betSideRef.current;
        const winFighter = winnerSide === 'p1' ? p1 : p2;
        const mvpTitle =
          winFighter.hp < winFighter.maxHp * 0.25
            ? '🔥 绝境反杀战神'
            : winFighter.wallCount >= 10
            ? '⚡ 贴墙弹射高手'
            : '👑 擂台霸主';

        playSfx('win');
        setBattleResult({
          winner: winnerSide,
          betWon,
          reason,
          mvpTitle,
        });
      }

      // 同步极简 HUD
      if (timestamp - lastHudSync > 90 || state.finished) {
        lastHudSync = timestamp;
        setHudState({
          p1HpPct: Math.max(0, Math.round((p1.hp / p1.maxHp) * 100)),
          p1Shield: p1.shield > 0,
          p1Berserk: p1.berserkTimer > 0,
          p2HpPct: Math.max(0, Math.round((p2.hp / p2.maxHp) * 100)),
          p2Shield: p2.shield > 0,
          p2Berserk: p2.berserkTimer > 0,
          suddenDeath: state.timeLeft <= 15,
        });
      }

      // ==================== 绘制擂台画面 ====================
      ctx.clearRect(0, 0, width, height);

      // 背景极简网格
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
      ctx.lineWidth = 1;
      const gridStep = 36;
      for (let gx = 0; gx < width; gx += gridStep) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
        ctx.stroke();
      }
      for (let gy = 0; gy < height; gy += gridStep) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
        ctx.stroke();
      }

      ctx.strokeStyle = state.timeLeft <= 15 ? 'rgba(255, 59, 92, 0.16)' : 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 62, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 缩圈边界绘制
      if (padX > 0 || padY > 0 || state.timeLeft <= 15) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 42, 84, 0.11)';
        ctx.fillRect(0, 0, width, minY);
        ctx.fillRect(0, maxY, width, height - maxY);
        ctx.fillRect(0, minY, minX, maxY - minY);
        ctx.fillRect(maxX, minY, width - maxX, maxY - minY);

        ctx.strokeStyle = '#ff3b5c';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
        ctx.restore();
      } else {
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
        ctx.restore();
      }

      // 绘制极光炸弹
      state.mines.forEach((mine) => {
        ctx.save();
        const pulse = 1 + Math.sin(timestamp * 0.02) * 0.18;
        ctx.strokeStyle = mine.color;
        ctx.fillStyle = 'rgba(56, 255, 142, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mine.x, mine.y, mine.radius * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = 'rgba(56, 255, 142, 0.25)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(mine.x, mine.y, 84 * (1 - mine.timer / mine.maxTimer), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // 绘制激光束
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
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 5 * alpha + 1;
        ctx.shadowColor = l.color;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(l.x2, l.y2);
        ctx.stroke();
        ctx.restore();
      }

      // 绘制冲击波圆环
      for (let i = state.rings.length - 1; i >= 0; i--) {
        const ring = state.rings[i];
        if (ring.inward) {
          ring.r -= 3.6;
          ring.alpha -= 0.032;
        } else {
          ring.r += (ring.maxR - ring.r) * 0.14 + 1.2;
          ring.alpha -= 0.035;
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

      // 绘制疾风幻影分身球
      state.clones.forEach((clone) => {
        ctx.save();
        ctx.shadowColor = clone.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = clone.color;
        ctx.globalAlpha = 0.82;
        ctx.beginPath();
        ctx.arc(clone.x, clone.y, clone.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      });

      // 绘制双方主圆球蛐蛐（无数字干扰，纯净视觉）
      const drawFighter = (f: FighterEntity) => {
        f.trail.forEach((t, idx) => {
          const ratio = (idx + 1) / f.trail.length;
          ctx.save();
          ctx.fillStyle = t.color;
          ctx.globalAlpha = ratio * t.alpha * 0.42;
          ctx.beginPath();
          ctx.arc(t.x, t.y, t.r * ratio, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        ctx.save();
        ctx.translate(f.x, f.y);

        // 蓄力瞄准准星光环
        if (isChargingRef.current && f.side === betSideRef.current) {
          ctx.save();
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([4, 4]);
          ctx.rotate(f.rotation * 2);
          ctx.beginPath();
          ctx.arc(0, 0, f.radius + 14 + chargeValRef.current * 8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // 暴走金色闪电光环
        if (f.berserkTimer > 0) {
          ctx.save();
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#ffd700';
          ctx.shadowBlur = 20;
          ctx.setLineDash([6, 4]);
          ctx.rotate(-f.rotation * 1.5);
          ctx.beginPath();
          ctx.arc(0, 0, f.radius + 9, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // 吸收护盾圈
        if (f.shield > 0) {
          ctx.save();
          ctx.strokeStyle = '#ffe082';
          ctx.fillStyle = 'rgba(255, 224, 130, 0.15)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, f.radius + 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }

        // 赤焰暴君烈焰环
        if (f.spec.id === 'fire' && f.nitroStacks > 0) {
          for (let s = 1; s <= f.nitroStacks; s++) {
            ctx.beginPath();
            ctx.strokeStyle = '#ff9a00';
            ctx.lineWidth = 1.8;
            ctx.arc(0, 0, f.radius + s * 3.5, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        // 圆球主体渐变
        const grad = ctx.createRadialGradient(-f.radius * 0.3, -f.radius * 0.3, 3, 0, 0, f.radius);
        grad.addColorStop(0, f.spec.secondaryColor);
        grad.addColorStop(0.65, f.spec.color);
        grad.addColorStop(1, '#090b16');

        ctx.shadowColor = f.berserkTimer > 0 ? '#ffd700' : f.spec.color;
        ctx.shadowBlur = f.berserkTimer > 0 ? 24 : 16;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, f.radius, 0, Math.PI * 2);
        ctx.fill();

        // 属性几何纹章内核
        ctx.save();
        ctx.rotate(f.rotation);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.lineWidth = 1.8;
        if (f.spec.id === 'rock') {
          ctx.beginPath();
          for (let k = 0; k < 6; k++) {
            const a = (Math.PI / 3) * k;
            const rx = Math.cos(a) * (f.radius * 0.58);
            const ry = Math.sin(a) * (f.radius * 0.58);
            if (k === 0) ctx.moveTo(rx, ry);
            else ctx.lineTo(rx, ry);
          }
          ctx.closePath();
          ctx.stroke();
        } else if (f.spec.id === 'wind') {
          ctx.beginPath();
          for (let k = 0; k < 3; k++) {
            const a = ((Math.PI * 2) / 3) * k;
            const rx = Math.cos(a) * (f.radius * 0.65);
            const ry = Math.sin(a) * (f.radius * 0.65);
            if (k === 0) ctx.moveTo(rx, ry);
            else ctx.lineTo(rx, ry);
          }
          ctx.closePath();
          ctx.stroke();
        } else if (f.spec.id === 'light') {
          ctx.beginPath();
          for (let k = 0; k < 4; k++) {
            const a = (Math.PI / 2) * k;
            const rx = Math.cos(a) * (f.radius * 0.65);
            const ry = Math.sin(a) * (f.radius * 0.65);
            if (k === 0) ctx.moveTo(rx, ry);
            else ctx.lineTo(rx, ry);
          }
          ctx.closePath();
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, f.radius * 0.52, 0, Math.PI * 1.4);
          ctx.stroke();
        }
        ctx.restore();

        // 圆周生命弧线环
        const hpRatio = Math.max(0, f.hp / f.maxHp);
        ctx.strokeStyle = f.side === 'p1' ? '#00f0ff' : '#ff3b5c';
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.arc(0, 0, f.radius - 1.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * hpRatio);
        ctx.stroke();

        // 球心属性图标（替代杂乱的血量数字）
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(f.spec.icon, 0, 1);

        // 头顶阵营标识
        ctx.fillStyle = f.side === 'p1' ? '#00f0ff' : '#ff3b5c';
        ctx.font = '900 10px sans-serif';
        ctx.fillText(f.side === 'p1' ? '我方' : '对手', 0, -f.radius - 8);

        ctx.restore();
      };

      drawFighter(p1);
      drawFighter(p2);

      // 绘制粒子特效
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

      // 绘制技能效果文字（不含琐碎数字）
      for (let i = state.texts.length - 1; i >= 0; i--) {
        const ft = state.texts[i];
        ft.y += ft.vy * dtScale;
        ft.alpha -= 0.02;
        if (ft.alpha <= 0) {
          state.texts.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.font = `900 ${Math.round(12 * ft.scale)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.lineWidth = 3;
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
    const sideColor = side === 'p1' ? '#00f0ff' : '#ff3b5c';

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
          borderColor: isEditing ? sideColor : 'rgba(255,255,255,0.08)',
          boxShadow: isEditing ? `0 0 18px ${side === 'p1' ? 'rgba(0,240,255,0.22)' : 'rgba(255,59,92,0.22)'}` : 'none',
        }}
      >
        <span
          className="cc-slot-tag"
          style={{
            background: side === 'p1' ? 'rgba(0, 240, 255, 0.18)' : 'rgba(255, 59, 92, 0.18)',
            color: sideColor,
          }}
        >
          {side === 'p1' ? 'P1 我方出战' : 'P2 敌方擂主'}
        </span>

        <div
          className="cc-orb-preview"
          style={{
            background: isRandom
              ? 'radial-gradient(circle at 30% 30%, #ffd700, #8a2be2)'
              : `radial-gradient(circle at 30% 30%, ${spec?.secondaryColor}, ${spec?.color})`,
            boxShadow: isRandom ? '0 0 18px rgba(255, 215, 0, 0.5)' : `0 0 18px ${spec?.glowColor}`,
          }}
        >
          {isRandom ? '🎲' : spec?.icon}
        </div>

        <div style={{ fontWeight: 800, fontSize: '14px', color: '#fff' }}>
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
        {/* 顶部栏（无 mrduan 字样，简洁清爽） */}
        <header className="cc-header">
          <div className="cc-brand">
            <span className="cc-brand-badge">斗技场</span>
            <span className="cc-brand-title">赛博电子斗蛐蛐</span>
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

        {/* ==================== 阶段 1: 选角与押注备战大厅 ==================== */}
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

            {/* 蛐蛐选择面板 */}
            <section className="cc-bet-box">
              <div className="cc-section-label">
                <span>
                  正在为{' '}
                  <strong style={{ color: editingSide === 'p1' ? '#00f0ff' : '#ff3b5c' }}>
                    {editingSide === 'p1' ? 'P1 我方' : 'P2 对手'}
                  </strong>{' '}
                  挑选蛐蛐：
                </span>
                <button
                  type="button"
                  onClick={() => setEditingSide(editingSide === 'p1' ? 'p2' : 'p1')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ffd700',
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
                        borderColor: selected ? c.color : 'rgba(255,255,255,0.08)',
                        background: selected ? 'rgba(255,255,255,0.1)' : 'rgba(18, 22, 40, 0.9)',
                      }}
                    >
                      <div
                        className="cc-mini-orb"
                        style={{
                          background: `radial-gradient(circle at 30% 30%, ${c.secondaryColor}, ${c.color})`,
                          boxShadow: `0 0 10px ${c.glowColor}`,
                        }}
                      >
                        {c.icon}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>{c.name}</div>
                      <div style={{ fontSize: '10px', color: 'var(--cc-text-dim)' }}>{c.title}</div>
                    </button>
                  );
                })}

                {/* 随机盲盒选项 */}
                <button
                  type="button"
                  className="cc-cricket-option"
                  onClick={() => {
                    if (editingSide === 'p1') setP1Slot('random');
                    else setP2Slot('random');
                    playSfx('skill');
                  }}
                  style={{
                    borderColor: currentEditingSlot === 'random' ? '#ffd700' : 'rgba(255,255,255,0.08)',
                    background: currentEditingSlot === 'random' ? 'rgba(255, 215, 0, 0.14)' : 'rgba(18, 22, 40, 0.9)',
                  }}
                >
                  <div
                    className="cc-mini-orb"
                    style={{
                      background: 'radial-gradient(circle at 30% 30%, #ffd700, #8a2be2)',
                      boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
                    }}
                  >
                    🎲
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#ffd700' }}>随机抽签</div>
                  <div style={{ fontSize: '10px', color: 'var(--cc-text-dim)' }}>盲盒出战</div>
                </button>
              </div>
            </section>

            {/* 极简技能效果说明（无数字） */}
            <section className="cc-detail-card">
              {currentEditingSlot === 'random' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontWeight: 800, color: '#ffd700', fontSize: '13px' }}>
                    🎲 随机盲盒出战
                  </div>
                  <div style={{ color: 'var(--cc-text-dim)' }}>
                    开局自动抽取一只属性圆球登场，胜负全凭今日手气！
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '13px', color: previewSpec.color }}>
                      {previewSpec.icon} {previewSpec.name}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--cc-text-dim)' }}>
                      {previewSpec.sizeLabel} · {previewSpec.speedLabel}
                    </span>
                  </div>
                  <div>
                    <strong style={{ color: '#ffd700' }}>【碰壁】{previewSpec.wallSkillName}：</strong>
                    <span style={{ color: '#d7e0f5' }}>{previewSpec.wallSkillDesc}</span>
                  </div>
                  <div>
                    <strong style={{ color: '#00f0ff' }}>【对撞】{previewSpec.clashSkillName}：</strong>
                    <span style={{ color: '#d7e0f5' }}>{previewSpec.clashSkillDesc}</span>
                  </div>
                </div>
              )}
            </section>

            {/* 赛前押注 & 祝福心愿 */}
            <section className="cc-bet-box">
              <div className="cc-section-label">
                <span>🎯 选择支持方与今日心愿：</span>
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

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
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
                      border: stakeId === stake.id ? '1px solid #ffd700' : '1px solid rgba(255,255,255,0.1)',
                      background: stakeId === stake.id ? 'rgba(255, 215, 0, 0.16)' : 'rgba(255,255,255,0.04)',
                      color: stakeId === stake.id ? '#ffd700' : 'var(--cc-text-dim)',
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

        {/* ==================== 阶段 2: 手机屏幕限定擂台搏斗 ==================== */}
        {phase === 'battle' && (
          <main className="cc-arena-view">
            {/* 顶部双方极简血条 HUD（不显示杂乱数字） */}
            <section className="cc-hud-top">
              {/* P1 血条 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 800 }}>
                  <span style={{ color: '#00f0ff' }}>
                    {actualP1.icon} {actualP1.name} {betSide === 'p1' ? '🎯' : ''}
                  </span>
                  {hudState.p1Berserk ? (
                    <span style={{ color: '#ffd700', fontSize: '10px' }}>⚡暴走</span>
                  ) : hudState.p1Shield ? (
                    <span style={{ color: '#ffe082', fontSize: '10px' }}>🛡️护盾</span>
                  ) : null}
                </div>
                <div className="cc-hp-bar-track">
                  <div
                    className="cc-hp-bar-fill"
                    style={{
                      width: `${hudState.p1HpPct}%`,
                      background: 'linear-gradient(90deg, #0072ff, #00f0ff)',
                    }}
                  />
                </div>
              </div>

              {/* 阶段标识 */}
              <div className="cc-timer-box">
                <span
                  style={{
                    fontSize: '11px',
                    color: hudState.suddenDeath ? '#ff3b5c' : '#ffd700',
                    fontWeight: 900,
                    padding: '3px 8px',
                    borderRadius: '99px',
                    background: hudState.suddenDeath ? 'rgba(255, 59, 92, 0.16)' : 'rgba(255, 215, 0, 0.12)',
                  }}
                >
                  {hudState.suddenDeath ? '⚡缩圈决战' : '⚔️激战中'}
                </span>
              </div>

              {/* P2 血条 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 800 }}>
                  {hudState.p2Berserk ? (
                    <span style={{ color: '#ffd700', fontSize: '10px' }}>⚡暴走</span>
                  ) : hudState.p2Shield ? (
                    <span style={{ color: '#ffe082', fontSize: '10px' }}>🛡️护盾</span>
                  ) : (
                    <span />
                  )}
                  <span style={{ color: '#ff3b5c' }}>
                    {betSide === 'p2' ? '🎯' : ''} {actualP2.name} {actualP2.icon}
                  </span>
                </div>
                <div className="cc-hp-bar-track">
                  <div
                    className="cc-hp-bar-fill"
                    style={{
                      width: `${hudState.p2HpPct}%`,
                      background: 'linear-gradient(90deg, #ff3b5c, #ff8a00)',
                      marginLeft: 'auto',
                    }}
                  />
                </div>
              </div>
            </section>

            {/* 实时解说条 */}
            <div className="cc-commentary-banner">
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {commentary}
              </span>
            </div>

            {/* 物理碰撞 Canvas 容器 */}
            <div
              ref={wrapRef}
              className={`cc-canvas-wrap ${hudState.suddenDeath ? 'sudden-death' : ''} ${screenShake ? 'screen-shake' : ''}`}
            >
              <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
            </div>

            {/* 底部控制台：压住加一次暴走 + 返回选角 */}
            <section className="cc-controls-bar">
              <button
                type="button"
                className="cc-icon-btn"
                onClick={() => setPhase('lobby')}
                style={{ padding: '13px 14px', borderRadius: '14px' }}
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
                    ? '⚡ 本局暴走已释放'
                    : isChargingBerserk
                    ? '🔥 蓄力注入中... 松开爆发！'
                    : `🔥 按住蓄力 · 助【${betSide === 'p1' ? actualP1.name : actualP2.name}】暴走`}
                </span>
              </button>
            </section>

            {/* 极简赛后结算弹窗（无统计数据表） */}
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
                        fontWeight: 800,
                        background: battleResult.betWon ? 'rgba(56, 255, 142, 0.18)' : 'rgba(255, 215, 0, 0.16)',
                        color: battleResult.betWon ? '#38ff8e' : '#ffd700',
                        marginBottom: '8px',
                      }}
                    >
                      {battleResult.mvpTitle}
                    </span>
                    <h2 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 900, color: '#fff' }}>
                      {battleResult.winner === 'p1'
                        ? `🏆 【${actualP1.name}】获胜！`
                        : `🏆 【${actualP2.name}】获胜！`}
                    </h2>
                    <div style={{ fontSize: '12px', color: 'var(--cc-text-dim)' }}>{battleResult.reason}</div>
                  </div>

                  {/* 情绪价值签语 */}
                  <div
                    style={{
                      background: 'rgba(255, 215, 0, 0.08)',
                      border: '1px solid rgba(255, 215, 0, 0.25)',
                      borderRadius: '14px',
                      padding: '12px 14px',
                      fontSize: '13px',
                      lineHeight: 1.55,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontWeight: 800, color: '#ffd700', marginBottom: '4px' }}>
                      {battleResult.betWon
                        ? `🎉 押注命中 · ${activeStake.label}`
                        : `🌈 虽败犹荣 · 霉运已替你挡下`}
                    </div>
                    <div style={{ color: '#e6ecff' }}>
                      {battleResult.betWon ? activeStake.winQuote : activeStake.loseQuote}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
                    <button
                      type="button"
                      className="cc-bet-btn"
                      onClick={() => setPhase('lobby')}
                      style={{ padding: '12px', fontSize: '13px' }}
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

        {/* 极简玩法弹窗 */}
        {showGuideModal && (
          <div className="cc-result-overlay" onClick={() => setShowGuideModal(false)}>
            <div className="cc-result-card" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#ffd700' }}>
                  📖 电子斗蛐蛐玩法说明
                </h3>
                <button
                  type="button"
                  className="cc-icon-btn"
                  onClick={() => setShowGuideModal(false)}
                >
                  ✕ 关闭
                </button>
              </div>
              <div style={{ fontSize: '12px', color: '#d7e0f5', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <strong>1. 自由配对：</strong>挑选我方与对手的出战圆球，两边都可以选<strong>「🎲 随机抽签」</strong>盲盒。
                </div>
                <div>
                  <strong>2. 碰撞放招：</strong>全程自动对决，圆球撞击四周墙壁会触发<strong>碰壁反弹技</strong>，两球相撞则触发<strong>对撞攻击技</strong>。
                </div>
                <div>
                  <strong>3. 按住暴走：</strong>每局可发动一次场外助威！<strong>按住底部暴走按钮蓄力并松开</strong>，你支持的圆球将体型暴涨、张开护盾并向对手猛冲放大招。
                </div>
                <div>
                  <strong>4. 缩圈决战：</strong>对局进入尾声时四周墙壁将带电向内收缩，节奏加快直到决出胜负。
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}