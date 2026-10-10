'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

type VideoModalProps = {
  src: string;
  onClose: () => void;
};

export const videoOne = '/midAutumn/1video.mp4';
export const videoTwo = '/midAutumn/2video.mp4';
export const videoThree = '/midAutumn/3video.mp4';
export const videoFour = '/midAutumn/4video.mp4';
export const videoFive = '/midAutumn/5video.mp4';
export const videoSix = '/midAutumn/6video.mp4';

export default function VideoModal({ src, onClose }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // 确保安卓微信能顺利开始播放
    const video = videoRef.current;
    if (video) {
      video.play().catch((err) => {
        console.warn('自动播放被拦截，降级静音重试:', err);
        video.muted = true;
        video.play().catch(() => {});
      });
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="视频播放窗口"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-full max-w-full items-center justify-center"
        onClick={(event) => event.stopPropagation()}
      >
        <video
          ref={videoRef}
          src={src}
          autoPlay
          muted // 👈 关键修复 1：加上静音，保证安卓微信允许拉流和解码首帧
          controls // 建议加上 controls，用户可以手动打开声音
          preload="metadata" // 👈 关键修复 2：避免预加载阶段就锁死带宽
          playsInline
          webkit-playsinline="true" // 👈 关键修复 3：Webkit 行内属性
          
          x5-video-player-type="h5-page" // 👈 关键修复 4：启用同层渲染，防止安卓黑屏
          
          x5-video-player-fullscreen="false"
          disablePictureInPicture
          controlsList="nodownload noplaybackrate noremoteplayback"
          onCanPlay={() => setIsLoading(false)}
          onWaiting={() => setIsLoading(true)}
          onPlaying={() => setIsLoading(false)}
          onError={(e) => {
            console.error('视频播放报错:', e);
            setIsLoading(false);
          }}
          className="max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] rounded-lg bg-black object-contain shadow-2xl"
        />
        {isLoading && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-white/80">
            正在加载视频...
          </div>
        )}
        <button
          type="button"
          aria-label="关闭视频"
          onClick={onClose}
          className="absolute right-2 top-2 inline-flex size-10 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <X size={22} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}