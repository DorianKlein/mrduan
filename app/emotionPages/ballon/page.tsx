"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./ballon.module.css";

type Balloon = {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
  color: "rose" | "sun" | "sky" | "mint" | "violet";
  sway: number;
};

type PopMessage = {
  id: number;
  x: number;
  y: number;
  text: string;
};

const TOTAL_SECONDS = 30;
const BALLOON_COLORS: Balloon["color"][] = ["rose", "sun", "sky", "mint", "violet"];
const WARM_WORDS = [
  "你已经很努力了，今天可以慢一点",
  "辛苦都被看见了，请给自己一点掌声",
  "你不需要一直坚强，也值得被拥抱",
  "这一刻只属于你，好好喘口气吧",
  "你比想象中更勇敢，也更柔软",
  "疲惫会散去，温柔会回来",
  "不用急着证明自己，你本来就很好",
  "今天的你，也值得被认真喜欢",
  "把紧绷放下吧，你已经做得够好了",
  "愿你被生活轻轻接住",
  "小小的快乐，也能照亮今天",
  "你可以休息，世界不会因此停下",
  "别忘了，你一直在慢慢变好",
  "允许自己不完美，也是一种勇敢",
  "这周的疲惫，到这里就轻一点吧",
  "你值得拥有轻松的夜晚",
  "先照顾好自己，再去面对世界",
  "你的感受很重要，不用假装没事",
  "请把温柔也留给自己一份",
  "就算今天普通，你也依然珍贵",
  "你走过的每一步都算数",
  "慢慢来，你有自己的节奏",
  "有些压力，可以不用一个人扛",
  "愿你今晚睡得安稳，醒来有光",
  "你不是落后，只是在认真生活",
];

const createBalloon = (id: number): Balloon => ({
  id,
  x: 8 + Math.random() * 84,
  size: 58 + Math.random() * 34,
  delay: Math.random() * 3.6,
  duration: 7.2 + Math.random() * 4.2,
  color: BALLOON_COLORS[id % BALLOON_COLORS.length],
  sway: 18 + Math.random() * 34,
});

const getWarmWord = () => WARM_WORDS[Math.floor(Math.random() * WARM_WORDS.length)];

export default function BallonPage() {
  const [hasStarted, setHasStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [messages, setMessages] = useState<PopMessage[]>([]);
  const nextBalloonId = useRef(1);
  const nextMessageId = useRef(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const spawnRef = useRef<NodeJS.Timeout | null>(null);

  const progress = useMemo(() => ((TOTAL_SECONDS - secondsLeft) / TOTAL_SECONDS) * 100, [secondsLeft]);

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (spawnRef.current) clearInterval(spawnRef.current);
    timerRef.current = null;
    spawnRef.current = null;
  }, []);

  const resetGame = useCallback(() => {
    clearTimers();
    nextBalloonId.current = 9;
    nextMessageId.current = 1;
    setSecondsLeft(TOTAL_SECONDS);
    setBalloons(Array.from({ length: 8 }, (_, index) => createBalloon(index + 1)));
    setMessages([]);
    setIsFinished(false);
    setHasStarted(true);
  }, [clearTimers]);

  useEffect(() => {
    document.title = "气球治愈 30 秒";
    nextBalloonId.current = 9;
    setBalloons(Array.from({ length: 8 }, (_, index) => createBalloon(index + 1)));

    return clearTimers;
  }, [clearTimers]);

  useEffect(() => {
    if (!hasStarted || isFinished) return;

    timerRef.current = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          clearTimers();
          setIsFinished(true);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    spawnRef.current = setInterval(() => {
      setBalloons((current) => {
        const fresh = createBalloon(nextBalloonId.current++);
        return [...current.slice(-13), fresh];
      });
    }, 720);

    return clearTimers;
  }, [clearTimers, hasStarted, isFinished]);

  const handlePop = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>, balloonId: number) => {
      if (!hasStarted || isFinished) return;

      const stage = event.currentTarget.closest(`.${styles.stage}`);
      const rect = stage?.getBoundingClientRect();
      const x = rect ? event.clientX - rect.left : event.clientX;
      const y = rect ? event.clientY - rect.top : event.clientY;
      const messageId = nextMessageId.current++;

      setBalloons((current) => current.filter((balloon) => balloon.id !== balloonId));
      setMessages((current) => [...current.slice(-5), { id: messageId, x, y, text: getWarmWord() }]);

      window.setTimeout(() => {
        setMessages((current) => current.filter((message) => message.id !== messageId));
      }, 2600);
    },
    [hasStarted, isFinished],
  );

  return (
    <main className={styles.pageShell}>
      <section className={styles.phoneFrame} aria-label="30 秒戳破疲惫气球">
        <div className={styles.stage}>
          <div className={styles.ambientOne} />
          <div className={styles.ambientTwo} />
          <div className={styles.cloudLeft} />
          <div className={styles.cloudRight} />

          <header className={styles.topBar}>
            <div>
              <span>剩余</span>
              <strong>{secondsLeft}s</strong>
            </div>
            <div className={styles.progressTrack} aria-hidden="true">
              <i style={{ width: `${progress}%` }} />
            </div>
          </header>

          {!hasStarted && (
            <div className={styles.openingCard}>
              <p>让我用接下来的 30 秒</p>
              <h1>赶走本周的疲惫</h1>
              <span>轻轻戳破升起的气球，把压力留在这里。</span>
              <button type="button" onClick={resetGame}>开始 30 秒</button>
            </div>
          )}

          {hasStarted && !isFinished && (
            <p className={styles.tip}>戳破气球，收下一句给自己的温柔话</p>
          )}

          <div className={styles.balloonLayer} aria-hidden={!hasStarted}>
            {balloons.map((balloon) => (
              <button
                type="button"
                key={balloon.id}
                className={`${styles.balloon} ${styles[balloon.color]}`}
                style={
                  {
                    "--x": `${balloon.x}%`,
                    "--size": `${balloon.size}px`,
                    "--delay": `${balloon.delay}s`,
                    "--duration": `${balloon.duration}s`,
                    "--sway": `${balloon.sway}px`,
                  } as React.CSSProperties
                }
                onPointerDown={(event) => handlePop(event, balloon.id)}
                aria-label="戳破气球"
                disabled={!hasStarted || isFinished}
              >
                <span className={styles.balloonBody} />
                <span className={styles.balloonKnot} />
                <span className={styles.balloonString} />
              </button>
            ))}
          </div>

          {messages.map((message) => (
            <div
              key={message.id}
              className={styles.popMessage}
              style={{ left: message.x, top: message.y }}
            >
              {message.text}
            </div>
          ))}

          {isFinished && (
            <div className={styles.finishCard}>
              <p>这 30 秒结束了</p>
              <h2>疲惫已经轻了一点</h2>
              <span>愿接下来的时间，你也能被温柔照顾。</span>
              <button type="button" onClick={resetGame}>再来一次</button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
