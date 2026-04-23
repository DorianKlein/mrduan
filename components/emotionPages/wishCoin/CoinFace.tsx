"use client";

import { motion } from "framer-motion";
import styles from "./wishCoin.module.css";

type WishToken = {
  word: string;
  blessing: string;
};

type CoinFaceProps = {
  tossing: boolean;
  tossSeed: number;
  result: WishToken | null;
};

const defaultToken: WishToken = {
  word: "如愿",
  blessing: "愿你被温柔接住,心想慢慢成真",
};

function splitBlessingByComma(blessing: string): [string, string] {
  const parts = blessing
    .split(/[，,]/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return ["", ""];
  }

  if (parts.length === 1) {
    return [parts[0], ""];
  }

  return [parts[0], parts.slice(1).join("，")];
}

export function CoinFace({ tossing, tossSeed, result }: CoinFaceProps) {
  const landedToken = result ?? defaultToken;
  const [firstLine, secondLine] = splitBlessingByComma(landedToken.blessing);

  return (
    <div className={styles.coinZone}>
      <motion.div
        key={tossSeed}
        className={styles.coin}
        animate={
          tossing
            ? {
                y: [0, -180, -300, -180, 0],
                rotateX: [0, 1080, 1800, 2520],
                rotateY: [0, 120, 60, 0],
              }
            : {
                y: 0,
                rotateX: 0,
                rotateY: 0,
              }
        }
        transition={{ duration: tossing ? 1.2 : 0.45, ease: "easeOut" }}
      >
        <div className={styles.coinInner}>{tossing ? "?" : landedToken.word}</div>
      </motion.div>

      <div className={styles.coinResult}>
        <span className={styles.coinResultTitle}>签语</span>
        <span className={styles.coinResultLine}>{tossing ? "抛出中..." : firstLine}</span>
        <span className={styles.coinResultLine}>{tossing ? " " : secondLine || " "}</span>
      </div>
    </div>
  );
}

export type { WishToken };
