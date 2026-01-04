'use client';

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Float, Text, Center, useTexture } from '@react-three/drei';
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
  const clone = useMemo(() => scene.clone(), [scene]);

  useFrame(() => {
    if (!groupRef.current) return;
    
    // 强制隐藏逻辑
    if (!visible) {
        groupRef.current.visible = false;
        return;
    }

    const opacity = Math.max(0, 1 - progress / 100);
    
    groupRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.transparent = true;
          mat.opacity = opacity;
        }
      }
    });
    
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

    if (!visible) {
        groupRef.current.visible = false;
        return;
    }
    groupRef.current.visible = true;

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
    // 必须显式设为 true，否则可能被之前的逻辑隐藏
    groupRef.current.visible = true;

    const scale = THREE.MathUtils.lerp(1.05, 0.95, progress / 100);
    groupRef.current.scale.setScalar(scale);

    const opacity = Math.max(0, 1 - progress / 100);
    groupRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.transparent = true;
          mat.opacity = opacity;
          mat.roughness = 0.8; 
        }
      }
    });
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
    
    groupRef.current.visible = visible;

    if (visible) {
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

      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        rotationValue,
        0.3
      );

      const targetScale = 1 + zoomValue * 2.5;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return <primitive object={clone} ref={groupRef} />;
}

// ==========================================================
// 组件 5: 手持工具 - 跟随手势位置移动
// ==========================================================
function HandTool({ 
  stage, 
  fingertip 
}: { 
  stage: GameStage, 
  fingertip: { x: number, y: number } 
}) {
  const { viewport, camera } = useThree();
  const spriteRef = useRef<THREE.Sprite>(null);
  
  // 根据阶段加载对应的工具纹理
  const getToolTexturePath = () => {
    switch(stage) {
      case 'STAGE_1_PEELING': return '/models/jade/tools/bursh.png';
      case 'STAGE_2_CUTTING': return '/models/jade/tools/hammer.png';
      case 'STAGE_3_CARVING': return '/models/jade/tools/carving_knife.png';
      default: return null;
    }
  };

  const texturePath = getToolTexturePath();
  const texture = texturePath ? useTexture(texturePath) : null;

  useFrame(() => {
    if (!spriteRef.current || !texture) return;
    
    // 将归一化坐标 (0-1) 转换为 3D 场景坐标
    // fingertip.x: 0~1 (左到右), fingertip.y: 0~1 (上到下)
    // 需要映射到屏幕空间，然后投影到 3D 空间
    
    // 标准化设备坐标 (NDC): -1 到 1
    const ndcX = -((fingertip.x * 2) - 1);    // 0~1 -> 1~-1 (镜像翻转X轴)
    const ndcY = -(fingertip.y * 2) + 1;      // 0~1 -> 1~-1 (Y轴反转)
    
    // 转换为世界坐标 (在相机前方固定距离)
    const distance = 1.5; // 工具距离相机的距离
    const vector = new THREE.Vector3(ndcX, ndcY, 0.5);
    vector.unproject(camera);
    
    const dir = vector.sub(camera.position).normalize();
    const targetPos = camera.position.clone().add(dir.multiplyScalar(distance));
    
    // 平滑跟随
    spriteRef.current.position.lerp(targetPos, 0.3);
  });

  if (!texture) return null;

  return (
    <sprite ref={spriteRef} scale={[0.2, 0.2, 1]}>
      <spriteMaterial map={texture} transparent depthTest={false} />
    </sprite>
  );
}

// ==========================================================
// 主场景逻辑 (🔥 核心修改区域)
// ==========================================================
export default function GameScene() {
  const { cameraStream, gesture, velocity, rotation, explosion, fingertip } = useHandTracking();
  const [stage, setStage] = useState<GameStage>('STAGE_1_PEELING');
  const [progress, setProgress] = useState(0);

  // 重置游戏到初始状态
  const handleReset = () => {
    setStage('STAGE_1_PEELING');
    setProgress(0);
  };

  // 1. 创建 Refs 来存储最新数据，防止闭包陷阱
  const gestureRef = useRef(gesture);
  const velocityRef = useRef(velocity);
  const stageRef = useRef(stage);

  // 2. 时刻同步 Ref 的值
  useEffect(() => {
    gestureRef.current = gesture;
    velocityRef.current = velocity;
    stageRef.current = stage;
  }, [gesture, velocity, stage]);

  // 3. 游戏主循环 (依赖数组为空，永不重启定时器！)
  useEffect(() => {
    const timer = setInterval(() => {
      // 从 Ref 中读取最新值
      const currentGesture = gestureRef.current;
      const currentVelocity = velocityRef.current;
      const currentStage = stageRef.current;
      
      let increment = 0;

      // --- 阶段 1: 去皮 ---
      if (currentStage === 'STAGE_1_PEELING') {
        // 🔥 Windows 修正: 阈值降低到 0.0005，确保稍微动一下就能触发
        if (currentGesture === 'OPEN' && currentVelocity > 0.0005) {
             increment = 1.0; 
        } 
      }
      // --- 阶段 2: 切割 ---
      else if (currentStage === 'STAGE_2_CUTTING') {
        if (currentGesture === 'FIST' && currentVelocity > 0.002) {
          setStage('STAGE_3_CARVING'); 
          setProgress(0);
          return; 
        }
      }
      // --- 阶段 3: 雕刻 ---
      else if (currentStage === 'STAGE_3_CARVING') {
        if (currentGesture === 'POINT') increment = 1.0;
      }

      // 更新进度
      if (increment > 0) {
        setProgress((p) => {
          const next = p + increment;
          if (next >= 100) {
            // 切换阶段
            if (currentStage === 'STAGE_1_PEELING') {
                setStage('STAGE_2_CUTTING');
                return 0; 
            }
            if (currentStage === 'STAGE_3_CARVING') {
                setStage('STAGE_4_VIEWING');
                return 100; 
            }
          }
          return next;
        });
      }
    }, 33); // 33ms (约30FPS)，更稳定

    return () => clearInterval(timer);
  }, []); // 👈 这里的依赖数组必须是空的！

  return (
    <div className="h-full w-full bg-neutral-900 relative">
      {/* 重置按钮 */}
      <button
        onClick={handleReset}
        className="absolute top-6 right-6 z-20 px-5 py-2.5 bg-neutral-800/80 backdrop-blur-sm border-2 border-emerald-500/50 hover:border-emerald-400 hover:bg-neutral-800 text-emerald-400 hover:text-emerald-300 rounded-lg font-mono font-semibold shadow-lg shadow-emerald-500/20 transition-all duration-200 active:scale-95 pointer-events-auto"
      >
        🔄 重制
      </button>

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
        <Environment files="/empty_warehouse_01_1k.hdr" />

        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <group rotation={[0, Math.PI / 4, 0]}>
              
              {/* Level 1: 泥皮 */}
              <Level1_Skin 
                progress={progress} 
                visible={stage === 'STAGE_1_PEELING'} 
              />

              {/* Level 2: 碎石 */}
              <Level2_Rock 
                visible={stage !== 'STAGE_4_VIEWING'}
                triggered={stage === 'STAGE_3_CARVING' || stage === 'STAGE_4_VIEWING'} 
              />

              {/* Level 3: 粗胚 */}
              <Level3_Rough 
                progress={progress} 
                visible={stage === 'STAGE_3_CARVING'} 
              />

              {/* Level 4: 成品 */}
              <Level4_Final 
                visible={stage === 'STAGE_3_CARVING' || stage === 'STAGE_4_VIEWING'} 
                rotationValue={stage === 'STAGE_4_VIEWING' ? rotation : 0} 
                zoomValue={stage === 'STAGE_4_VIEWING' ? explosion : 0}
              />
              
          </group>
        </Float>

        {/* 手持工具 - 跟随手势 */}
        {stage !== 'STAGE_4_VIEWING' && (
          <HandTool stage={stage} fingertip={fingertip} />
        )}

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

useGLTF.preload('/models/jade/carving/level1_skin.glb');
useGLTF.preload('/models/jade/carving/level2_rock.glb');
useGLTF.preload('/models/jade/carving/level3_rough.glb');
useGLTF.preload('/models/jade/carving/level4_jade.glb');

// 预加载工具纹理
useTexture.preload('/models/jade/tools/bursh.png');
useTexture.preload('/models/jade/tools/hammer.png');
useTexture.preload('/models/jade/tools/carving_knife.png');