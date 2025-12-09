// app/badges/page.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';

// 1. 定义成员数据 (在这里填入你工作室真实的成员信息)
const members = [
  { id: 1, name: 'Alex', role: 'Founder', frontImg: '/badges/alex.png' },
  { id: 2, name: 'Kevin', role: '3D Artist', frontImg: '/badges/kevin.png' },
  { id: 3, name: 'Purple', role: 'Designer', frontImg: '/badges/purple.png' },
  { id: 4, name: 'Wangzai', role: 'Dev', frontImg: '/badges/wangzai.png' },
  // ... 把剩下的成员都补在这里
];

export default function BadgesPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] py-20 px-4">
      
      {/* 页面标题区 */}
      <div className="max-w-6xl mx-auto mb-16 text-center">
        <h1 className="text-5xl font-black mb-4 tracking-tighter">
          123 STUDIO
        </h1>
        <p className="text-gray-500 text-lg font-mono">
          Meet our amazing team / 2025
        </p>
      </div>

      {/* 徽章网格展示区 */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {members.map((member) => (
          <BadgeCard key={member.id} member={member} />
        ))}
      </div>

    </div>
  );
}

// 2. 单个徽章组件 (核心交互逻辑)
function BadgeCard({ member }: { member: any }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="group relative w-full aspect-square cursor-pointer perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
      onMouseEnter={() => setIsFlipped(true)} // 鼠标移入翻转
      onMouseLeave={() => setIsFlipped(false)} // 鼠标移出复原
    >
      <div className={`relative w-full h-full duration-500 transform-style-3d transition-all ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        {/* === 正面 (Front) === */}
        <div className="absolute w-full h-full backface-hidden">
          {/* 模拟 CNC 亚克力的厚度和阴影 */}
          <div className="w-full h-full bg-white rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center p-4 overflow-hidden">
            {/* 头像 */}
            <div className="relative w-32 h-32 mb-2">
               {/* 这里用简单的 div 占位，实际使用时请取消 Image 组件的注释并替换 src */}
               {/* <Image src={member.frontImg} alt={member.name} fill className="object-contain" /> */}
               <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-4xl">😎</div>
            </div>
            {/* 名字 */}
            <h3 className="text-xl font-bold uppercase tracking-wide">{member.name}</h3>
            <span className="text-xs text-gray-400 font-mono">{member.role}</span>
          </div>
        </div>

        {/* === 背面 (Back) === */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180">
          <div className="w-full h-full bg-black rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] flex flex-col items-center justify-center p-4 text-white">
            {/* 背面内容：Logo + 签名 */}
            <div className="text-center">
              <div className="text-2xl font-black mb-2" style={{ fontFamily: 'Impact, sans-serif' }}>
                123<br/>STUDIO
              </div>
              <div className="w-16 h-1 bg-white mx-auto my-3 opacity-50"></div>
              {/* 模拟手写签名 */}
              <div className="text-3xl font-script text-yellow-400 transform -rotate-6">
                {member.name}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}