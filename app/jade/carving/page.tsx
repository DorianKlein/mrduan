'use client';

// 引入我们刚才说的那个临时的白模场景
// 假设你把之前那个 GameScene 放到了 components/jade-carving/GameScene.tsx
// import dynamic from 'next/dynamic';

// const GameScene = dynamic(() => import('@/components/jade-carving/GameScene'), {
//   ssr: false,
//   loading: () => (
//     <div className="w-full h-screen bg-black text-emerald-500 flex items-center justify-center font-mono animate-pulse">
//       初始化雕刻工坊...
//     </div>
//   ),
// });

// export default function CarvingPage() {
//   return (
//     <main className="w-full h-screen bg-black">
//       {/* 返回按钮 */}
//       <a href="/jade" className="absolute top-5 left-5 z-50 text-white/50 hover:text-white text-sm border border-white/20 px-3 py-1 rounded-full">
//         ← Back to Menu
//       </a>
      
//       <GameScene />
//     </main>
//   );
// }