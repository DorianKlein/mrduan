'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useHandTracking } from '@/components/jade/shared/useHandTracking';
import CameraPreview from '@/components/jade/shared/CameraPreview';

// 定义四个阶段
type GameStage = 
  | 'STAGE_1_PEELING'  
  | 'STAGE_2_CUTTING'  
  | 'STAGE_3_CARVING'  
  | 'STAGE_4_VIEWING'; 

function InteractiveStone({ 
  gesture, 
  velocity, 
  stage, 
  setStage,
  // 🔥 新增：接收手势的旋转和缩放数据
  rotationValue,
  zoomValue 
}: { 
  gesture: string, 
  velocity: number, 
  stage: GameStage, 
  setStage: (s: GameStage) => void,
  rotationValue: number,
  zoomValue: number
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [progress, setProgress] = useState(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    let progressIncrement = 0;

    // --- 阶段 1-3 逻辑保持不变 ---
    if (stage === 'STAGE_1_PEELING') {
      if (gesture === 'OPEN' && velocity > 0.001) {
        progressIncrement = 0.5;
        meshRef.current.rotation.y += 0.05; 
      }
    }
    else if (stage === 'STAGE_2_CUTTING') {
      if (gesture === 'FIST' && velocity > 0.003) {
        progressIncrement = 20.0;
        meshRef.current.position.x = (Math.random() - 0.5) * 0.2;
        meshRef.current.position.y = (Math.random() - 0.5) * 0.2;
      } else {
        meshRef.current.position.set(0, 0, 0);
      }
    }
    else if (stage === 'STAGE_3_CARVING') {
      if (gesture === 'POINT' && velocity > 0.002) {
        progressIncrement = 5.0;
        const s = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.01;
        meshRef.current.scale.setScalar(s);
      }
    }

    // --- 🔥 阶段 4: 鉴赏 (新增手势控制) ---
    else if (stage === 'STAGE_4_VIEWING') {
      // 1. 手势旋转 (食指滑动)
      // 使用 lerp 插值让旋转更平滑，rotationValue 来自 useHandTracking 的累加值
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y, 
        rotationValue, 
        0.1
      );

      // 2. 手势缩放 (双指捏合)
      // zoomValue 是 0-1 的捏合程度。我们把它映射到 1.0 - 2.5 倍缩放
      // 如果没有捏合(0)，就是原大小(1)
      const targetScale = 1 + zoomValue * 1.5; 
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }

    // --- 进度条逻辑 ---
    if (progressIncrement > 0) {
      setProgress(p => {
        const newP = p + progressIncrement;
        if (newP >= 100) {
          if (stage === 'STAGE_1_PEELING') setStage('STAGE_2_CUTTING');
          if (stage === 'STAGE_2_CUTTING') setStage('STAGE_3_CARVING');
          if (stage === 'STAGE_3_CARVING') setStage('STAGE_4_VIEWING');
          return 0;
        }
        return newP;
      });
    }
  });

  const getVisuals = () => {
    switch (stage) {
      case 'STAGE_1_PEELING': 
        return { color: '#555555', scale: 1.5, shape: 'box', text: '阶段1: 五指张开擦拭去皮' };
      case 'STAGE_2_CUTTING': 
        return { color: '#888888', scale: 1.2, shape: 'dodecahedron', text: '阶段2: 握拳挥舞切割' };
      case 'STAGE_3_CARVING': 
        return { color: '#aaddcc', scale: 1.0, shape: 'sphere', text: '阶段3: 食指精细雕刻' };
      case 'STAGE_4_VIEWING': 
        return { color: '#00ffaa', scale: 1.0, shape: 'torus', text: '完成! 食指旋转 / 双指缩放' };
      default: return { color: 'white', scale: 1, shape: 'box', text: '' };
    }
  };

  const visual = getVisuals();

  return (
    <group>
      <mesh ref={meshRef} scale={visual.scale}>
        {visual.shape === 'box' && <boxGeometry args={[2, 2, 2]} />}
        {visual.shape === 'dodecahedron' && <dodecahedronGeometry args={[1.5]} />}
        {visual.shape === 'sphere' && <sphereGeometry args={[1.2, 32, 32]} />}
        {visual.shape === 'torus' && <torusKnotGeometry args={[0.8, 0.3, 100, 16]} />}
        
        <meshStandardMaterial 
          color={visual.color} 
          wireframe={stage !== 'STAGE_4_VIEWING'} 
        />
      </mesh>
      
      <Text position={[0, 2.5, 0]} fontSize={0.3} color="white" anchorX="center">
        {visual.text} ({Math.floor(progress)}%)
      </Text>
    </group>
  );
}

export default function GameScene() {
  // 🔥 这里我们要解构出 rotation 和 explosion (对应 pinch)
  const { 
    cameraStream, 
    gesture, 
    velocity, 
    rotation, 
    explosion // 这个其实就是 pinch 的捏合程度 (0-1)
  } = useHandTracking();
  
  const [stage, setStage] = useState<GameStage>('STAGE_1_PEELING');

  return (
    <div className="h-full w-full bg-neutral-900 relative">
      <div className="absolute top-20 left-10 text-white z-10 font-mono text-sm bg-black/50 p-4 rounded">
         <p>当前阶段: {stage}</p>
         <p>识别手势: <span className="text-yellow-400 font-bold">{gesture}</span></p>
         {stage === 'STAGE_4_VIEWING' && (
           <>
             <p>Rotation: {rotation.toFixed(2)}</p>
             <p>Zoom (Pinch): {explosion.toFixed(2)}</p>
           </>
         )}
      </div>

      <CameraPreview stream={cameraStream} />

      <Canvas camera={{ position: [0, 0, 6] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        <InteractiveStone 
          gesture={gesture} 
          velocity={velocity} 
          stage={stage} 
          setStage={setStage}
          // 🔥 传进去！
          rotationValue={rotation}
          zoomValue={explosion}
        />
        
        {/* OrbitControls 依然保留，鼠标也能用 */}
        {/* 如果觉得手势和鼠标打架，可以把 enabled 改为 false，或者保留共存 */}
        <OrbitControls enabled={stage === 'STAGE_4_VIEWING'} />
      </Canvas>
    </div>
  );
}