'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useHandTracking } from '@/components/jade/shared/useHandTracking'; // 假设你放这了
import { useRef, useState } from 'react';
import * as THREE from 'three';

// 一个临时的“石头”组件
function MockStone({ handData }: { handData: any }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hp, setHp] = useState(100); // 假石头的血量
  const [color, setColor] = useState('gray'); // 受击变色

  useFrame(() => {
    if (!meshRef.current) return;

    // 逻辑：如果检测到挥砍动作 (isChopping) 且距离够近 (这里简化为只要砍了就掉血)
    if (handData.isChopping) {
      // 简单的防抖，防止一帧扣太多血
      if (meshRef.current.material.color.getHexString() !== 'ff0000') {
        console.log("砍到了！当前速度:", handData.velocity);
        setHp((prev) => prev - 5);
        setColor('red'); // 视觉反馈：变红
        
        // 简单的震动效果
        meshRef.current.position.x = (Math.random() - 0.5) * 0.2;
      }
    } else {
      // 恢复颜色和位置
      setColor(hp <= 0 ? 'green' : 'gray'); // 血没了变绿(代表切开了)
      meshRef.current.position.x = 0;
    }
    
    // 颜色插值
    meshRef.current.material.color.lerp(new THREE.Color(color), 0.1);
  });

  // 如果血量归零，就把方块变小，假装里面露出了东西
  const scale = hp <= 0 ? 0.5 : 1;

  return (
    <mesh ref={meshRef} scale={[scale, scale, scale]}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export default function GameScene() {
  const { cameraStream, ...handData } = useHandTracking();

  return (
    <div className="h-full w-full">
      {/* 这里可以复用你的 CameraPreview */}
      
      <div className="absolute top-10 left-10 text-white z-10">
        <h1>雕刻模式开发中</h1>
        <p>挥砍力度: {handData.velocity?.toFixed(4)}</p>
        <p>状态: {handData.isChopping ? "🔥 正在挥砍" : "..."}</p>
      </div>

      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        {/* 把手势数据传给 3D 物体 */}
        <MockStone handData={handData} />
        
        <OrbitControls />
      </Canvas>
    </div>
  );
}