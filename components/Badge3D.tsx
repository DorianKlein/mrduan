'use client';

import * as THREE from 'three';
import { useMemo, useEffect, useRef, useState } from 'react';
import { Canvas, useLoader, useThree, useFrame } from '@react-three/fiber';
import { useTexture, OrbitControls, Environment, Center, Float, PresentationControls } from '@react-three/drei';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

interface BadgeProps {
  frontImg: string;
  backImg: string;
  svgPath: string;
  scale?: number;
}

function BadgeModel({ frontImg, backImg, svgPath, scale = 1 }: BadgeProps) {
  const { gl } = useThree();
  const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
  
  const svgData = useLoader(SVGLoader, svgPath);
  const [frontTextureRaw, backTextureRaw] = useTexture([frontImg, backImg]);

  // 1. 纹理配置 (保持不变)
  const frontTexture = useMemo(() => {
    const t = frontTextureRaw.clone();
    t.colorSpace = THREE.SRGBColorSpace;
    t.center.set(0.5, 0.5);
    t.repeat.set(1, -1);
    
    // 🔥 核心修复：开启满血画质 🔥
    t.anisotropy = maxAnisotropy; // 让侧面纹理极度清晰
    t.minFilter = THREE.LinearMipmapLinearFilter; // 开启抗锯齿
    
    t.needsUpdate = true;
    return t;
  }, [frontTextureRaw, maxAnisotropy]);

  const backTexture = useMemo(() => {
    const t = backTextureRaw.clone();
    t.colorSpace = THREE.SRGBColorSpace;
    t.center.set(0.5, 0.5);
    t.repeat.set(1, -1);
    
    // 🔥 背面也要加 🔥
    t.anisotropy = maxAnisotropy;
    t.minFilter = THREE.LinearMipmapLinearFilter;

    t.needsUpdate = true;
    return t;
  }, [backTextureRaw, maxAnisotropy]);

  // 2. ✨ 核心计算：算出 SVG 的几何中心 ✨
  const { shapes, width, height, midX, midY } = useMemo(() => {
    const paths = svgData.paths.flatMap((p) => p.toShapes(true));
    
    const tempGeo = new THREE.ShapeGeometry(paths);
    tempGeo.computeBoundingBox();
    const box = tempGeo.boundingBox!;
    
    const w = box.max.x - box.min.x;
    const h = box.max.y - box.min.y;
    
    // 算出 SVG 的绝对中心坐标
    const x = (box.max.x + box.min.x) / 2;
    const y = (box.max.y + box.min.y) / 2;

    return { 
      shapes: paths, 
      width: w, 
      height: h, 
      midX: x, 
      midY: y 
    };
  }, [svgData]);

  const thickness = width * 0.05; 
  const bevel = width * 0.01; 
  const gap = width * 0.002;

  const acrylicMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, transmission: 1, opacity: 1, roughness: 0,
    ior: 1.5, thickness: 20, specularIntensity: 1, transparent: false, side: THREE.DoubleSide
  });

  useEffect(() => {
    return () => { frontTexture.dispose(); backTexture.dispose(); };
  }, [frontTexture, backTexture]);

  return (
    <group scale={[scale * 0.01, -scale * 0.01, scale * 0.01]}>
      
      {/* 🚀 全局归位：把整个组合往反方向移动，抵消掉 SVG 的偏移 */}
      <group position={[-midX, -midY, 0]}>

        {/* 1. 正面亚克力 */}
        {/* ExtrudeGeometry 会生成在 SVG 的原始位置 (比如 x=2000)，我们不动它 */}
        <mesh material={acrylicMaterial} position={[0, 0, gap - 50]} renderOrder={10}>
          <extrudeGeometry args={[shapes, { depth: thickness, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4 }]} />
        </mesh>

        {/* 2. 正面贴纸 */}
        {/* PlaneGeometry 默认在 (0,0)，我们需要把它移到 SVG 的位置 (midX, midY) 去追亚克力 */}
        <mesh position={[midX, midY, 1]} renderOrder={1}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial map={frontTexture} transparent={false} alphaTest={0.5} side={THREE.FrontSide} toneMapped={false} />
        </mesh>

        {/* 3. 白墨层 */}
        {/* ShapeGeometry 天生和 ExtrudeGeometry 重合，不需要手动位移 */}
        <mesh position={[0, 0, -gap]} renderOrder={1}>
           <shapeGeometry args={[shapes]} />
           <meshBasicMaterial color="#dddddd" side={THREE.DoubleSide} />
        </mesh>

        {/* 4. 背面贴纸 */}
        {/* 也要追到 (midX, midY) */}
        <mesh position={[midX, midY, -gap * 2]} rotation={[0, Math.PI, 0]} renderOrder={1}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial map={backTexture} transparent={false} alphaTest={0.5} side={THREE.FrontSide} toneMapped={false} />
        </mesh>

        {/* 5. 背面亚克力 */}
        {/* 这里的旋转中心是 group 的原点。
            因为外面的大 group 已经把原点移到了 (-midX, -midY)，
            所以这里的 (0,0) 其实就是 SVG 的绝对中心。
            我们需要让它绕着 (midX, midY) 旋转吗？
            
            不，为了简单，我们让背面亚克力也先生成在原始位置，
            然后我们手动把这个 mesh 移回来居中，旋转，再移回去？太麻烦。
            
            ✅ 简单做法：我们直接再生成一个 Extrude，不做 group 旋转，
            而是通过 scale z = -1 来镜像它！(Three.js 技巧)
        */}
        {/* <group position={[0, 0, -gap * 3]}> */}
           {/* 技巧：用 scale-z = -1 来实现镜像，而不是 rotation-y = 180 */}
           {/* 这样它就在原地镜像了，不需要算旋转轴！ */}
           {/* <mesh material={acrylicMaterial} scale={[1, 1, -1]} position={[0, 0, -thickness]}>
              <extrudeGeometry args={[shapes, { depth: thickness, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4 }]} />
           </mesh>
        </group> */}

      </group>
    </group>
  );
}

function AutoRotator({ children, isDragging }: { children: React.ReactNode, isDragging: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    // 只有当【没有】在拖拽时，才进行自动旋转
    if (groupRef.current && !isDragging) {
      groupRef.current.rotation.y += delta * 0.5; // 自转速度
    }
  });

  return <group ref={groupRef}>{children}</group>;
}


export default function Badge3D(props: BadgeProps) {

  const [isDragging, setIsDragging] = useState(false);
  return (
    // 容器设为 100% 宽高，背景透明
    <div className="w-full h-full relative" style={{ touchAction: 'none' }}
      onPointerDown={() => setIsDragging(true)}
      onPointerUp={() => setIsDragging(false)}
      onPointerLeave={() => setIsDragging(false)}>
      <Canvas 
        camera={{ position: [0, 0, 50], fov: 40 }} // 稍微拉远一点，适应全屏
        dpr={1} // 保持性能
        style={{ width: '100%', height: '100%', touchAction: 'none' }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
      >
        {/* 1. 环境光：降低一点亮度，制造神秘感 */}
        <Environment files="/studio.hdr" background={false} blur={0.8} />
        
        {/* 2. 补光灯：加两盏有色灯，打出 Web3 的氛围感 */}
        {/* 紫色侧逆光 */}
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={10} color="#a855f7" />
        {/* 蓝色底光 */}
        <pointLight position={[-10, -10, -10]} intensity={5} color="#3b82f6" />

        {/* 控制器配置 */}
        <PresentationControls
          global={true}
          cursor={true}
          snap={false} // ⚠️ 改为 false！否则松手后它会强行弹回正面，跟自动旋转打架
          speed={2.5}
          zoom={1}
          rotation={[0, 0, 0]}
          polar={[0, 0]} // 锁死上下翻转
          azimuth={[-Infinity, Infinity]} 
          // config={{ mass: 1, tension: 170, friction: 26 }}
        >
          <Float speed={3} rotationIntensity={0.5} floatIntensity={0.5}>
            <Center>
              {/* ✅ 4. 用 AutoRotator 包裹你的模型 */}
              <AutoRotator isDragging={isDragging}>
                <BadgeModel {...props} />
              </AutoRotator>
            </Center>
          </Float>
        </PresentationControls>
      </Canvas>
    </div>
  );
}