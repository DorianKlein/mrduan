'use client';

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Float, Text, Center} from '@react-three/drei';
import * as THREE from 'three';
import { useHandTracking } from '@/components/jade/shared/useHandTracking';
import CameraPreview from '@/components/jade/shared/CameraPreview';

// --- 类型定义 ---
type GameStage = 'STAGE_1_PEELING' | 'STAGE_2_CUTTING' | 'STAGE_3_CARVING' | 'STAGE_4_VIEWING';

// ==========================================================
// 组件 1: 泥皮层 (Level 1) - 逻辑: 擦拭变透明
// ==========================================================
function Level1_Skin({ progress, visible }: { progress: number, visible: boolean }) {
  const { scene } = useGLTF('/models/jade/carving/level1_skin.glb');
  const groupRef = useRef<THREE.Group>(null);

  // 克隆场景以防止材质污染
  const clone = useMemo(() => scene.clone(), [scene]);

  useFrame(() => {
    if (!groupRef.current) return;
    
    if (!visible) {
        groupRef.current.visible = false;
        return;
    }
    // 根据进度计算透明度：进度 0 -> 透明度 1; 进度 100 -> 透明度 0
    const opacity = Math.max(0, 1 - progress / 100);
    
    // 遍历模型修改材质透明度
    groupRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        // 确保材质是支持透明的
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.transparent = true;
          mat.opacity = opacity;
          // 稍微给点土黄色
          // mat.color.lerp(new THREE.Color('#ffffff'), 0.1); 
        }
      }
    });
    
    // 如果完全透明了，隐藏它以节省性能
    groupRef.current.visible = opacity > 0.01;
  });

  return <primitive object={clone} ref={groupRef} />;
}

// ==========================================================
// 组件 2: 碎石层 (Level 2) - 逻辑: 爆炸飞散
// ==========================================================
function Level2_Rock({ triggered, visible }: { triggered: boolean, visible: boolean }) {
  const { scene } = useGLTF('/models/jade/carving/level2_rock.glb');
  const groupRef = useRef<THREE.Group>(null);
  const clone = useMemo(() => scene.clone(), [scene]);

  const [fragments, setFragments] = useState<{ mesh: THREE.Mesh, dir: THREE.Vector3, speed: number }[]>([]);

  useEffect(() => {
    if (clone) {
      const frags: { mesh: THREE.Mesh, dir: THREE.Vector3, speed: number }[] = [];
      clone.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const direction = new THREE.Vector3().copy(mesh.position).normalize();
          if (direction.length() === 0) direction.random();
          
          frags.push({
            mesh: mesh,
            dir: direction,
            speed: Math.random() * 0.1 + 0.05
          });
        }
      });
      setFragments(frags);
    }
  }, [clone]);

  useFrame(() => {
    if (!groupRef.current) return;

    // 🔥 核心修复：如果外部要求隐藏（比如到了 Stage 4），直接隐藏
    if (!visible) {
        groupRef.current.visible = false;
        return;
    }
    groupRef.current.visible = true;

    // 只有触发爆炸后才开始动
    if (triggered) {
        fragments.forEach((frag) => {
          frag.mesh.position.addScaledVector(frag.dir, frag.speed);
          frag.mesh.position.y -= 0.02; 
          frag.mesh.rotation.x += frag.speed;
          frag.mesh.rotation.z += frag.speed;
        });
    }
  });

  return <primitive object={clone} ref={groupRef} />;
}

// ==========================================================
// 组件 3: 粗胚层 (Level 3) - 逻辑: 缩放/消融
// ==========================================================
function Level3_Rough({ progress, visible }: { progress: number, visible: boolean }) {
  const { scene } = useGLTF('/models/jade/carving/level3_rough.glb');
  const groupRef = useRef<THREE.Group>(null);
  const clone = useMemo(() => scene.clone(), [scene]);

  useFrame(() => {
    if (!groupRef.current) return;

    if (!visible) {
        groupRef.current.visible = false;
        return;
    }

    // 进度越高，模型越小，模拟被“刮掉”了
    // 从 1.0 缩放到 0.8 (刚好露出里面的成品)
    const scale = THREE.MathUtils.lerp(1.05, 0.95, progress / 100);
    groupRef.current.scale.setScalar(scale);

    // 同时淡出
    const opacity = Math.max(0, 1 - progress / 100);
    groupRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.transparent = true;
          mat.opacity = opacity;
          mat.roughness = 0.8; // 粗糙的质感
        }
      }
    });
    
    groupRef.current.visible = opacity > 0.01;
  });

  return <primitive object={clone} ref={groupRef} />;
}

// ==========================================================
// 组件 4: 成品层 (Level 4) - 逻辑: 展示控制
// ==========================================================
function Level4_Final({ 
  visible, 
  rotationValue, 
  zoomValue 
}: { 
  visible: boolean, 
  rotationValue: number, 
  zoomValue: number 
}) {
  const { scene } = useGLTF('/models/jade/carving/level4_jade.glb');
  const groupRef = useRef<THREE.Group>(null);
  const clone = useMemo(() => scene.clone(), [scene]);

  useFrame(() => {
    if (!groupRef.current) return;
    
    // 控制显示
    groupRef.current.visible = visible;

    // 只有在显示时才进行材质增强和变换计算
    if (visible) {
      // 1. 材质增强 (让玉更透亮)
      groupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
             const mat = mesh.material as THREE.MeshStandardMaterial;
             mat.roughness = 0.1;
             mat.metalness = 0.1;
             mat.envMapIntensity = 2.0;
          }
        }
      });

      // 2. 旋转 (直接基于模型自身的中心轴)
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        rotationValue,
        0.3
      );

      // 3. 缩放 (直接基于模型自身的中心轴)
      // 因为你在建模软件里居中了，所以这里直接 scale 就会以中心放大
      const targetScale = 1 + zoomValue * 2.5;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return <primitive object={clone} ref={groupRef} />;
}


// ==========================================================
// 主场景逻辑
// ==========================================================
export default function GameScene() {
  const { cameraStream, gesture, velocity, rotation, explosion } = useHandTracking();
  const [stage, setStage] = useState<GameStage>('STAGE_1_PEELING');
  
  // 进度状态
  const [progress, setProgress] = useState(0);

  // 每一帧更新游戏逻辑
  // 注意：逻辑放在这里可以控制全局，不需要放在 Canvas 里面
  useEffect(() => {
    const timer = setInterval(() => {
      let increment = 0;

      // --- 阶段 1: 去皮 ---
      if (stage === 'STAGE_1_PEELING') {
        if (gesture === 'OPEN' && velocity > 0.001) increment = 5.0; 
      }
      // --- 阶段 2: 切割 (无需进度条，一刀切) ---
      else if (stage === 'STAGE_2_CUTTING') {
        if (gesture === 'FIST' && velocity > 0.002) {
          // 检测到强力挥拳，直接切换下一关
          setStage('STAGE_3_CARVING'); 
          setProgress(0);
          return; // 跳过本次进度更新
        }
      }
      // --- 阶段 3: 雕刻 ---
      else if (stage === 'STAGE_3_CARVING') {
        if (gesture === 'POINT') increment = 2.0;
      }

      // 更新进度
      if (increment > 0) {
        setProgress((p) => {
          const next = p + increment;
          if (next >= 100) {
            // 切换阶段逻辑
            if (stage === 'STAGE_1_PEELING') {
                setStage('STAGE_2_CUTTING');
                return 0; // 重置进度
            }
            if (stage === 'STAGE_3_CARVING') {
                setStage('STAGE_4_VIEWING');
                return 100; // 保持 100
            }
          }
          return next;
        });
      }
    }, 1000 / 60); // 60 FPS Check

    return () => clearInterval(timer);
  }, [gesture, velocity, stage]);

  return (
    <div className="h-full w-full bg-neutral-900 relative">
      {/* UI 面板 */}
      <div className="absolute top-20 left-10 text-white z-10 font-mono text-sm pointer-events-none">
         <h1 className="text-2xl font-bold mb-2 text-emerald-400">当前工艺: {getStageName(stage)}</h1>
         <p>手势识别: <span className="text-yellow-400">{gesture}</span></p>
         <p>操作力度: {(velocity * 1000).toFixed(0)}</p>
         
         {/* 进度条 */}
         <div className="w-48 h-2 bg-gray-700 mt-2 rounded overflow-hidden">
            <div 
                className="h-full bg-emerald-500 transition-all duration-100" 
                style={{ width: `${progress}%` }} 
            />
         </div>
         <p className="text-xs text-gray-400 mt-1">{Math.floor(progress)}%</p>
      </div>

      <CameraPreview stream={cameraStream} />

      <Canvas camera={{ position: [0, 0, 2], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <Environment preset="warehouse" />

        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <group rotation={[0, Math.PI / 4, 0]}>
              
              {/* Level 1: 泥皮 */}
              {/* 逻辑：只在 Stage 1 显示。一旦进入 Stage 2，立刻消失 */}
              <Level1_Skin 
                progress={progress} 
                visible={stage === 'STAGE_1_PEELING'} 
              />

              {/* Level 2: 碎石 */}
              {/* 逻辑：在 Stage 1, 2, 3 都存在。只有到了 Stage 4 (鉴赏) 才彻底消失 */}
              {/* 触发爆炸：只要不是 Stage 1 和 2，就说明已经炸了 (进入 Stage 3 瞬间炸) */}
              <Level2_Rock 
                visible={stage !== 'STAGE_4_VIEWING'}
                triggered={stage === 'STAGE_3_CARVING' || stage === 'STAGE_4_VIEWING'} 
              />

              {/* Level 3: 粗胚 */}
              {/* 逻辑：只在 Stage 3 (雕刻) 显示 */}
              <Level3_Rough 
                progress={progress} 
                visible={stage === 'STAGE_3_CARVING'} 
              />

              {/* Level 4: 成品 */}
              {/* 逻辑：在 Stage 3 (作为内核隐约显示) 和 Stage 4 (完全展示) */}
              <Level4_Final 
                visible={stage === 'STAGE_3_CARVING' || stage === 'STAGE_4_VIEWING'} 
                rotationValue={stage === 'STAGE_4_VIEWING' ? rotation : 0} 
                zoomValue={stage === 'STAGE_4_VIEWING' ? explosion : 0}
              />
              
          </group>
        </Float>

        <OrbitControls 
          makeDefault 
          target={[0, 0.2, 0]} 
          enableRotate={stage === 'STAGE_4_VIEWING'}
          enableZoom={stage === 'STAGE_4_VIEWING'}
          enablePan={false}
        />  
      </Canvas>
    </div>
  );
}

// 辅助函数：显示当前阶段名称
function getStageName(s: GameStage) {
    switch(s) {
        case 'STAGE_1_PEELING': return "去皮 (张开手掌擦拭)";
        case 'STAGE_2_CUTTING': return "开石 (握拳用力挥砍)";
        case 'STAGE_3_CARVING': return "精雕 (食指细致滑动)";
        case 'STAGE_4_VIEWING': return "鉴赏 (旋转与缩放)";
        default: return "";
    }
}

useGLTF.preload('/models/level1_skin.glb');
useGLTF.preload('/models/level2_rock.glb');
useGLTF.preload('/models/level3_rough.glb');
useGLTF.preload('/models/level4_jade.glb');