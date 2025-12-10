'use client';

import * as THREE from 'three';
import { useMemo, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { useTexture, OrbitControls, Environment, Center, Float } from '@react-three/drei';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

interface BadgeProps {
  frontImg: string;
  backImg: string;
  svgPath: string;
  scale?: number;
}

function BadgeModel({ frontImg, backImg, svgPath, scale = 1 }: BadgeProps) {
  const svgData = useLoader(SVGLoader, svgPath);
  const [frontTextureRaw, backTextureRaw] = useTexture([frontImg, backImg]);

  // 1. 纹理配置 (保持不变)
  const frontTexture = useMemo(() => {
    const t = frontTextureRaw.clone();
    t.colorSpace = THREE.SRGBColorSpace;
    t.center.set(0.5, 0.5);
    t.repeat.set(1, -1);
    t.needsUpdate = true;
    return t;
  }, [frontTextureRaw]);

  const backTexture = useMemo(() => {
    const t = backTextureRaw.clone();
    t.colorSpace = THREE.SRGBColorSpace;
    t.center.set(0.5, 0.5);
    t.repeat.set(1, -1);
    t.needsUpdate = true;
    return t;
  }, [backTextureRaw]);

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

  const thickness = width * 0.02; 
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
        <mesh material={acrylicMaterial} position={[0, 0, gap]} renderOrder={10}>
          <extrudeGeometry args={[shapes, { depth: thickness, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4 }]} />
        </mesh>

        {/* 2. 正面贴纸 */}
        {/* PlaneGeometry 默认在 (0,0)，我们需要把它移到 SVG 的位置 (midX, midY) 去追亚克力 */}
        <mesh position={[midX, midY, 0]} renderOrder={1}>
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
        <group position={[0, 0, -gap * 3]}>
           {/* 技巧：用 scale-z = -1 来实现镜像，而不是 rotation-y = 180 */}
           {/* 这样它就在原地镜像了，不需要算旋转轴！ */}
           <mesh material={acrylicMaterial} scale={[1, 1, -1]} position={[0, 0, -thickness]}>
              <extrudeGeometry args={[shapes, { depth: thickness, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4 }]} />
           </mesh>
        </group>

      </group>
    </group>
  );
}

export default function Badge3D(props: BadgeProps) {
  return (
    <div className="w-full h-full relative" style={{ touchAction: 'none' }}>
      <Canvas 
        camera={{ position: [0, 0, 25], fov: 35 }} 
        dpr={1}
        style={{ width: '100%', height: '100%', touchAction: 'none' }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <Environment files="/studio.hdr" />
        <OrbitControls 
          makeDefault 
          enablePan={false} 
          enableZoom={true} 
          
          // 👇 锁死上下视角：强制固定在 90度 (水平面)
          minPolarAngle={Math.PI / 2} 
          maxPolarAngle={Math.PI / 2}
          
          // (可选) 如果你想限制左右旋转角度（比如只能转180度），可以用 minAzimuthAngle / maxAzimuthAngle
          // 不写就是 360 度无限旋转
        />
        
        {/* Center 依然保留作为双重保险，但上面的数学计算才是主理 */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <Center>
            <BadgeModel {...props} />
          </Center>
        </Float>
      </Canvas>
    </div>
  );
}