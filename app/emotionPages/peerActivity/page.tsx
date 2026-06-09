"use client";

import React, { useState, useEffect, useRef } from "react";
import Image, { StaticImageData } from "next/image";
import { OutlineButton } from "./components/OutlineButton";
import { ImageModal } from "./components/ImageModal";
import { galleryConfig } from "./components/galleryConfig";

// 1. 引入首屏核心大图
import bgPic from "./components/pic/BG (1).webp";
import titlePic from "./components/pic/title-1.png"; 

export default function PeerActivityPage() {
  const [activeGalleryId, setActiveGalleryId] = useState<number | null>(null);

  // 加载状态
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isFadeOut, setIsFadeOut] = useState(false);

  const hasStartedLoading = useRef(false);

  useEffect(() => {
    if (hasStartedLoading.current) return;
    hasStartedLoading.current = true;

    // 🔥 核心修复 1：利用 Object.values 动态扁平化拉取所有 import 的静态对象
    const galleryImages = Object.values(galleryConfig).flat() as StaticImageData[];
    
    // 把首屏大图和所有相册图融合成一个顶层静态队列
    const allStaticImages = [bgPic, titlePic, ...galleryImages].filter(Boolean);
    const totalImages = allStaticImages.length;

    if (totalImages === 0) {
      setIsLoading(false);
      return;
    }

    let loadedCount = 0;

    // 强行兜底定时器（6秒），手机端防死锁
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

    // 🔥 核心修复 2：极低并发控制（1张1张串行），专治安卓手机 Webview 内存吞吐卡死
    const CONCURRENCY_LIMIT = 1; 
    let currentIndex = 0;

    const launchNextImage = () => {
      if (currentIndex >= totalImages) return;

      const staticObj = allStaticImages[currentIndex];
      currentIndex++;

      // 🔥 核心修复 3：安卓兼容性绝招 —— 强制触发底层预解码（Decode）
      // 提取 Next.js 静态导入的真正编译后 URL 字符串
      const realUrl = staticObj?.src || (staticObj as any).default?.src || "";

      if (!realUrl) {
        handleImageEvent();
        return;
      }

      const img = new window.Image();
      
      function handleImageEvent() {
        loadedCount++;
        const percent = Math.round((loadedCount / totalImages) * 100);
        setLoadProgress(percent);

        if (loadedCount >= totalImages) {
          handleLoadComplete();
        } else {
          launchNextImage();
        }
      }

      img.onload = () => {
        // 在安卓设备上，onload 触发时不代表图片真的在内存中解压完成了
        // 使用 HTMLImageElement.decode() 强制浏览器内核在后台完成像素解码，彻底解决首次点开空白 Bug
        if (typeof img.decode === "function") {
          img.decode()
            .then(handleImageEvent)
            .catch(handleImageEvent); // 即使解码微报错也继续
        } else {
          handleImageEvent();
        }
      };

      img.onerror = handleImageEvent;
      img.src = realUrl;
    };

    // 启动单轨串行加载
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