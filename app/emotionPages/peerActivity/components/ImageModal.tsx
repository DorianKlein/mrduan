"use client";

import React, { useState } from "react";
import Image, { StaticImageData } from "next/image";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: (StaticImageData | string)[];
}

export const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen) return null;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const hasImages = images && images.length > 0;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      {/* 关按钮 */}
      <button 
        className="absolute top-4 right-4 text-white text-3xl font-bold z-50 p-4 hover:text-gray-300"
        onClick={onClose}
      >
        ×
      </button>

      {hasImages ? (
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

          {/* 当期照片 */}
          <div 
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} // 点击图片时不会触发关闭
          >
            <Image
              src={images[currentIndex]}
              alt={`Gallery Image ${currentIndex + 1}`}
              className="w-auto h-auto max-w-full max-h-full object-contain"
              quality={100}
              // 由于可能是 string 或 StaticImport，强制类型转换
              {...(typeof images[currentIndex] === 'string' ? { fill: true } : {})}
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
                  className={`w-2 h-2 rounded-full ${idx === currentIndex ? 'bg-white' : 'bg-white/40'}`} 
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