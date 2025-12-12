'use client';

import * as THREE from 'three';
import { useMemo, useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useLoader, useThree, useFrame, extend } from '@react-three/fiber';
import { useTexture, Center, Float, PresentationControls, shaderMaterial } from '@react-three/drei';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { MeshSurfaceSampler } from 'three-stdlib';

// --- 1. 升级版粒子着色器 (支持渐变色 + 爆破效果) ---
const ParticleMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0, // 0 -> 1: 汇聚
    uExplode: 0,  // 0 -> 1: 爆破
    uColorA: new THREE.Color('#ddb7f7'), // 紫色
    uColorB: new THREE.Color('#6a89be'), // 蓝色
  },
  // Vertex Shader
  `
    uniform float uTime;
    uniform float uProgress;
    uniform float uExplode;
    
    attribute vec3 aRandomPosition;
    attribute float aRandomSize;
    attribute vec3 aExplodeDir; // 爆破方向
    
    varying vec2 vUv;
    varying float vProgress;

    // 弹性缓动
    float cubicOut(float t) {
      float f = t - 1.0;
      return f * f * f + 1.0;
    }

    void main() {
      vUv = uv;
      vProgress = uProgress;
      
      float t = cubicOut(uProgress);
      
      // 1. 汇聚阶段：从随机位置 -> 目标位置
      vec3 pos = mix(aRandomPosition, position, t);
      
      // 2. 悬浮噪点 (仅在未爆破时存在)
      float noiseStrength = (1.0 - t * 0.8) * (1.0 - uExplode); 
      pos.x += sin(uTime * 5.0 + position.y) * 1.5 * noiseStrength;
      pos.y += cos(uTime * 3.0 + position.x) * 1.5 * noiseStrength;
      pos.z += sin(uTime * 4.0 + position.x) * 1.5 * noiseStrength;

      // 3. 爆破阶段：沿着法线/随机方向向外飞
      // uExplode 从 0 变到 1 时，粒子向外飞 8000 个单位距离
      pos += aExplodeDir * uExplode * 8000.0;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // 粒子大小 (爆破时稍微变小一点，营造远去感)
      float size = (40.0 * aRandomSize + 10.0) * (1.0 - uExplode * 0.5);
      gl_PointSize = size * (3.0 / -mvPosition.z);
    }
  `,
  // Fragment Shader
  `
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    varying vec2 vUv;
    varying float vProgress;

    void main() {
      // 圆形裁剪
      vec2 coord = gl_PointCoord - vec2(0.5);
      if(length(coord) > 0.5) discard;

      // 颜色生成：基于 UV 的垂直渐变 (Web3 风格)
      // vUv.y 从 0 到 1，混合紫色和蓝色
      vec3 gradientColor = mix(uColorB, uColorA, vUv.y + 0.2);
      
      // 加一点亮度，让它看起来像发光的实体
      gl_FragColor = vec4(gradientColor, 1.0);
    }
  `
);
extend({ ParticleMaterial });

interface BadgeProps {
  frontImg: string;
  backImg: string;
  svgPath: string;
  scale?: number;
  autoRotate?: boolean;
  onLoadComplete?: () => void;
}


// --- 2. 粒子组件 (生成爆破方向) ---
// 注意：现在不需要传 frontTexture 了，因为我们用纯色渐变
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function BadgeParticles({ svgData, onReady, onComplete }: { svgData: any, onReady: () => void, onComplete: () => void }) {
  const pointsRef = useRef<THREE.Points>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const materialRef = useRef<any>(null);
  const hasReadyRef = useRef(false);

  const { positions, randomPositions, explodeDirs, uvs, randomSizes } = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paths = svgData.paths.flatMap((p: any) => p.toShapes(true));
    const tempGeo = new THREE.ShapeGeometry(paths);
    tempGeo.computeBoundingBox();
    const box = tempGeo.boundingBox!;
    const w = box.max.x - box.min.x;
    const h = box.max.y - box.min.y;

    // 几何体加厚，确保包得住
    const thickness = w * 0.15; 
    const geometry = new THREE.ExtrudeGeometry(paths, { 
      depth: thickness, bevelEnabled: false 
    });
    geometry.center();

    geometry.scale(1.2, 1.2, 1.0);

    const sampler = new MeshSurfaceSampler(new THREE.Mesh(geometry));
    sampler.build();

    const count = 100000; // 10万个粒子，实心感更强
    const posArray = new Float32Array(count * 3);
    const randPosArray = new Float32Array(count * 3);
    const explodeDirArray = new Float32Array(count * 3); // 新增：爆破方向
    const uvArray = new Float32Array(count * 2);
    const sizeArray = new Float32Array(count);
    const tempPos = new THREE.Vector3();
    const tempNormal = new THREE.Vector3();

    for (let i = 0; i < count; i++) {
      // 采样位置和法线(法线用于确定爆破方向)
      sampler.sample(tempPos, tempNormal);
      
      posArray[i * 3] = tempPos.x;
      posArray[i * 3 + 1] = tempPos.y;
      posArray[i * 3 + 2] = tempPos.z;

      // 随机起点
      const spread = 10000;
      // eslint-disable-next-line react-hooks/purity
      randPosArray[i * 3] = (Math.random() - 0.5) * spread;
      // eslint-disable-next-line react-hooks/purity
      randPosArray[i * 3 + 1] = (Math.random() - 0.5) * spread;
      // eslint-disable-next-line react-hooks/purity
      randPosArray[i * 3 + 2] = (Math.random() - 0.5) * spread;

      // 爆破方向：使用法线方向 + 一点随机扰动，让炸开更自然
      // eslint-disable-next-line react-hooks/purity
      explodeDirArray[i * 3] = tempNormal.x + (Math.random()-0.5);
      // eslint-disable-next-line react-hooks/purity
      explodeDirArray[i * 3 + 1] = tempNormal.y + (Math.random()-0.5);
      // eslint-disable-next-line react-hooks/purity
      explodeDirArray[i * 3 + 2] = tempNormal.z + (Math.random()-0.5);

      uvArray[i * 2] = (tempPos.x + w/2) / w;
      uvArray[i * 2 + 1] = (tempPos.y + h/2) / h;
      // eslint-disable-next-line react-hooks/purity
      sizeArray[i] = Math.random();
    }

    return { 
      positions: posArray, randomPositions: randPosArray, explodeDirs: explodeDirArray,
      uvs: uvArray, randomSizes: sizeArray 
    };
  }, [svgData]);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.elapsedTime;
      
      // 阶段 1: 汇聚 (Progress 0 -> 1)
      if (materialRef.current.uProgress < 1) {
        materialRef.current.uProgress += delta * 0.2;
        
        // 偷跑：汇聚到 95% 时显示实体
        if (materialRef.current.uProgress > 0.97 && !hasReadyRef.current) {
          onReady();
          hasReadyRef.current = true;
        }
      } 
      // 阶段 2: 爆破 (Explode 0 -> 1)
      else {
        materialRef.current.uProgress = 1;
        
        // 开始增加爆破值
        if (materialRef.current.uExplode < 1) {
           // 爆破速度，越快越有冲击力
           materialRef.current.uExplode += delta * 1.2; 
        } else {
           // 爆破完成，卸载粒子
           onComplete();
        }
      }
    }
  });

  return (
    <points ref={pointsRef} scale={[0.01, -0.01, 0.01]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aRandomPosition" args={[randomPositions, 3]} />
        <bufferAttribute attach="attributes-aExplodeDir" args={[explodeDirs, 3]} />
        <bufferAttribute attach="attributes-uv" args={[uvs, 2]} />
        <bufferAttribute attach="attributes-aRandomSize" args={[randomSizes, 1]} />
      </bufferGeometry>
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      <particleMaterial 
        ref={materialRef} 
        transparent={true} 
        depthWrite={true} // 开启深度写入，让粒子看起来是实心的
        // 默认 NormalBlending，不要改
      />
    </points>
  );
}

// --- 3. 实体组件 (保持不变) ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function BadgeModel({ svgData, frontTexture, backTexture, scale = 1, visible }: { svgData: any, frontTexture: THREE.Texture, backTexture: THREE.Texture, scale?: number, visible: boolean }) {
  

  const { shapes, width, height, midX, midY } = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paths = svgData.paths.flatMap((p: any) => p.toShapes(true));
    const tempGeo = new THREE.ShapeGeometry(paths);
    tempGeo.computeBoundingBox();
    const box = tempGeo.boundingBox!;
    const w = box.max.x - box.min.x;
    const h = box.max.y - box.min.y;
    return { shapes: paths, width: w, height: h, midX: (box.max.x + box.min.x) / 2, midY: (box.max.y + box.min.y) / 2 };
  }, [svgData]);

  const thickness = width * 0.05; 
  const bevel = width * 0.01; 
  const gap = width * 0.002;

  const acrylicMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, transmission: 1, opacity: 1, roughness: 0,
    ior: 1.5, thickness: 20, specularIntensity: 1, transparent: false, side: THREE.DoubleSide
  });

  return (
    <group scale={[scale * 0.01, -scale * 0.01, scale * 0.01]} visible={visible}>
      <group position={[-midX, -midY, 0]}>
        <mesh material={acrylicMaterial} position={[0, 0, gap - 50]} renderOrder={10}>
          <extrudeGeometry args={[shapes, { depth: thickness, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4 }]} />
        </mesh>
        <mesh position={[midX, midY, 1]} renderOrder={1}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial map={frontTexture} transparent={false} alphaTest={0.5} side={THREE.FrontSide} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, -gap]} renderOrder={1}>
           <shapeGeometry args={[shapes]} />
           <meshBasicMaterial color="#dddddd" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[midX, midY, -gap * 2]} rotation={[0, Math.PI, 0]} renderOrder={1}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial map={backTexture} transparent={false} alphaTest={0.5} side={THREE.FrontSide} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function AutoRotator({ children, isDragging, autoRotate = true }: { children: React.ReactNode, isDragging: boolean, autoRotate?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (groupRef.current && !isDragging && autoRotate) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });
  return <group ref={groupRef}>{children}</group>;
}

// --- 4. 场景管理 ---
function BadgeContent(props: BadgeProps) {
  const svgData = useLoader(SVGLoader, props.svgPath);
  const [frontTextureRaw, backTextureRaw] = useTexture([props.frontImg, props.backImg]);

  const { gl } = useThree();
  const maxAnisotropy = gl.capabilities.getMaxAnisotropy();

  const frontTexture = useMemo(() => {
    const t = frontTextureRaw.clone();
    t.colorSpace = THREE.SRGBColorSpace;
    t.center.set(0.5, 0.5); 
    t.repeat.set(1, -1);
    t.anisotropy = maxAnisotropy;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.needsUpdate = true;
    return t;
  }, [frontTextureRaw, maxAnisotropy]);

  const backTexture = useMemo(() => {
    const t = backTextureRaw.clone();
    t.colorSpace = THREE.SRGBColorSpace;
    t.center.set(0.5, 0.5); 
    t.repeat.set(1, -1);
    t.anisotropy = maxAnisotropy;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.needsUpdate = true;
    return t;
  }, [backTextureRaw, maxAnisotropy]);

  useEffect(() => {
    return () => { frontTexture.dispose(); backTexture.dispose(); };
  }, [frontTexture, backTexture]);

  const [isDragging, setIsDragging] = useState(false);
  const [showSolid, setShowSolid] = useState(false);
  const [showParticles, setShowParticles] = useState(true);

  return (
    <>
      {/* <Environment files="/studio.hdr" background={false} blur={0.8} /> */}
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={0} color="#a855f7" />
      <pointLight position={[-10, -10, -10]} intensity={0} color="#3b82f6" />

      {/* ✅ 新增：纯色光照组合 */}
      {/* 1. 环境光：提供全局的、均匀的基础亮度，避免死黑 */}
      <ambientLight intensity={0} color="#ffffff" />

      {/* 2. 主光源 (紫色)：从右上方照射，提供主光影和高光 */}
      <spotLight
        position={[20, 20, 20]} // 位置在右上方
        angle={2}            // 光束角度
        penumbra={1}           // 边缘柔和度
        intensity={0}         // 强度
        color="#a855f7"        // 紫色
        castShadow             // 开启投影（可选，增加真实感）
      />

      {/* 3. 补光灯 (蓝色)：从左下方照射，勾勒轮廓，增加层次感 */}
      <spotLight
        position={[-20, -10, 10]} // 位置在左下方
        angle={0.3}
        penumbra={1}
        intensity={0}          // 强度稍弱
        color="#3b82f6"        // 蓝色
      />
      
      {/* 4. 顶部光：照亮顶部边缘 */}
      <directionalLight position={[0, 10, 0]} intensity={0} color="#ffffff" />

      <PresentationControls
        global cursor={true} snap={false} speed={1.5} zoom={1}
        rotation={[0, 0, 0]} polar={[0, 0]} azimuth={[-Infinity, Infinity]} 
      >
        <group 
          onPointerDown={() => setIsDragging(true)} 
          onPointerUp={() => setIsDragging(false)}
          onPointerLeave={() => setIsDragging(false)}
        >
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Center>
              <AutoRotator isDragging={isDragging} autoRotate={props.autoRotate}>
                
                {showParticles && (
                  <BadgeParticles 
                    svgData={svgData} 
                    // 粒子现在不需要贴图了，所以不传 frontTexture
                    onReady={() => setShowSolid(true)}
                    onComplete={() => {
                        setShowParticles(false);
                        if (props.onLoadComplete) props.onLoadComplete();
                    }} 
                  />
                )}

                <BadgeModel 
                  svgData={svgData}
                  frontTexture={frontTexture}
                  backTexture={backTexture}
                  scale={props.scale}
                  visible={showSolid} 
                />

              </AutoRotator>
            </Center>
          </Float>
        </group>
      </PresentationControls>
    </>
  );
}

export default function Badge3D(props: BadgeProps) {
  return (
    <div className="w-full h-full relative" style={{ touchAction: 'none' }}>
      <Canvas 
        camera={{ position: [0, 0, 100], fov: 35 }} 
        dpr={1}
        style={{ width: '100%', height: '100%', touchAction: 'none' }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
      >
        <Suspense fallback={null}>
          <BadgeContent {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
}