"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./huarongRoad.module.css";

// ─── Pixel heart pattern (10×10) ─────────────────────────────────────────────
const HEART_10: number[][] = [
  [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const PIXEL_COLORS = [
  "#ff6eb4", "#ff8ecb", "#ff4d9e", "#e040a0",
  "#c94fbe", "#ff9de2", "#f06292", "#ff5fa0",
  "#ff79c6", "#bd4fdb",
];

// ─── Difficulty config ────────────────────────────────────────────────────────
type Difficulty = "easy" | "medium" | "hard";

interface DiffConfig {
  label: string;
  cols: number;
  rows: number;
  shuffles: number;
  info: string;
}

const DIFF_CONFIG: Record<Difficulty, DiffConfig> = {
  easy:   { label: "简单", cols: 3, rows: 3, shuffles: 20,  info: "3×3 · 轻松入门" },
  medium: { label: "中等", cols: 4, rows: 4, shuffles: 60,  info: "4×4 · 稍有挑战" },
  hard:   { label: "困难", cols: 5, rows: 5, shuffles: 120, info: "5×5 · 脑力全开" },
};

// ─── Puzzle helpers ───────────────────────────────────────────────────────────
type Board = number[];

function createSolvedBoard(size: number): Board {
  return Array.from({ length: size * size }, (_, i) => (i === size * size - 1 ? 0 : i + 1));
}

function getEmptyIndex(board: Board): number {
  return board.indexOf(0);
}

function getNeighbors(idx: number, cols: number, rows: number): number[] {
  const r = Math.floor(idx / cols);
  const c = idx % cols;
  const ns: number[] = [];
  if (r > 0) ns.push(idx - cols);
  if (r < rows - 1) ns.push(idx + cols);
  if (c > 0) ns.push(idx - 1);
  if (c < cols - 1) ns.push(idx + 1);
  return ns;
}

function shuffleBoard(board: Board, cols: number, rows: number, moves: number): Board {
  let b = [...board];
  let lastEmpty = -1;
  for (let i = 0; i < moves; i++) {
    const empty = getEmptyIndex(b);
    const ns = getNeighbors(empty, cols, rows).filter((n) => n !== lastEmpty);
    const pick = ns[Math.floor(Math.random() * ns.length)];
    lastEmpty = empty;
    [b[empty], b[pick]] = [b[pick], b[empty]];
  }
  return b;
}

function isSolved(board: Board, cols: number): boolean {
  const size = cols * cols;
  for (let i = 0; i < size - 1; i++) {
    if (board[i] !== i + 1) return false;
  }
  return board[size - 1] === 0;
}

// ─── A* solver — runs inside a Blob Web Worker ────────────────────────────────
// The worker code is embedded as a string so no extra file is needed.
// It uses a binary min-heap for the open list (much faster than sorted splice).

const WORKER_SRC = `
function manhattanH(board, cols) {
  let h = 0;
  const size = board.length;
  for (let i = 0; i < size; i++) {
    const v = board[i];
    if (v === 0) continue;
    h += Math.abs(Math.floor((v-1)/cols) - Math.floor(i/cols))
       + Math.abs((v-1)%cols - i%cols);
  }
  return h;
}

function getNeighbors(idx, cols, rows) {
  const r = Math.floor(idx/cols), c = idx%cols, ns = [];
  if (r > 0)        ns.push(idx-cols);
  if (r < rows-1)   ns.push(idx+cols);
  if (c > 0)        ns.push(idx-1);
  if (c < cols-1)   ns.push(idx+1);
  return ns;
}

function isSolved(board, cols) {
  const n = board.length;
  for (let i = 0; i < n-1; i++) if (board[i] !== i+1) return false;
  return board[n-1] === 0;
}

// Binary min-heap keyed on f
class Heap {
  constructor() { this.data = []; }
  push(node) {
    this.data.push(node);
    this._bubbleUp(this.data.length - 1);
  }
  pop() {
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length > 0) { this.data[0] = last; this._siftDown(0); }
    return top;
  }
  get size() { return this.data.length; }
  _bubbleUp(i) {
    while (i > 0) {
      const p = (i-1)>>1;
      if (this.data[p].f <= this.data[i].f) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }
  _siftDown(i) {
    const n = this.data.length;
    while (true) {
      let min = i, l = 2*i+1, r = 2*i+2;
      if (l < n && this.data[l].f < this.data[min].f) min = l;
      if (r < n && this.data[r].f < this.data[min].f) min = r;
      if (min === i) break;
      [this.data[min], this.data[i]] = [this.data[i], this.data[min]];
      i = min;
    }
  }
}

self.onmessage = function(e) {
  const { board, cols } = e.data;
  if (isSolved(board, cols)) { self.postMessage({ path: [] }); return; }

  const heap = new Heap();
  const visited = new Map(); // key -> best g seen
  const boardKey = b => b.join(',');

  heap.push({ board, path: [], g: 0, f: manhattanH(board, cols) });

  while (heap.size > 0) {
    const cur = heap.pop();
    const k = boardKey(cur.board);
    if (visited.has(k) && visited.get(k) <= cur.g) continue;
    visited.set(k, cur.g);

    const emptyIdx = cur.board.indexOf(0);
    for (const nb of getNeighbors(emptyIdx, cols, cols)) {
      const next = cur.board.slice();
      next[emptyIdx] = next[nb]; next[nb] = 0;

      if (isSolved(next, cols)) {
        self.postMessage({ path: [...cur.path, nb] });
        return;
      }

      const nk = boardKey(next);
      const ng = cur.g + 1;
      if (visited.has(nk) && visited.get(nk) <= ng) continue;

      heap.push({ board: next, path: [...cur.path, nb], g: ng,
                  f: ng + manhattanH(next, cols) });
    }
  }
  self.postMessage({ path: null });
};
`;

let _workerUrl: string | null = null;
function getSolverWorkerUrl(): string {
  if (!_workerUrl) {
    const blob = new Blob([WORKER_SRC], { type: "application/javascript" });
    _workerUrl = URL.createObjectURL(blob);
  }
  return _workerUrl;
}

// ─── Draw full pixel-heart onto an offscreen canvas, return data URL ──────────
// Draws the complete 10×10 heart at board size. Each puzzle tile then uses
// background-position to show its portion — no per-tile mapping needed.
function buildHeartDataUrl(boardPx: number): string {
  if (typeof window === "undefined") return "";
  const canvas = document.createElement("canvas");
  canvas.width  = boardPx;
  canvas.height = boardPx;
  const ctx = canvas.getContext("2d")!;

  const rows = HEART_10.length;
  const cols10 = HEART_10[0].length;
  const pixW = boardPx / cols10;
  const pixH = boardPx / rows;

  // Dark base
  ctx.fillStyle = "rgba(18, 5, 40, 0.92)";
  ctx.fillRect(0, 0, boardPx, boardPx);

  // Heart pixels
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols10; c++) {
      const x = c * pixW;
      const y = r * pixH;
      if (HEART_10[r][c] === 1) {
        const colorIdx = (r * cols10 + c) % PIXEL_COLORS.length;
        ctx.fillStyle = PIXEL_COLORS[colorIdx];
        ctx.beginPath();
        ctx.roundRect(x + 1, y + 1, pixW - 2, pixH - 2, 2);
        ctx.fill();
      } else {
        // Faint dot so tiles aren't blank
        ctx.fillStyle = "rgba(120, 60, 160, 0.15)";
        ctx.fillRect(x + 2, y + 2, pixW - 4, pixH - 4);
      }
    }
  }
  return canvas.toDataURL();
}

// ─── Hook: produce the heart image URL (client-side only) ────────────────────
function useHeartImage(boardPx: number): string {
  const [url, setUrl] = useState("");
  useEffect(() => {
    setUrl(buildHeartDataUrl(boardPx));
  }, [boardPx]);
  return url;
}

// ─── Full pixel heart SVG ─────────────────────────────────────────────────────
// animate=true: outer glow pulses (filter stdDeviation oscillates) — outline
// flash effect without any scaling.
function PixelHeartSvg({ size, glow = false, animate = false }: {
  size: number;
  glow?: boolean;
  animate?: boolean;
}) {
  const cols = 10;
  const ps = size / cols;
  const filterId = animate ? "hgAnim" : "hg";
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block", imageRendering: "pixelated" }}
    >
      <defs>
        <filter id={filterId} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation={animate ? "0" : "5"} result="blur">
            {animate && (
              <animate
                attributeName="stdDeviation"
                values="4;18;4"
                dur="1s"
                repeatCount="indefinite"
              />
            )}
          </feGaussianBlur>
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter={glow || animate ? `url(#${filterId})` : undefined}>
        {HEART_10.map((row, ri) =>
          row.map((cell, ci) => {
            if (!cell) return null;
            const colorIdx = (ri * cols + ci) % PIXEL_COLORS.length;
            return (
              <rect
                key={`${ri}-${ci}`}
                x={ci * ps + 1}
                y={ri * ps + 1}
                width={ps - 2}
                height={ps - 2}
                rx={1}
                fill={PIXEL_COLORS[colorIdx]}
              />
            );
          }),
        )}
      </g>
    </svg>
  );
}

// ─── Per-tile: clip the shared heart image to this tile's solved position ─────
// tileIndex is the tile's *identity* (1-based, in solved order), so its offset
// in the full image is always fixed regardless of where it currently sits on
// the board. The CSS background-position crops the right slice.
function TileHeart({
  tileIndex,
  cols,
  tileSize,
  heartImageUrl,
  boardPx,
}: {
  tileIndex: number;
  cols: number;
  tileSize: number;
  heartImageUrl: string;
  boardPx: number;
}) {
  const solvedRow = Math.floor((tileIndex - 1) / cols);
  const solvedCol = (tileIndex - 1) % cols;
  const offsetX = -(solvedCol * tileSize);
  const offsetY = -(solvedRow * tileSize);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundImage: heartImageUrl ? `url(${heartImageUrl})` : "none",
        backgroundSize: `${boardPx}px ${boardPx}px`,
        backgroundPosition: `${offsetX}px ${offsetY}px`,
        backgroundRepeat: "no-repeat",
        imageRendering: "pixelated",
        borderRadius: 4,
      }}
    />
  );
}

// ─── Heart Rain ───────────────────────────────────────────────────────────────
const RAIN_COLORS = ["#ff6eb4", "#ff9de2", "#ffb347", "#e040fb", "#ff4daa", "#c94fbe", "#ff79c6", "#f06292"];
const RAIN_CHARS  = ["♥", "❤", "💗", "💖", "💝", "💕"];

interface RainDrop {
  id: number;
  left: number;
  size: number;
  color: string;
  char: string;
  duration: number;
  delay: number;
}

function mkDrop(id: number): RainDrop {
  return {
    id,
    left: 2 + Math.random() * 96,
    size: 14 + Math.random() * 22,
    color: RAIN_COLORS[Math.floor(Math.random() * RAIN_COLORS.length)],
    char: RAIN_CHARS[Math.floor(Math.random() * RAIN_CHARS.length)],
    duration: 1.8 + Math.random() * 2.4,
    delay: Math.random() * 1.0,
  };
}

function HeartRain({ active }: { active: boolean }) {
  const [drops, setDrops] = useState<RainDrop[]>([]);
  const nextId = useRef(1);
  const iv = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) {
      setDrops([]);
      if (iv.current) clearInterval(iv.current);
      return;
    }
    setDrops(Array.from({ length: 24 }, () => mkDrop(nextId.current++)));
    iv.current = setInterval(() => {
      setDrops((cur) => [
        ...cur.slice(-60),
        ...Array.from({ length: 5 }, () => mkDrop(nextId.current++)),
      ]);
    }, 250);
    return () => { if (iv.current) clearInterval(iv.current); };
  }, [active]);

  return (
    <div className={styles.heartRain} aria-hidden>
      {drops.map((d) => (
        <span
          key={d.id}
          className={styles.rainHeart}
          style={{
            left: `${d.left}%`,
            fontSize: d.size,
            color: d.color,
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
            textShadow: `0 0 10px ${d.color}`,
          }}
        >
          {d.char}
        </span>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type Screen = "welcome" | "game";

export default function HuarongRoadPage() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [board, setBoard] = useState<Board>([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [heartGlow, setHeartGlow] = useState(false);
  const [winRain, setWinRain] = useState(false);
  const [hintPos, setHintPos] = useState<number | null>(null);
  const [hintOn, setHintOn] = useState(false);
  const [btnPulse, setBtnPulse] = useState(false);

  const cfg = DIFF_CONFIG[difficulty];
  const boardPx = 320;
  const gap = 3;
  const tilePx = Math.floor((boardPx - (cfg.cols + 1) * gap) / cfg.cols);
  const heartImageUrl = useHeartImage(boardPx);

  const t1Ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t2Ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wonRef = useRef(false);
  const idleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintOnRef = useRef(false);
  const solutionPath = useRef<number[]>([]);   // board-positions to click in order
  const solutionStep = useRef(0);              // index into solutionPath
  const solverWorker = useRef<Worker | null>(null);

  // Terminate any in-flight solve and start a new one in a Web Worker
  const computeSolution = useCallback((currentBoard: Board, cols: number) => {
    if (typeof window === "undefined") return;
    // Cancel previous worker
    if (solverWorker.current) {
      solverWorker.current.terminate();
      solverWorker.current = null;
    }
    solutionPath.current = [];
    solutionStep.current = 0;
    setHintPos(null);

    const worker = new Worker(getSolverWorkerUrl());
    solverWorker.current = worker;
    worker.onmessage = (e: MessageEvent<{ path: number[] | null }>) => {
      const path = e.data.path ?? [];
      solutionPath.current = path;
      solutionStep.current = 0;
      setHintPos(path.length > 0 ? path[0] : null);
      solverWorker.current = null;
    };
    worker.postMessage({ board: currentBoard, cols });
  }, []);

  const resetIdle = useCallback(() => {
    if (idleRef.current) clearTimeout(idleRef.current);
    setBtnPulse(false);
    idleRef.current = setTimeout(() => setBtnPulse(true), 5000);
  }, []);

  useEffect(() => {
    document.title = "华容道 · 爱心拼图";
  }, []);

  const startGame = useCallback(() => {
    if (t1Ref.current) clearTimeout(t1Ref.current);
    if (t2Ref.current) clearTimeout(t2Ref.current);
    if (idleRef.current) clearTimeout(idleRef.current);
    if (solverWorker.current) { solverWorker.current.terminate(); solverWorker.current = null; }
    wonRef.current = false;
    hintOnRef.current = false;
    solutionPath.current = [];
    solutionStep.current = 0;
    const solved = createSolvedBoard(cfg.cols);
    setBoard(shuffleBoard(solved, cfg.cols, cfg.rows, cfg.shuffles));
    setMoves(0);
    setWon(false);
    setShowHeart(false);
    setHeartGlow(false);
    setWinRain(false);
    setHintPos(null);
    setHintOn(false);
    setBtnPulse(false);
    setScreen("game");
    resetIdle();
  }, [cfg, resetIdle]);

  const handleTileClick = useCallback(
    (boardPos: number) => {
      if (wonRef.current) return;
      resetIdle();
      setBoard((prev) => {
        const emptyIdx = getEmptyIndex(prev);
        if (!getNeighbors(emptyIdx, cfg.cols, cfg.rows).includes(boardPos)) return prev;
        const next = [...prev];
        [next[emptyIdx], next[boardPos]] = [next[boardPos], next[emptyIdx]];

        // Advance solution path if the player followed the hint, else recompute
        if (hintOnRef.current) {
          const expected = solutionPath.current[solutionStep.current];
          if (boardPos === expected) {
            solutionStep.current += 1;
            const nextHint = solutionPath.current[solutionStep.current] ?? null;
            // nextHint is a position in `prev`; after the swap it's still the
            // same board-position (positions don't change, only values do)
            setHintPos(nextHint);
          } else {
            // Player deviated — recompute from the new board state
            setTimeout(() => computeSolution(next, cfg.cols), 0);
          }
        }

        return next;
      });
      setMoves((m) => m + 1);
    },
    [cfg, resetIdle, computeSolution],
  );

  const handleHintToggle = useCallback(() => {
    if (wonRef.current) return;
    setBtnPulse(false);
    resetIdle();
    const next = !hintOnRef.current;
    hintOnRef.current = next;
    setHintOn(next);
    if (!next) {
      setHintPos(null);
      solutionPath.current = [];
      solutionStep.current = 0;
    }
  }, [resetIdle]);

  // When hint is toggled on, immediately compute the solution
  useEffect(() => {
    if (!hintOn || wonRef.current || board.length === 0) return;
    computeSolution(board, cfg.cols);
  // Only run when hintOn flips to true; board changes are handled in handleTileClick
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hintOn]);

  // Check win after every board change
  useEffect(() => {
    if (screen !== "game" || wonRef.current || board.length === 0) return;
    if (!isSolved(board, cfg.cols)) return;

    wonRef.current = true;
    hintOnRef.current = false;
    setWon(true);
    setHintOn(false);
    setHintPos(null);
    if (idleRef.current) clearTimeout(idleRef.current);
    setBtnPulse(false);

    t1Ref.current = setTimeout(() => setShowHeart(true), 700);
    t2Ref.current = setTimeout(() => { setHeartGlow(true); setWinRain(true); }, 1100);
  }, [board, cfg.cols, screen]);

  return (
    <main className={styles.pageShell}>
      <section className={styles.phoneFrame} aria-label="华容道爱心拼图">

        {/* Welcome */}
        <div className={`${styles.screen} ${screen === "welcome" ? styles.active : ""}`}>
          <h1 className={styles.welcomeTitle}>华容道</h1>
          <p className={styles.welcomeSub}>滑动方块，拼出爱心</p>
          <div className={styles.previewHeart}>
            <PixelHeartSvg size={140} glow />
          </div>
          <p className={styles.difficultyLabel}>选择难度</p>
          <div className={styles.difficultyGroup}>
            {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
              <button
                key={d}
                type="button"
                className={`${styles.diffBtn} ${difficulty === d ? styles.selected : ""}`}
                onClick={() => setDifficulty(d)}
              >
                {DIFF_CONFIG[d].label}
                <span className={styles.diffInfo}>{DIFF_CONFIG[d].info}</span>
              </button>
            ))}
          </div>
          <button type="button" className={styles.startBtn} onClick={startGame}>
            开始游戏
          </button>
        </div>

        {/* Game */}
        <div className={`${styles.screen} ${screen === "game" ? styles.active : ""}`}>
          <div className={styles.gameHeader}>
            <button type="button" className={styles.backBtn} onClick={() => setScreen("welcome")}>
              ← 返回
            </button>
            <span className={styles.gameTitle}>爱心拼图</span>
            <div className={styles.headerRight}>
              <span className={styles.moveCount}>
                <strong>{moves}</strong> 步
              </span>
              {!won && (
                <button
                  type="button"
                  className={`${styles.hintBtn} ${hintOn ? styles.hintBtnActive : ""} ${btnPulse && !hintOn ? styles.hintBtnPulse : ""}`}
                  onClick={handleHintToggle}
                  aria-label={hintOn ? "关闭提示" : "开启提示"}
                >
                  💡
                </button>
              )}
            </div>
          </div>

          <div className={styles.boardWrap}>
            <div className={styles.board} style={{ width: boardPx, height: boardPx }}>
              <div className={styles.boardGlow} />

              {/* Tiles — fade out when won */}
              <div className={won ? styles.tilesLayerFadeOut : styles.tilesLayer}>
                {board.map((tileValue, boardPos) => {
                  const row = Math.floor(boardPos / cfg.cols);
                  const col = boardPos % cfg.cols;
                  const left = gap + col * (tilePx + gap);
                  const top  = gap + row * (tilePx + gap);
                  if (tileValue === 0) {
                    return (
                      <div
                        key="empty"
                        className={`${styles.tile} ${styles.tileEmpty}`}
                        style={{ left, top, width: tilePx, height: tilePx }}
                      />
                    );
                  }
                  const isHinted = hintPos === boardPos;
                  return (
                    <div
                      key={tileValue}
                      className={`${styles.tile} ${isHinted ? styles.tileHinted : ""}`}
                      style={{ left, top, width: tilePx, height: tilePx }}
                      onClick={() => handleTileClick(boardPos)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && handleTileClick(boardPos)}
                      aria-label={`方块 ${tileValue}`}
                    >
                      <TileHeart
                        tileIndex={tileValue}
                        cols={cfg.cols}
                        tileSize={tilePx}
                        heartImageUrl={heartImageUrl}
                        boardPx={boardPx}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Complete heart — fades in after tiles gone, then glows */}
              {showHeart && (
                <div className={heartGlow ? styles.winOverlayGlow : styles.winOverlay}>
                  <PixelHeartSvg size={boardPx - 12} glow={heartGlow} animate={heartGlow} />
                </div>
              )}
            </div>
          </div>

          {won ? (
            <div className={styles.winFooter}>
              <p className={styles.winStats}>
                共用了 <strong>{moves}</strong> 步
                {moves <= cfg.shuffles / 3 ? " · 太厉害了！✨" :
                 moves <= cfg.shuffles     ? " · 做得很棒！" :
                                             " · 坚持就是胜利！"}
              </p>
              <button type="button" className={styles.playAgainBtn} onClick={startGame}>
                再玩一次
              </button>
            </div>
          ) : (
            <p className={styles.hintBar}>点击空格旁边的方块来滑动</p>
          )}

          <HeartRain active={winRain} />
        </div>

      </section>
    </main>
  );
}
