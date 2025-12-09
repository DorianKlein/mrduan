'use client'; // 确保页面本身也是 Client Component

// 1. 引入 dynamic
import dynamic from 'next/dynamic';

// 2. 动态引入 Badge3D，并强制关闭 SSR (服务器端渲染)
const Badge3DModel = dynamic(() => import('@/components/Badge3D'), { 
  ssr: false,
  // 可选：加个加载中的占位符，防止闪烁
  loading: () => <div className="w-full h-full flex items-center justify-center text-white/50">Loading 3D Model...</div>
});


export default function SouvenirPage() {
  return (
    // 修改这里：把原来的 bg-gray-100 改成黑紫色渐变
    // bg-gradient-to-b 从上到下渐变
    // from-purple-900 to-black 从深紫色渐变到黑色
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black flex flex-col items-center justify-center p-8">
      
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
          123 STUDIO
        </h1>
        <p className="text-gray-300 font-mono">
          Limited Edition Souvenir / 2025
        </p>
      </div>
      
      {/* 3D 徽章展示容器，去掉白底和阴影，让它融入背景 */}
      <div className="w-full h-[50vh] md:h-[500px] md:aspect-square relative touch-none"
            style={{ touchAction: 'none' }}>
        <Badge3DModel 
          // 我们只需要正面图
          frontImg="/badges/laogou.png"
          backImg="/badges/laogou-back.png"
          scale={1}
        />
      </div>
      
      <p className="mt-6 text-sm text-gray-400 font-mono animate-pulse">
        ● 小课代表
      </p>

    </div>
  );
}