"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./jump.module.css";

type Block = {
  id: number;
  x: number;
  y: number;
  size: number;
  theme: "mint" | "peach" | "violet" | "sun";
};

type Point = {
  x: number;
  y: number;
};

const BLOCK_THEMES: Block["theme"][] = ["mint", "peach", "violet", "sun"];
const MAX_CHARGE_MS = 1350;
const MAX_JUMP_DISTANCE = 270;
const LANDING_RADIUS = 40;
const PERFECT_RADIUS = 15;
const TOTAL_PLATFORMS = 50;
const EASY_MODE_FAILS = 2;
const ASSIST_MODE_FAILS = 3;
const ENCOURAGING_MESSAGES = [
  "你刚刚那一下很稳，继续相信自己",
  "做得很好，每一步都在靠近终点",
  "你的节奏越来越好了",
  "别急，你已经掌握感觉了",
  "这一跳很漂亮，继续保持",
  "你比刚开始更从容了",
  "稳住，我们一步一步来",
  "你真的有在变强",
  "这一步很关键，你做到了",
  "你的判断很棒",
  "继续走，你已经在路上了",
  "这份耐心会带你到终点",
  "你正在把不确定变成确定",
  "很好，给自己一点掌声",
  "你已经越来越接近完美了",
  "你的手感正在回来",
  "这一刻很值得被肯定",
  "你没有放弃，这就很了不起",
  "慢慢来，你做得很好",
  "这一跳说明你完全可以",
  "继续保持，你的状态很好",
  "你比自己想象中更稳",
  "每一次尝试都算数",
  "你正在一点点突破自己",
  "漂亮，继续向前",
  "你的专注很有力量",
  "这一跳很有感觉",
  "你已经找到节奏了",
  "继续，你离成功更近了",
  "很棒，我们继续下一步",
  "今天已经很努力了，别忘了夸夸自己",
  "你不用一直完美，也依然值得被喜欢",
  "慢一点也没关系，你有自己的节奏",
  "辛苦的时候，先照顾好自己也很重要",
  "你愿意继续尝试，本身就很勇敢",
  "别把所有压力都扛在自己身上",
  "你已经做得比自己以为的更好了",
  "偶尔停下来休息，也是在好好前进",
  "你不是一个人在努力，我在这里陪你",
  "今天的小进步，也值得被认真庆祝",
  "就算状态一般，你也依然很珍贵",
  "你可以不用那么着急，生活会慢慢展开",
  "能坚持到现在，真的很不容易",
  "你的感受很重要，不需要假装没事",
  "请相信，你值得被温柔对待",
  "哪怕只完成一点点，也已经很棒了",
  "不顺利的时候，也不代表你不够好",
  "你已经很认真地生活了",
  "先深呼吸一下，我们慢慢来",
  "你身上有很多闪光点，只是有时自己忘了",
  "今天也要对自己温柔一点",
  "你值得拥有轻松一点的时刻",
  "不用和别人比较，你已经在变好了",
  "你可以把心放宽一点，没关系的",
  "你的努力不会白费，它们都在悄悄积累",
  "就算慢一点，也是在向前走",
  "你不需要证明什么，你本来就很好",
  "谢谢你没有放弃自己",
  "生活偶尔很难，但你一直很勇敢",
  "愿你今天也能被好好接住",
];

const createInitialBlocks = (): Block[] => [
  { id: 0, x: 0, y: 0, size: 86, theme: "mint" },
  { id: 1, x: 158, y: -54, size: 80, theme: "peach" },
];

const getBlockCenter = (block: Block): Point => ({ x: block.x, y: block.y - block.size * 0.44 });

const distanceBetween = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

const getRandomEncouragingMessage = () => ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)];

const createNextBlock = (from: Block, id: number, isEasyMode = false): Block => {
  const direction = Math.random() > 0.5 ? 1 : -1;
  const distance = isEasyMode ? 104 + Math.random() * 58 : 132 + Math.random() * 86;
  const verticalOffset = direction * (isEasyMode ? 22 + Math.random() * 38 : 34 + Math.random() * 56);

  return {
    id,
    x: from.x + distance,
    y: from.y + verticalOffset,
    size: isEasyMode ? 104 + Math.round(Math.random() * 22) : 74 + Math.round(Math.random() * 18),
    theme: BLOCK_THEMES[id % BLOCK_THEMES.length],
  };
};

export default function JumpPage() {
  const [blocks, setBlocks] = useState<Block[]>(createInitialBlocks);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playerPosition, setPlayerPosition] = useState<Point>(() => getBlockCenter(createInitialBlocks()[0]));
  const [camera, setCamera] = useState<Point>({ x: 0, y: -28 });
  const [stageSize, setStageSize] = useState({ width: 390, height: 720 });
  const [charge, setCharge] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    if (typeof window === "undefined") return 0;
    return Number(window.localStorage.getItem("jump-game-best-score") ?? 0);
  });
  const [combo, setCombo] = useState(0);
  const [message, setMessage] = useState("长按蓄力，松手起跳");
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const pressStartRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const scoreRef = useRef(0);
  const blocksRef = useRef(blocks);
  const currentIndexRef = useRef(currentIndex);
  const isPressingRef = useRef(false);
  const isJumpingRef = useRef(false);
  const isGameOverRef = useRef(false);
  const failCountRef = useRef(0);
  const isEasyModeRef = useRef(false);
  const isAssistModeRef = useRef(false);

  const currentBlock = blocks[currentIndex];
  const targetBlock = blocks[currentIndex + 1];
  const visibleBlocks = useMemo(() => blocks.slice(Math.max(0, currentIndex - 1), currentIndex + 4), [blocks, currentIndex]);

  useEffect(() => {
    document.title = "跳一跳 | 手机小游戏";
  }, []);

  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    isJumpingRef.current = isJumping;
  }, [isJumping]);

  useEffect(() => {
    isGameOverRef.current = isGameOver;
  }, [isGameOver]);

  useEffect(() => {
    const updateStageSize = () => {
      const rect = stageRef.current?.getBoundingClientRect();
      if (!rect) return;
      setStageSize({ width: rect.width, height: rect.height });
    };

    updateStageSize();
    window.addEventListener("resize", updateStageSize);
    return () => window.removeEventListener("resize", updateStageSize);
  }, []);

  const worldToScreen = useCallback(
    (point: Point) => ({
      x: stageSize.width * 0.23 + point.x - camera.x,
      y: stageSize.height * 0.42 + point.y - camera.y,
    }),
    [camera, stageSize],
  );

  const stopChargeLoop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const startChargeLoop = useCallback(() => {
    stopChargeLoop();

    const tick = () => {
      const elapsed = performance.now() - pressStartRef.current;
      setCharge(Math.min(1, elapsed / MAX_CHARGE_MS));
      rafRef.current = requestAnimationFrame(tick);
    };

    tick();
  }, [stopChargeLoop]);

  const handlePressStart = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (!hasStarted || isJumpingRef.current || isGameOverRef.current) return;

    setMessage("蓄力中，找准距离再松手");
    setIsPressing(true);
    isPressingRef.current = true;
    pressStartRef.current = performance.now();
    startChargeLoop();
  }, [hasStarted, startChargeLoop]);

  const completeGame = useCallback((finalScore: number) => {
    setBestScore((previousBest) => {
      const nextBest = Math.max(previousBest, finalScore);
      window.localStorage.setItem("jump-game-best-score", String(nextBest));
      return nextBest;
    });
    setCombo(0);
    setIsGameOver(true);
    isGameOverRef.current = true;
  }, []);

  const continueAfterMiss = useCallback((target: Block, nextFailCount: number) => {
    const shouldEase = nextFailCount >= EASY_MODE_FAILS;
    const adjustedTarget = shouldEase ? { ...target, size: Math.max(target.size, 108) } : target;
    const targetCenter = getBlockCenter(adjustedTarget);
    const nextIndex = currentIndexRef.current + 1;

    setPlayerPosition(targetCenter);
    setCombo(0);
    setCurrentIndex(nextIndex);
    currentIndexRef.current = nextIndex;
    setCamera({ x: adjustedTarget.x, y: adjustedTarget.y - 28 });

    if (nextFailCount === 1) {
      setMessage("加油，别放弃，我们再试一试");
    } else if (nextFailCount === EASY_MODE_FAILS) {
      isEasyModeRef.current = true;
      setMessage("这次我们降低难度");
    } else if (nextFailCount >= ASSIST_MODE_FAILS) {
      isAssistModeRef.current = true;
      setMessage("我来祝你一臂之力");
    }

    if (nextIndex >= TOTAL_PLATFORMS - 1) {
      setMessage("恭喜你完成 50 个平台！");
      completeGame(scoreRef.current);
      return;
    }

    setBlocks((previousBlocks) => {
      const adjustedBlocks = shouldEase
        ? previousBlocks.map((block, index) => (index >= nextIndex ? { ...block, size: Math.max(block.size, 108) } : block))
        : previousBlocks;

      const nextBlocks = adjustedBlocks.length >= TOTAL_PLATFORMS
        ? adjustedBlocks
        : [...adjustedBlocks, createNextBlock(adjustedTarget, adjustedBlocks.length, shouldEase)];

      blocksRef.current = nextBlocks;
      return nextBlocks;
    });
  }, [completeGame]);

  const advanceToTarget = useCallback((target: Block, isPerfect: boolean) => {
    const nextScore = scoreRef.current + (isPerfect ? 2 : 1);
    const nextIndex = currentIndexRef.current + 1;

    setScore(nextScore);
    scoreRef.current = nextScore;
    setCombo((previousCombo) => (isPerfect ? previousCombo + 1 : 0));
    setMessage(getRandomEncouragingMessage());
    setCurrentIndex(nextIndex);
    currentIndexRef.current = nextIndex;
    setCamera({ x: target.x, y: target.y - 28 });

    if (nextIndex >= TOTAL_PLATFORMS - 1) {
      setMessage("恭喜你完成 50 个平台！");
      completeGame(nextScore);
      return;
    }

    setBlocks((previousBlocks) => {
      const nextBlocks = previousBlocks.length >= TOTAL_PLATFORMS
        ? previousBlocks
        : [...previousBlocks, createNextBlock(target, previousBlocks.length, isEasyModeRef.current)];

      blocksRef.current = nextBlocks;
      return nextBlocks;
    });
  }, [completeGame]);

  const finishRound = useCallback((landingPoint: Point, hitTarget: boolean, isPerfect: boolean) => {
    const allBlocks = blocksRef.current;
    const activeIndex = currentIndexRef.current;
    const nextTarget = allBlocks[activeIndex + 1];

    setIsJumping(false);
    isJumpingRef.current = false;

    if (!nextTarget) {
      const finalScore = scoreRef.current;
      setPlayerPosition(landingPoint);
      setMessage("恭喜你完成 50 个平台！");
      completeGame(finalScore);
      return;
    }

    if (!hitTarget) {
      const nextFailCount = failCountRef.current + 1;
      failCountRef.current = nextFailCount;
      continueAfterMiss(nextTarget, nextFailCount);
      return;
    }

    const targetCenter = getBlockCenter(nextTarget);
    setPlayerPosition(targetCenter);
    advanceToTarget(nextTarget, isPerfect);
  }, [advanceToTarget, completeGame, continueAfterMiss]);

  const handlePressEnd = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (!isPressingRef.current || isJumpingRef.current || isGameOverRef.current) return;

    stopChargeLoop();
    setIsPressing(false);
    isPressingRef.current = false;

    const allBlocks = blocksRef.current;
    const activeIndex = currentIndexRef.current;
    const activeBlock = allBlocks[activeIndex];
    const nextTarget = allBlocks[activeIndex + 1];

    if (!activeBlock || !nextTarget) return;

    const origin = getBlockCenter(activeBlock);
    const target = getBlockCenter(nextTarget);
    const vector = { x: target.x - origin.x, y: target.y - origin.y };
    const targetDistance = Math.max(1, distanceBetween(origin, target));
    const heldMs = performance.now() - pressStartRef.current;
    const jumpDistance = Math.min(heldMs / MAX_CHARGE_MS, 1) * MAX_JUMP_DISTANCE;
    const assisted = isAssistModeRef.current;
    const landingPoint = assisted
      ? target
      : {
          x: origin.x + (vector.x / targetDistance) * jumpDistance,
          y: origin.y + (vector.y / targetDistance) * jumpDistance,
        };
    const landingError = distanceBetween(landingPoint, target);
    const hitTarget = assisted || landingError <= LANDING_RADIUS;
    const perfect = assisted || landingError <= PERFECT_RADIUS;

    setCharge(0);
    setIsJumping(true);
    isJumpingRef.current = true;
    setPlayerPosition(landingPoint);
    setMessage("起跳！");

    window.setTimeout(() => finishRound(landingPoint, hitTarget, perfect), 540);
  }, [finishRound, stopChargeLoop]);

  const handleStartGame = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setHasStarted(true);
    setMessage("长按蓄力，松手起跳");
  }, []);

  const resetGame = useCallback(() => {
    const initialBlocks = createInitialBlocks();
    stopChargeLoop();
    setBlocks(initialBlocks);
    blocksRef.current = initialBlocks;
    setCurrentIndex(0);
    currentIndexRef.current = 0;
    setPlayerPosition(getBlockCenter(initialBlocks[0]));
    setCamera({ x: 0, y: -28 });
    setCharge(0);
    setIsPressing(false);
    isPressingRef.current = false;
    setIsJumping(false);
    isJumpingRef.current = false;
    setScore(0);
    scoreRef.current = 0;
    setCombo(0);
    setMessage("长按蓄力，松手起跳");
    setIsGameOver(false);
    isGameOverRef.current = false;
    setHasStarted(false);
    failCountRef.current = 0;
    isEasyModeRef.current = false;
    isAssistModeRef.current = false;
  }, [stopChargeLoop]);

  useEffect(() => stopChargeLoop, [stopChargeLoop]);

  const playerScreenPosition = worldToScreen(playerPosition);
  const targetDistance = currentBlock && targetBlock
    ? Math.round(distanceBetween(getBlockCenter(currentBlock), getBlockCenter(targetBlock)))
    : 0;

  return (
    <main className={styles.pageShell}>
      <section className={styles.phoneFrame} aria-label="跳一跳手机小游戏">
        <div className={styles.topHud}>
          <div>
            <span className={styles.hudLabel}>得分</span>
            <strong>{score}</strong>
          </div>
          <div>
            <span className={styles.hudLabel}>最佳</span>
            <strong>{bestScore}</strong>
          </div>
          <button
            className={styles.resetButton}
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              resetGame();
            }}
          >
            重开
          </button>
        </div>

        <div
          ref={stageRef}
          className={styles.stage}
          onPointerDown={handlePressStart}
          onPointerUp={handlePressEnd}
          onPointerCancel={handlePressEnd}
          onPointerLeave={(event) => {
            if (isPressingRef.current) handlePressEnd(event);
          }}
        >
          <div className={styles.skyGlow} />
          <div className={styles.gridFloor} />
          <div className={styles.cloudOne} />
          <div className={styles.cloudTwo} />

          {visibleBlocks.map((block, visibleIndex) => {
            const screenPoint = worldToScreen({ x: block.x, y: block.y });
            const isCurrent = block.id === currentBlock?.id;
            const isTarget = block.id === targetBlock?.id;

            return (
              <div
                key={block.id}
                className={`${styles.block} ${styles[block.theme]} ${isTarget ? styles.targetBlock : ""} ${isCurrent && isPressing ? styles.currentPressing : ""}`}
                style={{
                  left: screenPoint.x,
                  top: screenPoint.y,
                  width: block.size,
                  height: block.size * 0.64,
                  zIndex: 10 + visibleIndex,
                }}
              >
                {isTarget && <span className={styles.targetRing} />}
                <span className={styles.blockTop} />
                <span className={styles.blockSide} />
                <span className={styles.blockSpark} />
              </div>
            );
          })}

          <div
            className={`${styles.player} ${isPressing ? styles.playerPressing : ""} ${isJumping ? styles.playerJumping : ""}`}
            style={{
              left: playerScreenPosition.x,
              top: playerScreenPosition.y,
              zIndex: 30,
              "--charge": charge,
            } as React.CSSProperties}
          >
            <span className={styles.playerShadow} />
            <span className={styles.playerBody} />
            <span className={styles.playerFace} />
          </div>

          <div className={styles.chargePanel} aria-live="polite">
            <div className={styles.message}>{message}</div>
            <div className={`${styles.chargeTrack} ${isPressing ? styles.charging : ""}`}>
              <span />
            </div>
            <div className={styles.metaLine}>
              <span>目标距离 {targetDistance}</span>
              <span>{combo > 0 ? `连击 x${combo}` : "相信你的节奏"}</span>
            </div>
          </div>

          {!hasStarted && !isGameOver && (
            <div className={styles.guideCard} onPointerDown={(event) => event.stopPropagation()}>
              <p>游戏玩法</p>
              <strong>按住屏幕蓄力，松开跳跃。</strong>
              <span>蓄力越久跳得越远，加油！</span>
              <button
                type="button"
                className={styles.startButton}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={handleStartGame}
              >
                开始游戏
              </button>
            </div>
          )}

          {isGameOver && (
            <div className={styles.gameOverCard}>
              <span>挑战完成</span>
              <strong>{score}</strong>
              {/* <p>{score >= bestScore ? "新的高分诞生了" : "你已经走完了 50 个平台"}</p> */}
              <button
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  resetGame();
                }}
              >
                再来一局
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
