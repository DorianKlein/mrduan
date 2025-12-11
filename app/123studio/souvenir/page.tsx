'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const Badge3DModel = dynamic(() => import('@/components/Badge3D'), { 
  ssr: false,
  loading: () => <div className="animate-pulse text-purple-500 text-center mt-40">Loading Assets...</div>
});

export default function SouvenirPage() {
  // 控制 UI 显示的状态
  const [uiVisible, setUiVisible] = useState(false);

  return (
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden flex flex-col justify-between">
      
      {/* 3D 背景层 */}
      <div className="absolute inset-0 z-0">
        <Badge3DModel 
          frontImg="/badges/laogou.png"
          backImg="/badges/laogou-back.png"
          svgPath="/badges/laogou-shape.svg"
          scale={1.2}
          // 🔥 粒子动画结束后，触发这个回调
          onLoadComplete={() => setUiVisible(true)} 
        />
      </div>

      {/* UI 层：加上 transition-opacity 实现淡入 */}
      <div className={`relative z-10 w-full h-full flex flex-col justify-between p-8 pointer-events-none transition-opacity duration-1000 ${uiVisible ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* 顶部 Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl">
              123<br/>STUDIO
            </h1>
            <div className="mt-2 inline-block px-3 py-1 border border-purple-500/30 rounded-full bg-purple-900/20 backdrop-blur-md">
              <span className="text-xs font-mono text-purple-300 tracking-widest">GENESIS COLLECTION</span>
            </div>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-xs font-mono text-gray-500">BLOCK: #882192<br/>MINTED: 2025</p>
          </div>
        </div>

        {/* 底部 Info */}
        <div className="flex justify-between items-end">
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 p-6 rounded-2xl max-w-sm pointer-events-auto"> 
            <h2 className="text-2xl font-bold text-white mb-1">
              小课代表 <span className="text-sm font-normal text-gray-400 ml-2">/ Laogou</span>
            </h2>
            <p className="text-sm text-gray-400 font-mono leading-relaxed">
              Core Member badge. Access to exclusive workshops.<br/>
              <span className="text-purple-400 mt-2 block">● Verified Owner</span>
            </p>
          </div>
          <div className="text-right pointer-events-auto">
             <button className="bg-white text-black font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform">
               Connect Wallet
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}