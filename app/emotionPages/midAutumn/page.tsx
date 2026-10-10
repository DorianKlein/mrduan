'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import GlowButton from './GlowButton';
import VerticalCircularProgress from './VerticalCircularProgress';
import VideoModal, { videoOne, videoTwo, videoThree, videoFour, videoFive, videoSix } from './VideoModal';
import backgroundImage from './assets/backedground.webp';
import goodForYouImage from './assets/goodforyou.webp';

// 坐标为光晕中心占图片宽高的百分比；size 为直径占图片宽度的百分比。
const GLOW_BUTTONS = [
  { id: 'button-1', x: 20, y: 65, size: 12, color: '#ffe6a3', video: videoOne },
  { id: 'button-2', x: 23, y: 88, size: 12, color: '#ffe6a3', video: videoTwo },
  { id: 'button-3', x: 55, y: 72, size: 10, color: '#ffe6a3', video: videoThree },
  { id: 'button-4', x: 88, y: 70, size: 12, color: '#ffe6a3', video: videoFour },
  { id: 'button-5', x: 76, y: 92, size: 10, color: '#ffe6a3', video: videoFive },
  { id: 'button-6', x: 40, y: 35, size: 12, color: '#ffe6a3', video: videoSix },
];

const VIDEO_MESSAGES: Record<string, string> = {
  [videoOne]: '为来连求职、创业及实习青年提供免费短期住宿与落脚',
  [videoTwo]: '通过艺术、技能与美学等多元课程，助力青年夜间充电、减压并融入城市文化的学习平台',
  [videoThree]: '提供精准职业规划、技能实操与政策辅导，全方位扶持青年就业起步与创业发展的赋能阵地',
  [videoFour]: '依托专业力量与24小时智能服务，守护青少年心理健康、权益维护与危机干预的综合枢纽台',
  [videoFive]: '以实名认证与严格审核为核心，为单身青年搭建安全、可靠且高效的公益婚恋交友空间',
  [videoSix]: '有了万家灯火',
};

const ENTRY_DURATION = 4;

const PROGRESS_CONFIG = {
  x: 74,
  y: 16.3,
  size: 47,
  maskColor: 'rgba(0, 0, 0, 0.42)',
};

export default function MidAutumnPage() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [completedButtons, setCompletedButtons] = useState<Set<string>>(new Set());
  const [introProgress, setIntroProgress] = useState(100);
  const [showGreeting, setShowGreeting] = useState(false);
  const [videoMessage, setVideoMessage] = useState<string | null>(null);
  const closeVideo = useCallback(() => {
    if (activeVideo) {
      setVideoMessage(VIDEO_MESSAGES[activeVideo] ?? null);
    }
    setActiveVideo(null);
  }, [activeVideo]);

  useEffect(() => {
    const startTime = performance.now();
    let animationFrame = 0;

    const updateProgress = (time: number) => {
      const elapsed = time - startTime;
      setIntroProgress(Math.max(0, 100 - (elapsed / (ENTRY_DURATION * 1000)) * 100));
      if (elapsed < ENTRY_DURATION * 1000) {
        animationFrame = requestAnimationFrame(updateProgress);
      }
    };

    animationFrame = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const completeButton = useCallback((id: string) => {
    setCompletedButtons((completed) => {
      if (completed.has(id)) return completed;
      const next = new Set(completed);
      next.add(id);
      return next;
    });
  }, []);

  const handleButtonClick = useCallback((id: string, video?: string) => {
    completeButton(id);
    setVideoMessage(null);
    if (video) {
      setActiveVideo(video);
    }
  }, [completeButton]);

  return (
    <div className="flex h-dvh w-full items-center justify-center overflow-hidden">
      <div
        className="relative shrink-0"
        style={{
          width: `min(100%, ${100 * backgroundImage.width / backgroundImage.height}dvh)`,
          aspectRatio: `${backgroundImage.width} / ${backgroundImage.height}`,
        }}
      >
        <Image
          src={backgroundImage}
          alt="中秋背景"
          fill
          priority
          sizes="100vw"
          className="object-contain"
          quality={100}
        />
        <VerticalCircularProgress
          {...PROGRESS_CONFIG}
          progress={introProgress > 0 ? introProgress : (completedButtons.size / GLOW_BUTTONS.length) * 100}
          completed={completedButtons.size === GLOW_BUTTONS.length}
          onClick={() => setShowGreeting(true)}
        />
        {GLOW_BUTTONS.map(({ id, video, ...config }) => (
          <GlowButton
            key={id}
            {...config}
            entryDuration={ENTRY_DURATION}
            label={video ? `播放${id === 'button-1' ? '第一个' : '第二个'}视频` : undefined}
            onClick={() => handleButtonClick(id, video)}
          />
        ))}
      </div>
      {videoMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-6 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="视频说明"
          onClick={() => setVideoMessage(null)}
        >
          <div
            className="relative text-center"
            onClick={(event) => event.stopPropagation()}
          >
            <motion.p
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: [0.75, 1, 0.75], y: [8, 0, 8], scale: [0.96, 1, 0.96] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              className="text-lg font-medium tracking-wide text-yellow-50 drop-shadow-[0_0_5px_rgba(255,255,220,0.95)] sm:text-2xl"
            >
              {videoMessage}
            </motion.p>
          </div>
        </div>
      )}
      {showGreeting && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-6 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="中秋祝福"
          onClick={() => setShowGreeting(false)}
        >
          <div
            className="relative max-h-[calc(100dvh-3rem)] max-w-[calc(100vw-3rem)]"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={goodForYouImage}
              alt="正是因为您的辛勤工作，才有了万家灯火的中秋，您辛苦了！"
              priority
              className="h-auto max-h-[calc(100dvh-3rem)] w-auto max-w-[calc(100vw-3rem)] object-contain drop-shadow-[0_0_24px_rgba(255,224,75,0.75)]"
            />
          </div>
        </div>
      )}
      {activeVideo && <VideoModal src={activeVideo} onClose={closeVideo} />}
    </div>
  );
}
