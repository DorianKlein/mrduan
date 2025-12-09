'use client';

import * as THREE from 'three';
import { useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useTexture, OrbitControls, Environment, Center, Float } from '@react-three/drei';

// ❌ 删除这行，不要手动开启缓存！让它保持默认。
// THREE.Cache.enabled = true; 

interface BadgeProps {
  frontImg: string;
  backImg: string;
  scale?: number;
}

function BadgeModel({ frontImg, backImg, scale = 1 }: BadgeProps) {
  // 1. 加载纹理
  const [frontTextureRaw, backTextureRaw] = useTexture([frontImg, backImg]);

  // 2. 克隆纹理 (防止修改原图)
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

  // ✅ 3. 强力清理：组件卸载时彻底销毁
  useEffect(() => {
    return () => {
      // 销毁克隆体
      frontTexture.dispose();
      backTexture.dispose();
    };
  }, [frontTexture, backTexture]);

  return (
    <group scale={[scale, scale, scale]}>
      {/* 正面 */}
      <mesh>
        <planeGeometry args={[10, 10]} />
        <meshBasicMaterial 
          map={frontTexture} 
          transparent 
          side={THREE.FrontSide} 
          toneMapped={false} 
        />
      </mesh>

      {/* 背面 */}
      <mesh rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshBasicMaterial 
          map={backTexture} 
          transparent 
          side={THREE.FrontSide} 
          toneMapped={false} 
        />
      </mesh>
    </group>
  );
}

export default function Badge3D(props: BadgeProps) {
  return (
    // 加上 touch-action: none 防止手机滚动冲突
    <div className="w-full h-full relative" style={{ touchAction: 'none' }}>
      <Canvas 
        camera={{ position: [0, 0, 20], fov: 35 }} 
        dpr={1} // 保持 1倍分辨率，防止显存爆炸
        // 强制 Canvas 元素也禁止触摸滚动
        style={{ width: '100%', height: '100%', touchAction: 'none' }}
        // 关键：当 WebGL 上下文丢失时，尝试自动恢复
        gl={{ preserveDrawingBuffer: true, powerPreference: 'high-performance' }}
      >
        <Environment files="/studio.hdr" />
        
        <OrbitControls 
          makeDefault 
          enablePan={false} 
          enableZoom={true} 
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