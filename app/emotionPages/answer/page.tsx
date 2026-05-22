'use client';

import React, { useState } from 'react';
import GachaMachine from './components/GachaMachine';
import GachaModal from './components/GachaModal';
import OpeningSplash from './components/OpeningSplash';
import { answers } from './answersConfig';

export default function AnswerPage() {
  const [showSplash, setShowSplash] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [capsuleColor, setCapsuleColor] = useState('#FBBF24');
  const [resultText, setResultText] = useState('');

  const handleDispense = (color: string) => {
    setCapsuleColor(color);
    
    // 从配置文件中随机提取文本
    const randomText = answers[Math.floor(Math.random() * answers.length)];
    setResultText(randomText);
    
    // 打开弹窗
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#fdf6e3] flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* 开屏动画 */}
      {showSplash && <OpeningSplash onComplete={() => setShowSplash(false)} />}

      {/* 标题区域 */}
      <div className="flex flex-col items-center mb-10 z-20 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-widest mb-3">
          答案扭蛋机
        </h1>
        <p className="text-gray-500 tracking-wider text-sm md:text-base opacity-80">
          — 请在心中默念你的问题 —
        </p>
      </div>
      
      {/* 扭蛋机组件 */}
      <GachaMachine onDispense={handleDispense} />

      {/* 扭蛋被打开的弹窗组件 */}
      <GachaModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        capsuleColor={capsuleColor}
        text={resultText}
      />
    </div>
  );
}