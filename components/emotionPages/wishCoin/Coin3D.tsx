"use client";

import { motion } from "framer-motion";
import styles from "./wishCoin.module.css";

type Coin3DProps = {
  tossing: boolean;
  tossSeed: number;
  word: string;
};

export function Coin3D({ tossing, tossSeed, word }: Coin3DProps) {
  const edgeCount = 28;

  return (
    <motion.div
      key={tossSeed}
      className={styles.coinBody3d}
      animate={
        tossing
          ? {
              rotateX: [0, 120, 240, 390, 540],
              rotateY: [0, 100, 220, 340, 520],
              rotateZ: [0, 8, -8, 6, 0],
            }
          : {
              rotateX: 0,
              rotateY: 0,
              rotateZ: 0,
            }
      }
      transition={{
        duration: tossing ? 1.25 : 0.42,
        times: tossing ? [0, 0.22, 0.45, 0.72, 1] : undefined,
        ease: tossing ? ["easeOut", "linear", "linear", "easeOut"] : "easeOut",
      }}
    >
      <div className={styles.coinFaceFront3d}>
        <div className={styles.coinInner}>{word}</div>
      </div>

      <div className={styles.coinFaceBack3d} />

      <div className={styles.coinRim3d}>
        {Array.from({ length: edgeCount }).map((_, index) => {
          const angle = (360 / edgeCount) * index;
          return (
            <span
              key={index}
              className={styles.coinRimSegment}
              style={{
                transform: `rotateZ(${angle}deg) translateX(75px)`,
              }}
            >
              <span className={styles.coinRimSlice} />
            </span>
          );
        })}
      </div>
    </motion.div>
  );
}
