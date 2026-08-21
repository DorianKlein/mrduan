"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./reboundBall.module.css";

type Ball = { id: number; x: number; y: number; dx: number; dy: number; color: string };
type Brick = { id: number; x: number; y: number; width: number; height: number; color: string; message: string };
type FallingMessage = { id: number; x: number; y: number; text: string; color: string };

const COLORS = ["#ff6b6b", "#ff9f43", "#feca57", "#48dbfb", "#a29bfe", "#ff8ed4"];
const MESSAGES = [
  "你已经做得很好了",
  "今天也辛苦啦",
  "慢一点也没关系",
  "你值得被温柔对待",
  "所有美好正在路上",
  "记得给自己一个拥抱",
  "你的存在本身就很珍贵",
  "小小的快乐也值得庆祝",
  "不必满分，尽力不好",
  "你比自己想象中更勇敢",
  "允许自己休息一下",
  "会有好事发生的",
];

const WIDTH = 340;
const HEIGHT = 530;
const PADDLE_WIDTH = 74;
const PADDLE_HEIGHT = 11;
const PADDLE_BOTTOM = 18;
const BALL_SIZE = 12;

function makeBricks(): Brick[] {
  return Array.from({ length: 24 }, (_, index) => ({
    id: index,
    x: 12 + (index % 6) * 53.5,
    y: 54 + Math.floor(index / 6) * 35,
    width: 47,
    height: 22,
    color: COLORS[Math.floor(index / 6)],
    message: MESSAGES[index % MESSAGES.length],
  }));
}

export default function ReboundBallPage() {
  const [started, setStarted] = useState(false);
  const [won, setWon] = useState(false);
  const [gameOver, setGameOver] = useState(false); // 失败/无小球存活状态
  const [balls, setBalls] = useState<Ball[]>([]);
  const [bricks, setBricks] = useState<Brick[]>(makeBricks);
  const [messages, setMessages] = useState<FallingMessage[]>([]);

  const gameRef = useRef<HTMLDivElement>(null);
  const paddleRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);

  const stateRef = useRef({
    balls: [] as Ball[],
    bricks: makeBricks(),
    paddleX: (WIDTH - PADDLE_WIDTH) / 2,
    messageId: 0,
    started: false,
    won: false,
    gameOver: false,
  });

  // 更新挡板 DOM 位置 (绕过 React 重新渲染以达到极高帧率)
  const updatePaddleDOM = (x: number) => {
    stateRef.current.paddleX = x;
    if (paddleRef.current) {
      paddleRef.current.style.transform = `translateX(${x}px)`;
    }
  };

  const reset = useCallback(() => {
    const nextBricks = makeBricks();
    const initialPaddleX = (WIDTH - PADDLE_WIDTH) / 2;
    stateRef.current = {
      balls: [],
      bricks: nextBricks,
      paddleX: initialPaddleX,
      messageId: 0,
      started: false,
      won: false,
      gameOver: false,
    };
    setStarted(false);
    setWon(false);
    setGameOver(false);
    setBalls([]);
    setBricks(nextBricks);
    setMessages([]);
    updatePaddleDOM(initialPaddleX);
  }, []);

  const launch = useCallback(() => {
    if (stateRef.current.started || stateRef.current.won || stateRef.current.gameOver) return;
    
    const firstBall: Ball = {
      id: 1,
      x: WIDTH / 2,
      y: HEIGHT - PADDLE_BOTTOM - PADDLE_HEIGHT - BALL_SIZE / 2,
      dx: 2.5,
      dy: -3.5,
      color: "#fff",
    };
    stateRef.current.balls = [firstBall];
    stateRef.current.started = true;
    setBalls([firstBall]);
    setStarted(true);
  }, []);

  // 绑定原生触摸/拖拽事件，防止手机端默认滚动与点击误判
  useEffect(() => {
    const gameEl = gameRef.current;
    if (!gameEl) return;

    const handlePointer = (clientX: number) => {
      const rect = gameEl.getBoundingClientRect();
      const scale = WIDTH / rect.width;
      const nextX = Math.max(0, Math.min(WIDTH - PADDLE_WIDTH, (clientX - rect.left) * scale - PADDLE_WIDTH / 2));
      updatePaddleDOM(nextX);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointer(e.touches[0].clientX);
        launch();
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // 关键：阻止手势滚动，解决移动端卡顿/误判为点击问题
      if (e.touches.length > 0) {
        handlePointer(e.touches[0].clientX);
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      handlePointer(e.clientX);
      launch();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (e.buttons === 1) { // 只有按住鼠标滑动时才追踪
        handlePointer(e.clientX);
      }
    };

    gameEl.addEventListener("touchstart", onTouchStart, { passive: false });
    gameEl.addEventListener("touchmove", onTouchMove, { passive: false });
    gameEl.addEventListener("mousedown", onMouseDown);
    gameEl.addEventListener("mousemove", onMouseMove);

    return () => {
      gameEl.removeEventListener("touchstart", onTouchStart);
      gameEl.removeEventListener("touchmove", onTouchMove);
      gameEl.removeEventListener("mousedown", onMouseDown);
      gameEl.removeEventListener("mousemove", onMouseMove);
    };
  }, [launch]);

  useEffect(() => {
    document.title = "反弹球 · 周末快乐";
    const tick = () => {
      const state = stateRef.current;

      if (state.started && !state.won && !state.gameOver) {
        const nextBalls: Ball[] = [];
        const remaining = [...state.bricks];
        const newMessages: FallingMessage[] = [];
        const paddleTop = HEIGHT - PADDLE_BOTTOM - PADDLE_HEIGHT;

        state.balls.forEach((ball) => {
          let { x, y, dx, dy } = ball;
          x += dx;
          y += dy;

          // 左右反弹
          if (x <= BALL_SIZE / 2 || x >= WIDTH - BALL_SIZE / 2) {
            dx *= -1;
            x = Math.max(BALL_SIZE / 2, Math.min(WIDTH - BALL_SIZE / 2, x));
          }
          // 顶部反弹
          if (y <= BALL_SIZE / 2) {
            dy *= -1;
            y = BALL_SIZE / 2;
          }

          // 横条碰撞判定
          if (
            dy > 0 &&
            y + BALL_SIZE / 2 >= paddleTop &&
            y - BALL_SIZE / 2 <= paddleTop + PADDLE_HEIGHT &&
            x >= state.paddleX - 4 &&
            x <= state.paddleX + PADDLE_WIDTH + 4
          ) {
            dy = -Math.abs(dy);
            dx += (x - (state.paddleX + PADDLE_WIDTH / 2)) * 0.035;
            dx = Math.max(-5, Math.min(5, dx));
            y = paddleTop - BALL_SIZE / 2;
          }

          // 砖块碰撞
          const hitIndex = remaining.findIndex((brick) => x > brick.x && x < brick.x + brick.width && y > brick.y && y < brick.y + brick.height);
          if (hitIndex >= 0) {
            const hit = remaining.splice(hitIndex, 1)[0];
            dy *= -1;
            newMessages.push({ id: state.messageId++, x: hit.x + hit.width / 2, y: hit.y, text: hit.message, color: hit.color });
            if (Math.random() < 0.28) {
              nextBalls.push({ id: Date.now() + state.messageId, x, y, dx: -dx * 0.9, dy, color: COLORS[Math.floor(Math.random() * COLORS.length)] });
            }
          }

          // 小球还未超底，存活
          if (y <= HEIGHT + 10) {
            nextBalls.push({ ...ball, x, y, dx, dy });
          }
        });

        state.balls = nextBalls;
        state.bricks = remaining;
        setBalls(nextBalls);
        setBricks(remaining);

        if (newMessages.length) {
          setMessages((current) => [...current, ...newMessages].slice(-8));
        }

        // 检测胜利
        if (!remaining.length) {
          state.won = true;
          setWon(true);
        }

        // 检测失败：已开始且屏幕上没有任何小球存活
        if (nextBalls.length === 0) {
          state.gameOver = true;
          setGameOver(true);
        }
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, []);

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>EMOTION ARCADE · 01</p>
            <h1>反弹球</h1>
            <p className={styles.subtitle}>把烦恼一颗颗弹走，接住今天的好心情</p>
          </div>
          <div className={styles.counter}>
            {bricks.length}<span>/ 24</span>
            <small>待击碎</small>
          </div>
        </header>

        <div ref={gameRef} className={styles.game}>
          <div className={styles.stars} />
          {bricks.map((brick) => (
            <div key={brick.id} className={styles.brick} style={{ left: brick.x, top: brick.y, width: brick.width, height: brick.height, background: brick.color }} />
          ))}
          {balls.map((ball) => (
            <div key={ball.id} className={styles.ball} style={{ left: ball.x, top: ball.y, background: ball.color }} />
          ))}
          
          {/* 挡板：使用 ref 直操 transform 保证 60fps 移动流畅度 */}
          <div ref={paddleRef} className={styles.paddle} style={{ transform: `translateX(${(WIDTH - PADDLE_WIDTH) / 2}px)` }}>
            <span />
          </div>

          {/* 情绪短句最上层 */}
          {messages.map((message) => (
            <div key={message.id} className={styles.message} style={{ left: message.x, top: message.y, color: message.color }}>
              {message.text}
            </div>
          ))}

          {/* 初始点击发射提示 */}
          {!started && !won && !gameOver && (
            <div className={styles.startHint}>
              <span className={styles.playIcon}>▶</span>
              <strong>点击发射</strong>
              <small>拖动底部横条接住小球</small>
            </div>
          )}

          {/* 游戏失败 / 重新开始提示 */}
          {gameOver && (
            <div className={styles.winPanel}>
              <h2>小球掉落了</h2>
              <p>没关系，随时可以重新开始，接住属于你的好心情！</p>
              <button onClick={reset}>重新开始</button>
            </div>
          )}

          {/* 游戏胜利 */}
          {won && (
            <div className={styles.winPanel}>
              <div className={styles.confetti}>✦ ✧ ✦</div>
              <h2>全部击破！</h2>
              <p>周末快乐，愿你的烦恼也像这些砖块一样，轻轻一碰就消失。</p>
              <button onClick={reset}>再玩一次</button>
            </div>
          )}
        </div>

        <footer className={styles.footer}>
          <span>左右滑动横条</span>
          <span className={styles.dot}>·</span>
          <span>击碎 24 份小烦恼</span>
          <button className={styles.resetButton} aria-label="重新开始" onClick={reset}>↻</button>
        </footer>
      </section>
    </main>
  );
}