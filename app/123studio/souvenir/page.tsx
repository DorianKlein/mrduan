// app/123studio/souvenir/page.tsx
import Badge3D from '@/components/Badge3D';

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
      <div className="w-full max-w-[500px] aspect-square">
        <Badge3D 
          // 我们只需要正面图
          frontImg="/badges/紫悦.png"
          backImg="/badges/紫悦（背）.png"
        />
      </div>
      
      <p className="mt-6 text-sm text-gray-400 font-mono animate-pulse">
        ● Drag to Rotate (Horizontally Only)
      </p>

    </div>
  );
}