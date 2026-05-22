'use client';

import React, { useEffect, useState } from 'react';

interface OpeningSplashProps {
  onComplete: () => void;
}

export default function OpeningSplash({ onComplete }: OpeningSplashProps) {
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    // 短暂亦停后触发打开
    const openTimer = setTimeout(() => {
      setIsOpening(true);
    }, 400);

    // 动画结束后销毁组件
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 1400); // 400ms停留 + 1000ms动画

    return () => {
      clearTimeout(openTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
      
      {/* 屏幕右上半部分 (模拟扭蛋上半红色) */}
      <div 
        className="absolute inset-0 bg-[#F87171] transition-transform duration-1000 ease-in-out"
        style={{
          clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
          transform: isOpening ? 'translate(100%, -100%)' : 'translate(0, 0)'
        }}
      />
      
      {/* 屏幕左下半部分 (模拟扭蛋下半白色) */}
      <div 
        className="absolute inset-0 bg-white transition-transform duration-1000 ease-in-out"
        style={{
          clipPath: 'polygon(0 0, 100% 100%, 0 100%)',
          transform: isOpening ? 'translate(-100%, 100%)' : 'translate(0, 0)'
        }}
      />

    </div>
  );
}