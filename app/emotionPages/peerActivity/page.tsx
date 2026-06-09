"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import bgPic from "./components/pic/BG (1).webp";
import titlePic from "./components/pic/title-1.png"; 
import { OutlineButton } from "./components/OutlineButton";
import { ImageModal } from "./components/ImageModal";
import { galleryConfig } from "./components/galleryConfig";

export default function PeerActivityPage() {
  const [activeGalleryId, setActiveGalleryId] = useState<number | null>(null);

  // 加载状态管理
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isFadeOut, setIsFadeOut] = useState(false);

  // 使用 ref 来防止在 React 严格模式下 Effect 重复触发导致的网络混乱
  const hasStartedLoading = useRef(false);

  useEffect(() => {
    if (hasStartedLoading.current) return;
    hasStartedLoading.current = true;

    // 1. 收集所有需要加载的图片源
    const galleryImages = Object.values(galleryConfig).flat();
    // 确保首屏最核心的背景和标题最先加载
    const allImages = [bgPic, titlePic, ...galleryImages].filter(Boolean);
    const totalImages = allImages.length;

    if (totalImages === 0) {
      setIsLoading(false);
      return;
    }

    let loadedCount = 0;

    // 安全兜底定时器：手机端网络复杂，6秒后不管加载多少，绝对放行，防止死屏
    const safetyTimeout = setTimeout(() => {
      handleLoadComplete();
    }, 6000);

    const handleLoadComplete = () => {
      setIsFadeOut(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
      clearTimeout(safetyTimeout);
    };

    // 2. 手机端优化核心：队列串行/并发控制加载（一次只加载 3 张，防止塞死手机网络信道）
    const CONCURRENCY_LIMIT = 3; 
    let currentIndex = 0;

    const launchNextImage = () => {
      if (currentIndex >= totalImages) return;

      const src = allImages[currentIndex];
      currentIndex++;

      const img = new window.Image();
      
      // 极其严格的路径解析，确保 Next.js 的静态导入在手机端百分之百能识别
      let imageUrl = "";
      if (typeof src === "string") {
        imageUrl = src;
      } else if (src && typeof src === "object") {
        imageUrl = (src as any).src || (src as any).default?.src || "";
      }

      if (!imageUrl) {
        // 如果路径为空，直接跳过并算作加载完成
        handleImageEvent();
        return;
      }

      function handleImageEvent() {
        loadedCount++;
        const percent = Math.round((loadedCount / totalImages) * 100);
        setLoadProgress(percent);

        if (loadedCount >= totalImages) {
          handleLoadComplete();
        } else {
          // 当前这张好了，立刻补上下一张，保持通道占满但不过载
          launchNextImage();
        }
      }

      img.onload = handleImageEvent;
      img.onerror = handleImageEvent; // 失败也放行，防止单张图挂掉导致手机端卡死
      img.src = imageUrl;
    };

    // 启动首批并发队列
    for (let i = 0; i < Math.min(CONCURRENCY_LIMIT, totalImages); i++) {
      launchNextImage();
    }

    return () => clearTimeout(safetyTimeout);
  }, []);

  const openGallery = (id: number) => {
    setActiveGalleryId(id);
  };

  const closeGallery = () => {
    setActiveGalleryId(null);
  };

  return (
    <main className="w-full min-h-[100dvh] bg-[#fdfaf4] flex flex-col items-center relative overflow-x-hidden">
      
      {/* 1. 开屏预加载进度条遮罩 */}
      {isLoading && (
        <div 
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#fdfaf4] transition-opacity duration-500 ease-out ${
            isFadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="mb-6 text-base font-bold text-[#8B5A2B] tracking-wide animate-pulse">
            内容正在加载中...
          </div>
          <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden border border-gray-100 shadow-inner">
            <div 
              className="h-full bg-[#8B5A2B] rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <div className="mt-3 text-xs font-semibold text-gray-500 tabular-nums">
            {loadProgress}%
          </div>
        </div>
      )}

      {/* 2. 交互弹窗组件 */}
      <ImageModal 
        isOpen={activeGalleryId !== null}
        onClose={closeGallery}
        images={activeGalleryId ? galleryConfig[activeGalleryId] : []}
      />

      {/* 3. 主页面内容 */}
      <div className="relative w-full max-w-[768px]">
        <Image
          src={bgPic}
          alt="Activity Background"
          className="w-full h-auto block pointer-events-none"
          priority
          quality={100}
        />

        <div className="absolute top-[3%] left-1/2 -translate-x-1/2 w-[80%] z-30 pointer-events-none">
          <Image
            src={titlePic}
            alt="第3季 青春同行 花YOUNG大连"
            className="w-full h-auto drop-shadow-lg"
            priority
          />
        </div>

        {/* 4. 绝对定位交互点按钮 */}
        <div className="absolute top-[20%] left-[22%] z-20 w-[30%] aspect-[4/3]">
          <OutlineButton onClick={() => openGallery(1)} className="w-full h-full bg-transparent p-1 sm:p-2 border-0 outline-none hover:scale-105 active:scale-95 cursor-pointer">
            <span className="text-[11px] sm:text-sm md:text-base font-extrabold text-black leading-tight text-center pb-1 pointer-events-none [text-shadow:_0_1px_4px_rgb(255_255_255_/_100%),_0_0_2px_rgb(255_255_255_/_100%)]">
              团市委“连青空间”
            </span>
          </OutlineButton>
        </div>

        <div className="absolute top-[28%] left-[52%] z-20 w-[30%] aspect-[4/3]">
          <OutlineButton onClick={() => openGallery(2)} className="w-full h-full bg-transparent p-1 sm:p-2 border-0 outline-none hover:scale-105 active:scale-95 cursor-pointer">
            <span className="text-[11px] sm:text-sm md:text-base font-extrabold text-black leading-tight text-center pb-1 pointer-events-none [text-shadow:_0_1px_4px_rgb(255_255_255_/_100%),_0_0_2px_rgb(255_255_255_/_100%)]">
              大连市西岗文化馆<br/>（核雕）
            </span>
          </OutlineButton>
        </div>

        <div className="absolute top-[36%] left-[24%] z-20 w-[28%] aspect-[4/3]">
          <OutlineButton onClick={() => openGallery(3)} className="w-full h-full bg-transparent p-1 sm:p-2 border-0 outline-none hover:scale-105 active:scale-95 cursor-pointer">
            <span className="text-[11px] sm:text-sm md:text-base font-extrabold text-black leading-tight text-center pb-1 pointer-events-none [text-shadow:_0_1px_4px_rgb(255_255_255_/_100%),_0_0_2px_rgb(255_255_255_/_100%)]">
              金阿山艺术馆
            </span>
          </OutlineButton>
        </div>

        <div className="absolute top-[43.5%] left-[60%] z-20 w-[30%] aspect-[4/3]">
          <OutlineButton onClick={() => openGallery(4)} className="w-full h-full bg-transparent p-1 sm:p-2 border-0 outline-none hover:scale-105 active:scale-95 cursor-pointer">
            <span className="text-[11px] sm:text-sm md:text-base font-extrabold text-black leading-tight text-center pb-1 pointer-events-none [text-shadow:_0_1px_4px_rgb(255_255_255_/_100%),_0_0_2px_rgb(255_255_255_/_100%)]">
              钟氏面塑工艺品馆
            </span>
          </OutlineButton>
        </div>

        <div className="absolute top-[52%] left-[22%] z-20 w-[30%] aspect-[4/3]">
          <OutlineButton onClick={() => openGallery(5)} className="w-full h-full bg-transparent p-1 sm:p-2 border-0 outline-none hover:scale-105 active:scale-95 cursor-pointer">
            <span className="text-[11px] sm:text-sm md:text-base font-extrabold text-black leading-tight text-center pb-1 pointer-events-none [text-shadow:_0_1px_4px_rgb(255_255_255_/_100%),_0_0_2px_rgb(255_255_255_/_100%)]">
              金家街非遗文化体验馆
            </span>
          </OutlineButton>
        </div>

        <div className="absolute top-[65%] left-[60%] z-20 w-[30%] aspect-[4/3]">
          <OutlineButton onClick={() => openGallery(6)} className="w-full h-full bg-transparent p-1 sm:p-2 border-0 outline-none hover:scale-105 active:scale-95 cursor-pointer">
            <span className="text-[11px] sm:text-sm md:text-base font-extrabold text-black leading-tight text-center pb-1 pointer-events-none [text-shadow:_0_1px_4px_rgb(255_255_255_/_100%),_0_0_2px_rgb(255_255_255_/_100%)]">
              东关街<br/>（泽惠园槐花饼）
            </span>
          </OutlineButton>
        </div>

        <div className="absolute top-[76%] left-[29%] z-20 w-[28%] aspect-[4/3]">
          <OutlineButton onClick={() => openGallery(7)} className="w-full h-full bg-transparent p-1 sm:p-2 border-0 outline-none hover:scale-105 active:scale-95 cursor-pointer">
            <span className="text-[11px] sm:text-sm md:text-base font-extrabold text-black leading-tight text-center pb-1 pointer-events-none [text-shadow:_0_1px_4px_rgb(255_255_255_/_100%),_0_0_2px_rgb(255_255_255_/_100%)]">
              东关街<br/>（甲骨刻辞）
            </span>
          </OutlineButton>
        </div>

        <div className="absolute top-[84%] left-[60%] z-20 w-[36%] aspect-[5/4]">
          <OutlineButton onClick={() => openGallery(8)} className="w-full h-full bg-transparent p-1 sm:p-2 border-0 outline-none hover:scale-105 active:scale-95 cursor-pointer">
            <span className="text-[10px] sm:text-xs md:text-sm font-extrabold text-black leading-tight text-center pb-1 pointer-events-none [text-shadow:_0_1px_4px_rgb(255_255_255_/_100%),_0_0_2px_rgb(255_255_255_/_100%)]">
              东关街<br/>（时光印记活字印刷体验馆）
            </span>
          </OutlineButton>
        </div>

      </div>
    </main>
  );
}