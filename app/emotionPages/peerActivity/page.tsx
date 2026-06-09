"use client";

import React, { useState, useEffect } from "react";
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
  const [isFadeOut, setIsFadeOut] = useState(false); // 用于控制遮罩层淡出动画

  useEffect(() => {
    // 1. 收集所有需要预加载的图片（包括背景、标题以及弹窗组图）
    // 扁平化 galleryConfig 里的所有图片数组
    const galleryImages = Object.values(galleryConfig).flat();
    
    // 把首屏的核心大图也加入预加载队列中
    const allImages = [bgPic, titlePic, ...galleryImages];
    const totalImages = allImages.length;

    if (totalImages === 0) {
      setIsLoading(false);
      return;
    }

    let loadedCount = 0;

    // 2. 设置安全兜底定时器：6秒后如果还没加载完，也强制进入首页，避免用户死等
    const safetyTimeout = setTimeout(() => {
      handleLoadComplete();
    }, 6000);

    // 处理加载完成的收尾动画
    const handleLoadComplete = () => {
      setIsFadeOut(true); // 触发淡出
      setTimeout(() => {
        setIsLoading(false); // 彻底销毁加载组件
      }, 500); // 这里的延迟时间对应 transition-opacity 的 duration
      clearTimeout(safetyTimeout);
    };

    // 3. 遍历并执行预加载
    allImages.forEach((src) => {
      const img = new window.Image();
      
      // 兼容 Next.js 的静态导入对象（Object { src: ... }）和普通的字符串路径
      img.src = typeof src === "string" ? src : (src as any).src || "";

      const handleImageEvent = () => {
        loadedCount++;
        const percent = Math.round((loadedCount / totalImages) * 100);
        setLoadProgress(percent);

        if (loadedCount >= totalImages) {
          handleLoadComplete();
        }
      };

      img.onload = handleImageEvent;
      img.onerror = handleImageEvent; // 某张图片报错也继续计数，不卡死流程
    });

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
      
      {/* ==================== 1. 开屏预加载进度条遮罩 ==================== */}
      {isLoading && (
        <div 
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#fdfaf4] transition-opacity duration-500 ease-out ${
            isFadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="mb-6 text-base font-bold text-[#8B5A2B] tracking-wide animate-pulse">
            精彩内容正在加载中...
          </div>
          
          {/* 进度条轨道 */}
          <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden border border-gray-100 shadow-inner">
            {/* 进度条填充 */}
            <div 
              className="h-full bg-[#8B5A2B] rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          
          {/* 数字百分比 */}
          <div className="mt-3 text-xs font-semibold text-gray-500 tabular-nums">
            {loadProgress}%
          </div>
        </div>
      )}

      {/* ==================== 2. 交互弹窗组件 ==================== */}
      <ImageModal 
        isOpen={activeGalleryId !== null}
        onClose={closeGallery}
        images={activeGalleryId ? galleryConfig[activeGalleryId] : []}
      />

      {/* ==================== 3. 主页面内容 ==================== */}
      <div className="relative w-full max-w-[768px]">
        
        {/* 背景图：改用 w-full h-auto 让它自适应撑开 */}
        <Image
          src={bgPic}
          alt="Activity Background"
          className="w-full h-auto block pointer-events-none"
          priority
          quality={100}
        />

        {/* 标题图片：绝对定位在顶部居中 */}
        <div className="absolute top-[3%] left-1/2 -translate-x-1/2 w-[80%] z-30 pointer-events-none">
          <Image
            src={titlePic}
            alt="第3季 青春同行 花YOUNG大连"
            className="w-full h-auto drop-shadow-lg"
            priority
          />
        </div>

        {/* ==================== 4. 绝对定位交互点按钮 ==================== */}
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