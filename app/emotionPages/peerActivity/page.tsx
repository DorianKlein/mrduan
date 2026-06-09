"use client";

import React, { useState, useEffect } from "react";
import Image, { StaticImageData } from "next/image";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: (StaticImageData | string)[];
}

export const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // 🔥 核心修复 1：新增一个局部加载状态，给手机端图片对象解析提供缓冲时间
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setIsReady(false);
      
      // 给浏览器一个 50ms 的极短宏任务宏延迟，确保 Next.js 的 Chunks 和静态对象完全反序列化
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 50);
      
      return () => clearTimeout(timer);
    } else {
      setIsReady(false);
    }
  }, [isOpen, images]);

  // 🔥 核心修复 2：只要翻页，就提前静默预载它的“下一张”和“上一张”，防止滑屏卡顿
  useEffect(() => {
    if (!isOpen || !images || images.length <= 1) return;

    const nextIdx = (currentIndex + 1) % images.length;
    const prevIdx = (currentIndex - 1 + images.length) % images.length;

    [nextIdx, prevIdx].forEach((idx) => {
      const srcObj = images[idx];
      if (srcObj) {
        const img = new window.Image();
        img.src = typeof srcObj === "string" ? srcObj : (srcObj as any).src || (srcObj as any).default?.src || "";
      }
    });
  }, [currentIndex, isOpen, images]);

  if (!isOpen) return null;

  // 🔥 核心修复 3：放宽判断界限。只要 images 数组有长度，说明这不是一个“空文件夹”
  // 绝对不能因为一瞬间没拿到 currentImage 就判死刑显示“敬请期待”
  const isFolderEmpty = !images || images.length === 0;
  
  // 安全地提取当前图片源
  const currentImage = images && images[currentIndex] ? images[currentIndex] : null;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFolderEmpty) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFolderEmpty) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      {/* 关闭按钮 */}
      <button 
        className="absolute top-4 right-4 text-white text-3xl font-bold z-50 p-4 hover:text-gray-300"
        onClick={onClose}
      >
        ×
      </button>

      {/* 如果文件夹不为空，则进入图片展示逻辑 */}
      {!isFolderEmpty ? (
        <div className="relative w-full max-w-[800px] h-[80vh] flex items-center justify-center p-4">
          {/* 左侧切换按钮 */}
          {images.length > 1 && (
            <button 
              className="absolute left-2 md:left-4 text-white text-4xl p-4 bg-black/30 rounded-full hover:bg-black/50 z-20"
              onClick={handlePrev}
            >
              ‹
            </button>
          )}

          {/* 当前照片容器 */}
          <div 
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} // 点击图片时不会触发关闭
          >
            {/* 🔥 核心修复 4：只有就绪且拿到了有效的 currentImage 才会渲染 Next.js Image，否则显示局部骨架屏，绝不跳到提示字样分支 */}
            {isReady && currentImage ? (
              <Image
                src={currentImage}
                alt={`Gallery Image ${currentIndex + 1}`}
                className="w-auto h-auto max-w-full max-h-full object-contain animate-fadeIn"
                quality={100}
                priority // 提升当前展示图片的优先级
                {...(typeof currentImage === 'string' ? { fill: true } : {})}
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-8 h-8 border-4 border-t-transparent border-white/80 rounded-full animate-spin" />
                <span className="text-white/60 text-xs tracking-wider">图片加载中...</span>
              </div>
            )}
          </div>

          {/* 右侧切换按钮 */}
          {images.length > 1 && (
            <button 
              className="absolute right-2 md:right-4 text-white text-4xl p-4 bg-black/30 rounded-full hover:bg-black/50 z-20"
              onClick={handleNext}
            >
              ›
            </button>
          )}

          {/* 底部分页点 */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
              {images.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                    idx === currentIndex ? 'bg-white' : 'bg-white/40'
                  }`} 
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* 只有当配置里这个数组彻底为空 0 时，才显示敬请期待 */
        <div className="text-white text-xl font-bold tracking-widest p-4 text-center">
          <p>更多精彩，敬请期待</p>
          <p className="text-sm font-normal mt-2 text-white/60">（该文件夹尚未添加图片）</p>
        </div>
      )}
    </div>
  );
};