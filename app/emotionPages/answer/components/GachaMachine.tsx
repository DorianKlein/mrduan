'use client';

import React, { useState } from 'react';

interface GachaMachineProps {
  onDispense?: (color: string) => void;
}

export default function GachaMachine({ onDispense }: GachaMachineProps) {
  // 控制旋钮旋转的角度
  const [rotation, setRotation] = useState(0);
  const [dispensing, setDispensing] = useState(false);
  const [dispensedCapsules, setDispensedCapsules] = useState<{ id: number, color: string }[]>([]);

  // 扭蛋可能出现的颜色
  const colors = ["#FBBF24", "#60A5FA", "#34D399", "#A78BFA", "#F87171", "#2DD4BF", "#F472B6"];

  // 点击旋钮时触发旋转
  const handleTwist = () => {
    if (dispensing) return; // 正在掉落过程中防止重复点击
    setDispensing(true);
    setRotation((prev) => prev + 360); // 每次点击顺时针旋转一圈
    
    // 生成一个新扭蛋
    const color = colors[Math.floor(Math.random() * colors.length)];
    const id = Date.now();
    
    // 延迟出蛋，为了匹配扭蛋旋钮的转动(转完一小半后蛋出来)
    setTimeout(() => {
      setDispensedCapsules((prev) => [...prev, { id, color }]);
    }, 400);

    // 动画结束后释放锁定，并通知外部结果弹窗
    setTimeout(() => {
      setDispensing(false);
      if (onDispense) {
        onDispense(color);
      }
    }, 1500); // 1.5s 正好匹配扭蛋掉落完的停留动画结束时间
  };

  return (
    <div className="relative w-[90vw] max-w-[400px] aspect-[3/4] z-10">
      <svg
        viewBox="0 0 300 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-2xl"
      >
        <style>
          {`
            @keyframes rollOut {
              0% {
                transform: translateY(-20px) scale(0.8) rotate(0deg);
                opacity: 0;
              }
              20% {
                transform: translateY(0px) scale(1) rotate(30deg);
                opacity: 1;
              }
              40% {
                transform: translate(15px, 35px) scale(1) rotate(60deg);
                opacity: 1;
              }
              60% {
                transform: translate(30px, 25px) scale(1) rotate(90deg);
                opacity: 1;
              }
              80% {
                transform: translate(40px, 35px) scale(1) rotate(110deg);
                opacity: 1;
              }
              100% {
                transform: translate(45px, 35px) scale(1) rotate(120deg);
                opacity: 1;
              }
            }
            @keyframes bounceUpDown {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(5px); }
            }
          `}
        </style>
        /* --- 机器底座 --- */
        /* 主体 */
        <path d="M50 200 H250 V380 Q250 395 235 395 H65 Q50 395 50 380 Z" fill="#F87171" />
        /* 底部阴影 */
        <path d="M50 370 H250 V380 Q250 395 235 395 H65 Q50 395 50 380 Z" fill="#DC2626" />

        {/* --- 机器玻璃罩 --- */}
        {/* 透明半球 */}
        <path d="M50 200 Q50 20 150 20 Q250 20 250 200 Z" fill="rgba(255, 255, 255, 0.65)" stroke="#E5E7EB" strokeWidth="4" />

        {/* 底座装饰带 */}
        <rect x="40" y="195" width="220" height="20" rx="10" fill="#B91C1C" />
        
        {/* --- 扭蛋出口 --- */}
        <circle cx="150" cy="340" r="32" fill="#1F2937" />

        {/* 掉落出来的扭蛋组 */}
        {dispensedCapsules.map((capsule) => (
          <g 
            key={capsule.id}
            style={{ 
              animation: 'rollOut 1.5s forwards ease-in',
              transformOrigin: '150px 340px'
            }}
          >
            <circle cx="150" cy="340" r="24" fill={capsule.color} />
            {/* 扭蛋高光反光 */}
            <path d="M136 332 Q150 326 164 332" stroke="rgba(255,255,255,0.6)" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
        ))}

        {/* 扭蛋出口上层遮罩层 (让球看起来是从洞里滚出来) */}
        <path d="M118 340 A32 32 0 0 1 182 340 Z" fill="#374151" />
        <rect x="120" y="315" width="60" height="8" rx="4" fill="#6B7280" />

        {/* --- 扭蛋（玻璃罩内） --- */}
        <g className="capsules">
          <circle cx="100" cy="165" r="28" fill="#FBBF24" />
          <circle cx="160" cy="170" r="28" fill="#60A5FA" />
          <circle cx="210" cy="150" r="27" fill="#34D399" />
          <circle cx="125" cy="120" r="26" fill="#A78BFA" />
          <circle cx="180" cy="115" r="25" fill="#F87171" />
          <circle cx="95" cy="110" r="24" fill="#2DD4BF" />
          <circle cx="145" cy="70" r="23" fill="#F472B6" />
        </g>
        
        {/* --- 玻璃罩高光 --- */}
        <path d="M70 170 Q70 50 140 40" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="8" strokeLinecap="round" />

        {/* --- 扭蛋机旋钮底盘 --- */}
        <rect x="105" y="235" width="90" height="90" rx="45" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="2" />
        
        {/* --- 提示箭头和文字 --- */}
        <g style={{ animation: 'bounceUpDown 1.5s infinite ease-in-out' }}>
          {/* 提示文字 */}
          <rect x="110" y="200" width="80" height="24" rx="12" fill="white" fillOpacity="0.8" />
          <text x="150" y="216" fontSize="12" fill="#4B5563" textAnchor="middle" fontWeight="bold">
            点击扭动
          </text>
          {/* 指向下的箭头 */}
          <path d="M150 236 L145 228 L155 228 Z" fill="white" fillOpacity="0.8" />
        </g>

        {/* --- 扭转按钮 (单独控制旋转) --- */}
        <g 
          style={{ 
            transform: `rotate(${rotation}deg)`, 
            transformOrigin: '150px 280px', 
            transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' 
          }}
          onClick={handleTwist}
          className="cursor-pointer hover:opacity-90 active:scale-95"
        >
          {/* 旋钮外圈 */}
          <circle cx="150" cy="280" r="30" fill="#9CA3AF" />
          {/* 旋钮把手 */}
          <rect x="115" y="270" width="70" height="20" rx="10" fill="#4B5563" />
          {/* 旋钮把手装饰线 */}
          <rect x="120" y="275" width="60" height="10" rx="5" fill="#374151" />
          {/* 旋钮中心点 */}
          <circle cx="150" cy="280" r="14" fill="#D1D5DB" />
          <circle cx="150" cy="280" r="8" fill="#9CA3AF" />
        </g>
      </svg>
    </div>
  );
}