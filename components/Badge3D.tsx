'use client';

import * as THREE from 'three';
import { useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { OrbitControls, Environment, Center, Float } from '@react-three/drei';

// 强制清理 THREE 缓存，防止 Context Lost
THREE.Cache.enabled = true;

interface BadgeProps {
  frontImg: string;
  backImg: string;
  scale?: number;
}

function BadgeModel({ frontImg, backImg, scale = 1 }: BadgeProps) {
  // ✅ 1. 使用 useTexture (比 useLoader 更稳定)
  // useTexture 内部自带 Suspense 缓存管理
  const [frontTextureRaw, backTextureRaw] = useTexture([frontImg, backImg]);

  // ✅ 2. 使用 useMemo 克隆并配置，防止修改原图导致报错
  const frontTexture = useMemo(() => {
    const t = frontTextureRaw.clone();
    t.colorSpace = THREE.SRGBColorSpace;
    t.center.set(0.5, 0.5);
    t.repeat.set(1, 1);
    t.needsUpdate = true;
    return t;
  }, [frontTextureRaw]);

  const backTexture = useMemo(() => {
    const t = backTextureRaw.clone();
    t.colorSpace = THREE.SRGBColorSpace;
    t.center.set(0.5, 0.5);
    t.repeat.set(1, 1);
    t.needsUpdate = true;
    return t;
  }, [backTextureRaw]);

  // ✅ 3. 必须：手动销毁克隆的纹理
  useEffect(() => {
    return () => {
      frontTexture.dispose();
      backTexture.dispose();
    };
  }, [frontTexture, backTexture]);

  return (
    <group scale={[scale, scale, scale]}>
      {/* 正面 */}
      <mesh>
        <planeGeometry args={[10, 10]} />
        <meshBasicMaterial map={frontTexture} transparent side={THREE.FrontSide} toneMapped={false} />
      </mesh>

      {/* 背面 */}
      <mesh rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshBasicMaterial map={backTexture} transparent side={THREE.FrontSide} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function Badge3D(props: BadgeProps) {
  return (
    <div className="w-full h-full relative"
          style={{ touchAction: 'none' }}>
      {/* fov 改小一点，让视角更聚焦 */}
      <Canvas camera={{ position: [0, 0, 25], fov: 35 }} dpr={1}>
        
        
        <Environment files="/studio.hdr" />
        
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