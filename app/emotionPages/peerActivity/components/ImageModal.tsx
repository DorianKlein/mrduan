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

  // 🔥 核心修复 1：每次弹窗打开，或者切换不同的图组(images)时，必须把索引重置为 0
  useEffect(() => {
    // 增加 typeof window === "undefined" 判断，确保这行代码在 Vercel 打包阶段直接跳过，不报未定义错误
    if (!isOpen || !images || images.length <= 1 || typeof window === "undefined") return;

    const nextIdx = (currentIndex + 1) % images.length;
    const prevIdx = (currentIndex - 1 + images.length) % images.length;

    [nextIdx, prevIdx].forEach((idx) => {
      const srcObj = images[idx];
      if (srcObj) {
        // 安全创建 Image 对象
        // 引入原生 Image 对象，避开 Next.js 的 Image 组件命名冲突
        const img = new window.Image();
        img.src = typeof srcObj === "string" ? srcObj : (srcObj as any).src || (srcObj as any).default?.src || "";
      }
    });
  }, [currentIndex, isOpen, images]);

  if (!isOpen) return null;

  // 严格的防空验证
  const hasImages = images && images.length > 0;
  
  // 🔥 核心修复 2：获取当前安全的图片对象，如果索引越界或不存在，直接安全兜底为 null
  const currentImage = hasImages && images[currentIndex] ? images[currentIndex] : null;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasImages) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasImages) return;
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

      {/* 🔥 核心修复 3：不仅要数组有长度，还要确保当前取到的图片对象不为 null，双重保险 */}
      {hasImages && currentImage ? (
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
            <Image
              src={currentImage} // 使用安全提取的图片源
              alt={`Gallery Image ${currentIndex + 1}`}
              className="w-auto h-auto max-w-full max-h-full object-contain animate-fadeIn"
              quality={100}
              priority
              // 由于可能是 string 或 StaticImport，安全地转换类型
              {...(typeof currentImage === 'string' ? { fill: true } : {})}
            />
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
        <div className="text-white text-xl font-bold tracking-widest p-4 text-center">
          <p>更多精彩，敬请期待</p>
          <p className="text-sm font-normal mt-2 text-white/60">（该文件夹尚未添加图片）</p>
        </div>
      )}
    </div>
  );
};