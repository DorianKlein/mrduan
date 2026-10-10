'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useState, type MouseEventHandler } from 'react';

type GlowButtonProps = {
  /** 中心坐标和直径，以定位父容器宽高的百分比计算。 */
  x?: number;
  y?: number;
  size?: number;
  color?: string;
  label?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  initialX?: number;
  initialY?: number;
  entryDuration?: number;
  entryDelay?: number;
};

export default function GlowButton({
  x = 50,
  y = 50,
  size = 12,
  color = '#ffe6a3',
  label = '播放光晕效果',
  onClick,
  initialX = 80,
  initialY = 20,
  entryDuration = 4,
  entryDelay = 0,
}: GlowButtonProps) {
  const [clickCount, setClickCount] = useState(0);
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={(event) => {
        setClickCount((count) => count + 1);
        onClick?.(event);
      }}
      className="absolute z-10 aspect-square -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-0 p-0 outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-100"
      initial={reduceMotion ? false : { left: `${initialX}%`, top: `${initialY}%`, opacity: 0 }}
      animate={{ left: `${x}%`, top: `${y}%`, opacity: 1 }}
      transition={{
        left: { duration: entryDuration, delay: entryDelay, ease: [0.22, 1, 0.36, 1] },
        top: { duration: entryDuration, delay: entryDelay, ease: [0.22, 1, 0.36, 1] },
        opacity: { duration: 0.3, delay: entryDelay, ease: 'easeOut' },
      }}
      style={{ width: `${size}%`, color, background: 'transparent' }}
    >
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, currentColor 0%, color-mix(in srgb, currentColor 45%, transparent) 25%, transparent 70%)',
        }}
        animate={reduceMotion ? { opacity: 0.8, scale: 1 } : { opacity: [0.55, 1, 0.55], scale: [0.9, 1.1, 0.9] }}
        transition={reduceMotion ? { duration: 0 } : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      {!reduceMotion && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full border border-current"
          style={{ boxShadow: '0 0 10px currentColor, inset 0 0 6px currentColor' }}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: [0.5, 1.4], opacity: [0, 0.5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1, ease: 'easeOut' }}
        />
      )}
      {clickCount > 0 && (
        <motion.span
          key={clickCount}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full border border-current"
          style={{ boxShadow: '0 0 18px currentColor, inset 0 0 12px currentColor' }}
          initial={{ scale: reduceMotion ? 1 : 0.5, opacity: 1 }}
          animate={{ scale: reduceMotion ? 1 : 2.2, opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      )}
    </motion.button>
  );
}
