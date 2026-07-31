"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./nienie.module.css";

type FloatText = {
  id: number;
  x: number;
  y: number;
  text: string;
};

const HEALING_WORDS = [
  "喵~",
  "好软呀",
  "再捏一下",
  "呼噜呼噜",
  "舒服~",
  "轻一点嘛",
  "别拉耳朵",
  "喵喵喵",
  "摸摸头",
  "今天辛苦啦",
  "陪你一会儿",
  "深呼吸",
  "慢慢来",
  "抱一下",
  "你很棒",
];

const MAX_PULL = 120;
const TAP_THRESHOLD = 8;
const MAX_TILT = 26;
const SETTLE_MS = 660;
const SQUEEZE_MS = 340;

const clampPull = (dx: number, dy: number) => {
  const distance = Math.hypot(dx, dy);
  if (distance <= MAX_PULL) return { x: dx, y: dy };
  const ratio = MAX_PULL / distance;
  return { x: dx * ratio, y: dy * ratio };
};

const getHealingWord = () => HEALING_WORDS[Math.floor(Math.random() * HEALING_WORDS.length)];

export default function NieniePage() {
  const [count, setCount] = useState(0);
  const [floatTexts, setFloatTexts] = useState<FloatText[]>([]);

  const stageRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);

  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const movedFar = useRef(false);
  const latestPull = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);
  const nextTextId = useRef(1);
  const squeezeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const paint = useCallback((x: number, y: number) => {
    const cat = catRef.current;
    const shadow = shadowRef.current;
    if (!cat) return;

    const ratio = Math.min(Math.hypot(x, y) / MAX_PULL, 1);
    const angle = ratio > 0.001 ? (Math.atan2(y, x) * 180) / Math.PI : 0;

    cat.style.setProperty("--pull-x", `${x}px`);
    cat.style.setProperty("--pull-y", `${y}px`);
    cat.style.setProperty("--tilt-y", `${(x / MAX_PULL) * MAX_TILT}deg`);
    cat.style.setProperty("--tilt-x", `${(-y / MAX_PULL) * MAX_TILT}deg`);
    cat.style.setProperty("--squash-angle", `${angle}deg`);
    cat.style.setProperty("--squash-along", `${1 - ratio * 0.24}`);
    cat.style.setProperty("--bulge-across", `${1 + ratio * 0.2}`);
    cat.style.setProperty("--press-z", `${ratio * 18}px`);

    if (shadow) {
      shadow.style.setProperty("--shadow-x", `${x * 0.5}px`);
      shadow.style.setProperty("--shadow-scale", `${1 + ratio * 0.16}`);
      shadow.style.setProperty("--shadow-fade", `${0.82 + ratio * 0.18}`);
    }
  }, []);

  const schedulePaint = useCallback(() => {
    if (rafId.current !== null) return;

    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      const { x, y } = latestPull.current;
      paint(x, y);
    });
  }, [paint]);

  useEffect(() => {
    document.title = "捏捏猫 - 解压放松";
    return () => {
      if (squeezeTimer.current) clearTimeout(squeezeTimer.current);
      if (settleTimer.current) clearTimeout(settleTimer.current);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const popWord = useCallback((clientX: number, clientY: number) => {
    const stage = stageRef.current;
    if (!stage) return;

    const rect = stage.getBoundingClientRect();
    const id = nextTextId.current++;

    setFloatTexts((current) => [
      ...current.slice(-5),
      { id, x: clientX - rect.left, y: clientY - rect.top, text: getHealingWord() },
    ]);

    window.setTimeout(() => {
      setFloatTexts((current) => current.filter((item) => item.id !== id));
    }, 1500);
  }, []);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const cat = catRef.current;
    if (!cat) return;

    cat.setPointerCapture(event.pointerId);
    dragStart.current = { x: event.clientX, y: event.clientY };
    movedFar.current = false;
    latestPull.current = { x: 0, y: 0 };

    if (settleTimer.current) clearTimeout(settleTimer.current);
    if (squeezeTimer.current) clearTimeout(squeezeTimer.current);

    cat.classList.remove(styles.settling, styles.squeezing);
    cat.classList.add(styles.dragging);
    shadowRef.current?.classList.add(styles.shadowDragging);
  }, []);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!dragStart.current) return;

      const dx = event.clientX - dragStart.current.x;
      const dy = event.clientY - dragStart.current.y;

      if (!movedFar.current && Math.hypot(dx, dy) > TAP_THRESHOLD) movedFar.current = true;

      latestPull.current = clampPull(dx, dy);
      schedulePaint();
    },
    [schedulePaint],
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!dragStart.current) return;

      const wasDrag = movedFar.current;
      dragStart.current = null;
      movedFar.current = false;

      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }

      const cat = catRef.current;
      latestPull.current = { x: 0, y: 0 };

      if (cat) {
        cat.classList.remove(styles.dragging);
        shadowRef.current?.classList.remove(styles.shadowDragging);
        paint(0, 0);

        if (wasDrag) {
          cat.classList.add(styles.settling);
          settleTimer.current = setTimeout(() => {
            cat.classList.remove(styles.settling);
          }, SETTLE_MS);
        } else {
          cat.classList.add(styles.squeezing);
          squeezeTimer.current = setTimeout(() => {
            cat.classList.remove(styles.squeezing);
          }, SQUEEZE_MS);
        }
      }

      setCount((value) => value + 1);
      popWord(event.clientX, event.clientY);
    },
    [paint, popWord],
  );

  return (
    <main className={styles.pageShell}>
      <section className={styles.phoneFrame} aria-label="捏捏猫解压游戏">
        <div className={styles.stage} ref={stageRef}>
          <div className={styles.bgGradient} />
          <div className={styles.particle1} />
          <div className={styles.particle2} />
          <div className={styles.particle3} />

          <header className={styles.header}>
            <div className={styles.titleCard}>
              <h1>捏捏猫</h1>
              <p>轻轻一捏，或按住拖着玩</p>
            </div>
            <div className={styles.statsCard}>
              <span>已互动</span>
              <strong>{count}</strong>
            </div>
          </header>

          <div className={styles.catArea}>
            <div className={styles.catShadow} ref={shadowRef} />

            <div className={styles.catScene}>
              <div
                ref={catRef}
                className={styles.cat}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                role="button"
                tabIndex={0}
                aria-label="捏一捏猫猫，或按住拖动"
              >
                <span className={styles.tail}>
                  <i />
                </span>

                <span className={`${styles.ear} ${styles.earLeft}`}>
                  <i />
                </span>
                <span className={`${styles.ear} ${styles.earRight}`}>
                  <i />
                </span>

                <span className={styles.head}>
                  <span className={styles.headShade} />
                  <span className={styles.headLight} />

                  <span className={`${styles.eye} ${styles.eyeLeft}`}>
                    <i />
                  </span>
                  <span className={`${styles.eye} ${styles.eyeRight}`}>
                    <i />
                  </span>

                  <span className={`${styles.blush} ${styles.blushLeft}`} />
                  <span className={`${styles.blush} ${styles.blushRight}`} />

                  <span className={styles.muzzle}>
                    <span className={styles.nose} />
                    <span className={styles.mouth} />
                  </span>

                  <span className={`${styles.whisker} ${styles.whiskerL1}`} />
                  <span className={`${styles.whisker} ${styles.whiskerL2}`} />
                  <span className={`${styles.whisker} ${styles.whiskerR1}`} />
                  <span className={`${styles.whisker} ${styles.whiskerR2}`} />
                </span>

                <span className={`${styles.paw} ${styles.pawLeft}`} />
                <span className={`${styles.paw} ${styles.pawRight}`} />

                <span className={styles.gloss} />
              </div>
            </div>
          </div>

          {floatTexts.map((item) => (
            <div key={item.id} className={styles.floatText} style={{ left: item.x, top: item.y }}>
              {item.text}
            </div>
          ))}

          <footer className={styles.footer}>
            <p className={styles.tip}>点一下会弹，按住拖动会朝手指方向倾斜</p>
          </footer>
        </div>
      </section>
    </main>
  );
}
