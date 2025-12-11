'use client';

import dynamic from 'next/dynamic';

const Badge3DModel = dynamic(() => import('@/components/Badge3D'), { 
  ssr: false,
  loading: () => <div className="animate-pulse text-purple-400">Loading Metadata...</div>
});

export default function SouvenirPage() {
  return (
    // 1. 外层容器：全屏黑色背景，禁止溢出
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden flex flex-col justify-between">
      
      {/* --- 背景层：3D 画布 (Z-Index: 0) --- */}
      {/* 绝对定位撑满全屏 */}
      <div className="absolute inset-0 z-0">
        <Badge3DModel 
          frontImg="/badges/laogou.png"
          backImg="/badges/laogou-back.png"
          svgPath="/badges/laogou-shape.svg"
          scale={1.2} // 全屏可以稍微放大一点
        />
      </div>

      {/* --- 前景层：UI 内容 (Z-Index: 10) --- */}
      {/* pointer-events-none 是关键！让鼠标能穿透文字去拖拽后面的 3D 模型 */}
      
      {/* 顶部导航区 */}
      <div className="relative z-10 w-full p-8 flex justify-between items-start pointer-events-none">
        <div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight drop-shadow-2xl">
            123<br/>STUDIO
          </h1>
          <div className="mt-2 inline-block px-3 py-1 border border-purple-500/30 rounded-full bg-purple-900/20 backdrop-blur-md">
            <span className="text-xs font-mono text-purple-300 tracking-widest">GENESIS COLLECTION</span>
          </div>
        </div>
        
        {/* 右上角装饰 */}
        <div className="hidden md:block text-right">
          <p className="text-xs font-mono text-gray-500">
            BLOCK: #882192<br/>
            MINTED: 2025
          </p>
        </div>
      </div>

      {/* 底部信息区 */}
      <div className="relative z-10 w-full p-8 flex justify-between items-end pointer-events-none">
        
        {/* 名字介绍 */}
        <div className="bg-black/30 backdrop-blur-xl border border-white/10 p-6 rounded-2xl max-w-sm pointer-events-auto"> 
          {/* pointer-events-auto 让这块区域可以被点击 */}
          <h2 className="text-2xl font-bold text-white mb-1">
            小课代表 <span className="text-sm font-normal text-gray-400 ml-2">/ Laogou</span>
          </h2>
          <p className="text-sm text-gray-400 font-mono leading-relaxed">
            Core Member badge. Access to exclusive workshops and events.
            <br/>
            <span className="text-purple-400 mt-2 block">● Verified Owner</span>
          </p>
        </div>

        {/* 右下角操作提示 */}
        <div className="text-right">
           <p className="text-xs font-mono text-gray-600 animate-pulse mb-2">
             INTERACTIVE 3D ASSET
           </p>
           {/* 一个假的 Web3 按钮 */}
           <button className="pointer-events-auto bg-white text-black font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform">
             Connect Wallet
           </button>
        </div>
      </div>

      {/* 背景装饰：加一点噪点或光晕 (可选) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

    </div>
  );
}