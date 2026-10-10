'use client';

import { motion, useReducedMotion } from 'framer-motion';

type VerticalCircularProgressProps = {
  progress?: number;
  x?: number;
  y?: number;
  size?: number;
  maskColor?: string;
  label?: string;
  completed?: boolean;
  onClick?: () => void;
};

export default function VerticalCircularProgress({
  progress = 0,
  x = 88,
  y = 14,
  size = 8,
  maskColor = 'rgba(0, 0, 0, 0.42)',
  label = '竖向进度条',
  completed = false,
  onClick,
}: VerticalCircularProgressProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const remainingMask = 100 - clampedProgress;
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      role="progressbar"
      aria-label={completed ? `${label}，点击查看祝福` : label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clampedProgress}
      aria-disabled={!completed}
      tabIndex={completed ? 0 : -1}
      onClick={completed ? onClick : undefined}
      className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-0 p-0 outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-100 ${completed ? 'pointer-events-auto' : 'pointer-events-none'}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}%`,
        aspectRatio: '1',
        cursor: completed ? 'pointer' : 'default',
        background: 'transparent',
      }}
      animate={
        completed && !reduceMotion
          ? { filter: ['brightness(1)', 'brightness(3.4)', 'brightness(1)'], boxShadow: ['0 0 10px rgba(255, 230, 163, 0.7)', '0 0 42px rgba(255, 244, 180, 1)', '0 0 10px rgba(255, 230, 163, 0.7)'] }
          : { filter: 'brightness(1)', boxShadow: '0 0 10px rgba(255, 230, 163, 0.7)' }
      }
      transition={completed && !reduceMotion ? { duration: 1.3, repeat: Infinity, repeatDelay: 0.35, ease: 'easeInOut' } : { duration: 0 }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 transition-[height] duration-500 ease-out"
        style={{
          height: `${remainingMask}%`,
          background: maskColor,
        }}
      />
      {completed && !reduceMotion && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(255, 230, 163, 0.72) 24%, transparent 68%)',
          }}
          initial={{ opacity: 0.2, scale: 0.65 }}
          animate={{ opacity: [0.25, 1, 0.25], scale: [0.65, 1.45, 1.85] }}
          transition={{ duration: 1.3, repeat: Infinity, repeatDelay: 0.35, ease: 'easeOut' }}
        />
      )}
    </motion.button>
  );
}
