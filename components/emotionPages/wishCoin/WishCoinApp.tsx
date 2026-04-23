"use client";

import { useCallback, useState } from "react";
import { CoinFace, type WishToken } from "./CoinFace";
import { InstructionCard } from "./InstructionCard";
import { useShakeAndSwipe } from "./useShakeAndSwipe";
import styles from "./wishCoin.module.css";

const wishTokens: WishToken[] = [
  { word: "如愿", blessing: "愿你今天抬头,就能看见好消息" },
  { word: "安心", blessing: "慢一点也没关系,你正在变得更稳" },
  { word: "顺意", blessing: "你在意的事情,会一点点朝你靠近" },
  { word: "丰盈", blessing: "愿你的心和生活,都被美好填满" },
  { word: "轻松", blessing: "把重担轻轻放下,今晚好好休息" },
  { word: "遇喜", blessing: "下一次转角,正有惊喜在等你" },
  { word: "有光", blessing: "就算慢行,你也一直在向光而去" },
  { word: "被爱", blessing: "你值得被偏爱,也值得被认真对待" },
  { word: "笃定", blessing: "你的选择正在开花,时间会证明你" },
  { word: "常乐", blessing: "愿你平安喜乐,日子温暖明亮" },
];

export function WishCoinApp() {
  const [tossing, setTossing] = useState(false);
  const [result, setResult] = useState<WishToken | null>(null);
  const [tossSeed, setTossSeed] = useState(0);

  const tossCoin = useCallback(() => {
    if (tossing) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * wishTokens.length);
    const next = wishTokens[randomIndex];
    setTossing(true);
    setTossSeed((prev) => prev + 1);

    window.setTimeout(() => {
      setResult(next);
      setTossing(false);
    }, 1150);
  }, [tossing]);

  const { touchHandlers, motionPermission, requestMotionPermission, shakeSupported } = useShakeAndSwipe({
    onTrigger: tossCoin,
    disabled: tossing,
  });

  return (
    <main className={styles.page} {...touchHandlers}>
      <div className={styles.backdrop} />
      <div className={styles.content}>
        <InstructionCard
          shakeSupported={shakeSupported}
          motionPermission={motionPermission}
          onEnableShake={requestMotionPermission}
        />

        <CoinFace tossing={tossing} tossSeed={tossSeed} result={result} />

        <button className={styles.tossBtn} onClick={tossCoin} type="button" disabled={tossing}>
          {tossing ? "抛币中..." : "手动抛一次"}
        </button>
      </div>
    </main>
  );
}
