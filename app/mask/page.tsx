'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage } from '@react-three/drei';
import { useState, Suspense } from 'react';
import { Play, Pause, Menu, X } from 'lucide-react';
import Image from 'next/image';

// 面具数据配置
const masks = [
  {
    id: 'dragon',
    name: '【龙】十二生肖 湘西木质傩面',
    modelPath: '/mask/dragon/dragon_mask.glb',
    imagePath: '/mask/dragon/Nuo_Mask_dragon.jpeg',
  },
  {
    id: 'father',
    name: '湘西木质傩公面具',
    modelPath: '/mask/father/father_mask.glb',
    imagePath: '/mask/father/Nuo_Father_Mask.png',
  },
  {
    id: 'judge',
    name: '【判官】泡桐木质傩面具',
    modelPath: '/mask/judge/judge_mask.glb',
    imagePath: '/mask/judge/Judge_Nuo_Mask.jpg',
  },
  {
    id: 'mother',
    name: '湘西木质傩母面具',
    modelPath: '/mask/mother/mother_mask.glb',
    imagePath: '/mask/mother/Nuo_Mother_Mask.png',
  },
  {
    id: 'rabbit',
    name: '【兔】十二生肖 湘西木质傩面',
    modelPath: '/mask/rabbit/rabbitmask.glb',
    imagePath: '/mask/rabbit/Nuo_Mask_Rabbit.jpeg',
  },
];

// 面具模型组件
function MaskModel({ modelPath }: { modelPath: string }) {
  const { scene } = useGLTF(modelPath);
  
  return (
    <primitive 
      object={scene} 
      scale={2}
    />
  );
}

// 加载提示组件
function LoadingPlaceholder() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#8b4513" wireframe />
    </mesh>
  );
}

export default function MaskPage() {
  const [autoRotate, setAutoRotate] = useState(true);
  const [currentMaskIndex, setCurrentMaskIndex] = useState(0);
  const [showMaskButtons, setShowMaskButtons] = useState(true);
  
  const currentMask = masks[currentMaskIndex];

  return (
    <div className="w-full h-screen bg-gradient-to-b from-gray-900 to-black relative">
      {/* 右上角自动旋转控制按钮 */}
      <button
        onClick={() => setAutoRotate(!autoRotate)}
        className="absolute top-6 right-6 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-3 transition-all duration-300 group"
        title={autoRotate ? "暂停旋转" : "开始旋转"}
      >
        {autoRotate ? (
          <Pause className="w-6 h-6 text-white" />
        ) : (
          <Play className="w-6 h-6 text-white" />
        )}
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-black/80 text-white text-sm px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {autoRotate ? "暂停旋转" : "开始旋转"}
        </span>
      </button>

      {/* 标题 */}
      <div className="absolute top-4 left-2 right-6 md:top-6 z-10">
        <h1 className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg leading-tight">
          {currentMask.name}
        </h1>
        <p className="text-white/70 mt-1 md:mt-2 text-[10px] sm:text-xs md:text-sm">
          
        </p>
      </div>

      {/* 面具切换按钮 - 标题下方左侧 */}
      <div className="absolute left-6 top-24 sm:top-28 md:top-32 z-10 flex items-center gap-2 md:gap-4">
        {/* 展开/收起按钮 */}
        <button
          onClick={() => setShowMaskButtons(!showMaskButtons)}
          className="w-[35px] h-[35px] md:w-[50px] md:h-[50px] rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-all duration-300 hover:scale-110 flex-shrink-0"
          title={showMaskButtons ? "收起菜单" : "展开菜单"}
        >
          {showMaskButtons ? (
            <X className="w-4 h-4 md:w-6 md:h-6 text-white" />
          ) : (
            <Menu className="w-4 h-4 md:w-6 md:h-6 text-white" />
          )}
        </button>

        {/* 面具选择按钮列表 - 横向排列 */}
        {showMaskButtons && (
          <div className="flex gap-2 md:gap-4 animate-in fade-in slide-in-from-left duration-300">
            {masks.map((mask, index) => (
              <button
                key={mask.id}
                onClick={() => setCurrentMaskIndex(index)}
                className={`relative overflow-hidden rounded-full w-[40px] h-[40px] md:w-[70px] md:h-[70px] flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                  currentMaskIndex === index
                    ? 'ring-2 md:ring-4 ring-amber-500 scale-110 shadow-lg shadow-amber-500/50'
                    : 'ring-1 md:ring-2 ring-white/30 hover:ring-white/60 hover:scale-105'
                }`}
                title={mask.name}
              >
                <Image
                  src={mask.imagePath}
                  alt={mask.name}
                  width={70}
                  height={70}
                  className="object-cover w-full h-full rounded-full"
                />
                {currentMaskIndex === index && (
                  <div className="absolute inset-0 bg-amber-500/20 rounded-full" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3D 场景 */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        className="w-full h-full"
      >
        <Suspense fallback={<LoadingPlaceholder />}>
          {/* 环境光 - 提供基础照明 */}
          <ambientLight intensity={0.5} />
          
          {/* 主光源 - 从右前方照射 */}
          <directionalLight 
            position={[5, 5, 5]} 
            intensity={1.5}
            castShadow
          />
          
          {/* 补光 - 从左侧照射，减少阴影 */}
          <directionalLight 
            position={[-5, 3, -5]} 
            intensity={0.8}
          />
          
          {/* 顶光 - 增强立体感 */}
          <pointLight 
            position={[0, 5, 0]} 
            intensity={0.5}
            distance={10}
          />
          
          {/* 舞台灯光 */}
          <Stage
            intensity={1}
            environment="city"
            shadows={{
              type: 'accumulative',
              bias: -0.001,
              intensity: Math.PI,
            }}
            adjustCamera={false}
          >
            <MaskModel modelPath={currentMask.modelPath} />
          </Stage>

          {/* 轨道控制器 - 支持手动旋转和缩放 */}
          <OrbitControls
            autoRotate={autoRotate}
            autoRotateSpeed={2}
            enableZoom={true}
            enablePan={false}
            minDistance={2}
            maxDistance={10}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

// 预加载所有模型
masks.forEach(mask => {
  useGLTF.preload(mask.modelPath);
});
