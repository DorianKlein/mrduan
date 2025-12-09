'use client';

import * as THREE from 'three';
import { useMemo } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, Center, Float } from '@react-three/drei';

interface BadgeProps {
  frontImg: string;
  backImg: string;
  scale?: number;
}

// 简化的模型组件，只负责显示一张图
function BadgeModel({ frontImg, backImg, scale = 1 }: BadgeProps) {
  // 1. 加载正面图
  const frontTextureRaw = useLoader(THREE.TextureLoader, frontImg,);
  
  // 2. 处理纹理：修正颜色和方向
  const frontTexture = useMemo(() => {
    const t = frontTextureRaw.clone();
    t.colorSpace = THREE.SRGBColorSpace; // 保证颜色鲜艳
    
    // 关键：翻转纹理的 Y 轴，解决图片倒立的问题
    t.center.set(0.5, 0.5); // 设置旋转/翻转中心点为图片中心
    t.repeat.set(1, 1);
    
    t.needsUpdate = true;
    return t;
  }, [frontTextureRaw]);

  const backTextureRaw = useLoader(THREE.TextureLoader, backImg);

  const backTexture = useMemo(() => {
    const t = backTextureRaw.clone();
    t.colorSpace = THREE.SRGBColorSpace; // 保证颜色鲜艳

    // 关键：翻转纹理的 Y 轴，解决图片倒立的问题
    t.center.set(0.5, 0.5);
    t.repeat.set(1, 1);
    t.needsUpdate = true;
    return t;

  }, [backTextureRaw]);

  return (
    // 应用整体缩放
    <group scale={[scale, scale, scale]}>
      {/* 创建一个简单的平面 */}
      <mesh>
        {/* 平面几何体 args={[宽, 高]}
          这里我们暂时给一个固定值，比如 10x10。
          如果你的图片不是正方形，它会被拉伸。
          (后续我们可以根据图片实际比例来自动调整这个值)
        */}
        <planeGeometry args={[10, 10]} />
        
        {/* 基础材质，不受光照影响，保证图片原色显示
          transparent: 开启透明支持（因为是 PNG）
          side: DoubleSide 让背面也能看到（虽然我们限制了角度，但以防万一）
        */}
        <meshBasicMaterial 
          map={frontTexture} 
          transparent 
          side={THREE.FrontSide} 
          toneMapped={false} 
        />
      </mesh>

      <mesh position={[0, 0, -0.1]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshBasicMaterial 
          map={backTexture} 
          transparent 
          side={THREE.FrontSide} // 同样只渲染它的“正面”（也就是现在的背面）
          toneMapped={false} 
        />
      </mesh>
    </group>
  );
}

export default function Badge3D(props: BadgeProps) {
  return (
    <div className="w-full h-full relative">
      {/* fov 改小一点，让视角更聚焦 */}
      <Canvas camera={{ position: [0, 0, 20], fov: 35 }} dpr={[1, 2]}>
        
        {/* 环境光可以先留着，虽然 meshBasicMaterial 不受它影响 */}
        <Environment preset="studio" />
        
        {/* 🔥 核心修改：限制旋转角度 */}
        <OrbitControls 
          makeDefault 
          enablePan={false} // 禁止平移
          enableZoom={true} // 允许缩放
          
          // minPolarAngle 和 maxPolarAngle 控制垂直方向的旋转角度（弧度制）
          // 0 是头顶正上方，Math.PI (约3.14) 是脚底下正下方。
          // Math.PI / 2 (约1.57) 刚好是水平视线（赤道）。
          // 我们把最小值和最大值都设为 Math.PI / 2，就锁死在了水平面上。
          minPolarAngle={Math.PI / 2} 
          maxPolarAngle={Math.PI / 2}
        />
        
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <Center>
            <BadgeModel {...props} />
          </Center>
        </Float>
      </Canvas>
    </div>
  );
}