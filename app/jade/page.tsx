import Link from 'next/link';

export default function JadeMenu() {
  return (
    <main className="w-full h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl md:text-6xl font-serif mb-12 tracking-widest text-emerald-100">
        岫岩 · 交互
      </h1>
      
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
        {/* 卡片 1: 雕刻模式 (新) */}
        <Link 
          href="/jade/carving" 
          className="flex-1 group relative h-64 md:h-80 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all duration-500"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
          {/* 这里可以放一张静态图或者文字 */}
          <div className="absolute inset-0 flex flex-col justify-end p-8 z-20">
            <h2 className="text-2xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">
              琢玉 · Carving
            </h2>
            <p className="text-neutral-400 text-sm">
              挥刀开石，精雕细琢。<br/>体验从原石到艺术品的创作全过程。
            </p>
          </div>
        </Link>

        {/* 卡片 2: 粒子模式 (旧) */}
        <Link 
          href="/jade/vision" 
          className="flex-1 group relative h-64 md:h-80 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all duration-500"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 z-20">
            <h2 className="text-2xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">
              灵视 · Vision
            </h2>
            <p className="text-neutral-400 text-sm">
              捏合爆破，微观粒子。<br/>以手势掌控光影与聚合的视觉实验。
            </p>
          </div>
        </Link>
      </div>

      <div className="mt-12 text-neutral-600 text-xs font-mono">
        POWERED BY MEDIAPIPE & REACT THREE FIBER
      </div>
    </main>
  );
}