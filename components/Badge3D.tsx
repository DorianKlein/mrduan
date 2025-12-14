'use client';

import * as THREE from 'three';
import { useMemo, useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useLoader, useThree, useFrame, extend } from '@react-three/fiber';
import { useTexture, Center, Environment, Float, PresentationControls, shaderMaterial } from '@react-three/drei';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { MeshSurfaceSampler } from 'three-stdlib';

// --- 1. 升级版粒子着色器 (支持渐变色 + 爆破效果) ---
const ParticleMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0, // 0 -> 1: 汇聚
    uExplode: 0,  // 0 -> 1: 爆破
    uColorA: new THREE.Color('#fceffd'), // 紫色
    uColorB: new THREE.Color('#ecf1fb'), // 蓝色
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

    geometry.scale(0.5, 0.5, 0.5);

    const sampler = new MeshSurfaceSampler(new THREE.Mesh(geometry));
    sampler.build();

    const count = 50000; // 5万个粒子，实心感更强
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
      const spread = 5000;
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
        
        // 偷跑：汇聚到 97% 时显示实体
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
        depthWrite={false} // 开启深度写入，让粒子看起来是实心的
        // 默认 NormalBlending，不要改
      />
    </points>
  );
}

// --- 3. 实体组件 (保持不变) ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function BadgeModel({ svgData, frontTexture, backTexture, scale = 1, visible }: { svgData: any, frontTexture: THREE.Texture, backTexture: THREE.Texture, scale?: number, visible: boolean }) {
  

  const { shapes, width, height, midX, midY, scaleRatio } = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paths = svgData.paths.flatMap((p: any) => p.toShapes(true));

    const tempGeo = new THREE.ShapeGeometry(paths);
    tempGeo.computeBoundingBox();
    const rawBox = tempGeo.boundingBox!;
    const rawW = rawBox.max.x - rawBox.min.x;
    const rawH = rawBox.max.y - rawBox.min.y;

    const k = 5 / rawW;
    
    return { 
    shapes: paths, // 用缩放后的形状
    width: rawW,   // 现在 w 应该是 5
    height: rawH, 
    midX: (rawBox.max.x + rawBox.min.x) / 2, 
    midY: (rawBox.max.y + rawBox.min.y) / 2,
    scaleRatio: k
    };
  }, [svgData]);

  const realThickness = 0.4;  //厚度
  const realBevel = 0.1;     //倒角

  //计算内部厚度
  const internalDepth = realThickness / scaleRatio;

  const extrusionSettings = useMemo(() => ({
    depth: internalDepth, 
    bevelEnabled: true, 
    bevelThickness: realBevel / scaleRatio, 
    bevelSize: realBevel / scaleRatio, 
    bevelSegments: 5 
  }), [internalDepth, realBevel, scaleRatio]);

  return (
    <group scale={[scaleRatio, -scaleRatio, scaleRatio]} visible={visible}>
      <group position={[-midX, -midY, 0]}>
        {/* 亚克力 */}
        <mesh 
          position={[0, 0, -internalDepth / 2]} 
          renderOrder={10} 
          castShadow 
          receiveShadow
        >
          {/* 几何体：直接渲染，不需要材质数组 */}
          <extrudeGeometry args={[shapes, extrusionSettings]} />

          {/* 统一材质：全抛光高透亚克力 */}
          <meshPhysicalMaterial
            // --- 核心：开启物理传输 ---
            transmission={1}   // 全透射
            transparent={false}

            thickness={3.5}    // ✅ 加厚！让光线在内部多跑一会儿，折射扭曲更明显
            
            // --- 表面质感 ---
            roughness={0.05}   // 给一点点微小的磨砂，让高光更柔和，不那么“脆”
            ior={1.7}          // 亚克力折射率
            
            // --- 颜色与衰减 (灵魂所在) ---
            color="#ffffff"    // 表面保持纯净
            
            // 衰减色：这是物体内部的“本体色”
            // 设为淡青色/淡蓝色，越厚的地方颜色越深
            attenuationColor="#cceeff" 
            
            // 衰减距离：控制颜色的深浅
            // 这个值越小，颜色越浓（像深水）；这个值越大，越清澈
            // 配合 thickness={3.5}，设为 4.0 左右能得到很好的层次感
            attenuationDistance={1.0} 

            // --- 高光与反射 ---
            specularIntensity={1}
            specularColor="#ffffff"
            envMapIntensity={2} // 配合暗 HDR，这里要强一点
            
            clearcoat={1}       // 双层高光
            clearcoatRoughness={0}

            side={THREE.DoubleSide} 
          />
        </mesh>
        {/* 正面贴图 */}
        <mesh position={[midX, midY, 1]} renderOrder={1}>
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial
            map={frontTexture}
            transparent={false}
            alphaTest={0.45}
            side={THREE.FrontSide}
            metalness={0.05}
            roughness={0.22}
          />
        </mesh>
        <mesh position={[midX, midY, -0.01]} rotation={[0, Math.PI, 0]} renderOrder={1} castShadow receiveShadow>
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial
            map={backTexture}
            transparent={false}
            alphaTest={0.45}
            side={THREE.FrontSide}
            metalness={0.05}
            roughness={0.28}
          />
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
  const [showSolid, setShowSolid] = useState(false); // 控制实体显示
  const [showParticles, setShowParticles] = useState(true);


  return (
    <>
      
      {/* <Environment 
      preset="city"  // 1. 加载本地文件 (路径对应 public/studio.hdr)
      background={false}   // 2. 隐藏背景图，只保留光照
      
      blur={1}          // 3. 适度模糊，保留柔和反射同时增添透明感
      environmentRotation={[0, 180, 0]}
      environmentIntensity={0}
      /> */}
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
        shadows
        // 1. 关键：开启 alpha 通道，允许透明背景
        gl={{ 
          alpha: true, 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0
        }}
        // 2. 关键：不要设置 scene.background，或者显式设为 null
        onCreated={({ scene }) => {
          scene.background = null; 
        }}
        camera={{ position: [0, 0, 15], fov: 35 }} 
        dpr={1}
        style={{ width: '100%', height: '100%', touchAction: 'none' }}
      >
        {/* <color attach="background" args={['#006414']} /> */}
        <Suspense fallback={null}>
          <BadgeContent {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
}