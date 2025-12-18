'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
// 引入采样器，用于生成海量粒子
import { MeshSurfaceSampler } from 'three-stdlib';

import { useHandTracking } from '@/components/jade/shared/useHandTracking';
import CameraPreview from '@/components/jade/shared/CameraPreview';

// --- Vertex Shader ---
const vertexShader = `
  uniform float uExplosion;
  attribute vec3 aRandom;
  varying vec3 vColor;
  
  void main() {
    // 【改动1】初始位置缩小
    // position * 0.92 让粒子云的初始体积比实物模型小一圈
    // 这样在没爆炸时，粒子会完全藏在实物里面
    vec3 pos = position * 0.95;
    
    // 爆炸逻辑
    vec3 direction = normalize(position) * aRandom; 
    float angle = uExplosion * 3.0 * aRandom.x;
    float s = sin(angle);
    float c = cos(angle);
    mat2 rot = mat2(c, -s, s, c);
    pos.xy = rot * pos.xy;
    
    // 移动位置
    pos += direction * uExplosion * 3.0;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    // 【改动2】调整粒子大小
    // 因为数量增加了，单个粒子最好改小一点(1.5)，否则会糊成一团
    gl_PointSize = (1.5 * (1.0 - uExplosion * 0.3)) * (10.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    
    // 颜色逻辑 (保持玉石色调)
    vec3 colorDeep = vec3(0.0, 0.35, 0.25);
    vec3 colorPale = vec3(0.2, 0.5, 0.4);
    vColor = mix(colorDeep, colorPale, aRandom.y);
    vColor += aRandom.z * 0.1; 
  }
`;

// --- Fragment Shader (保持不变) ---
const fragmentShader = `
  varying vec3 vColor;
  uniform float uExplosion;
  void main() {
    if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.5) discard;
    // 稍微降低一点透明度，因为粒子变多了，叠加起来会很亮
    float alpha = 0.4 * (1.0 - uExplosion * 0.8);
    gl_FragColor = vec4(vColor * 1.5, alpha);
  }
`;

function JadeModel({ data }: { data: { explosion: number, rotation: number } }) {
  const { nodes } = useGLTF('/jade-stone.glb');
  
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>>(null);

  // 1. 提取原始 Mesh
  const originalMesh = useMemo(() => {
    const foundMesh = Object.values(nodes).find((n) => n instanceof THREE.Mesh) as THREE.Mesh;
    if (foundMesh) {
      if (foundMesh.geometry) foundMesh.geometry.center(); 
      // 开启透明材质支持
      if (foundMesh.material) {
        const mats = Array.isArray(foundMesh.material) ? foundMesh.material : [foundMesh.material];
        mats.forEach(mat => {
            mat.transparent = true;
        });
      }
    }
    return foundMesh;
  }, [nodes]);

  // 2. Shader 参数
  const shaderArgs = useMemo(() => ({
    uniforms: { uExplosion: { value: 0 } },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  }), []);

  // 3. 【核心改动】使用 Sampler 生成海量粒子
  const particleGeometry = useMemo(() => {
    if (!originalMesh || !originalMesh.geometry) return null;
    
    // 定义粒子数量 (例如 20,000 个)
    const particleCount = 20000;
    
    // 创建采样器
    const sampler = new MeshSurfaceSampler(originalMesh).build();
    
    // 创建数据数组
    const positions = new Float32Array(particleCount * 3);
    const randoms = new Float32Array(particleCount * 3);
    
    // 临时变量
    const tempPosition = new THREE.Vector3();
    
    for (let i = 0; i < particleCount; i++) {
      // 在模型表面随机采样一个点
      sampler.sample(tempPosition);
      
      // 存入位置数组
      positions[i * 3] = tempPosition.x;
      positions[i * 3 + 1] = tempPosition.y;
      positions[i * 3 + 2] = tempPosition.z;
      
      // 生成随机属性
      randoms[i * 3] = Math.random();     // x: 用于旋转/方向噪点
      randoms[i * 3 + 1] = Math.random(); // y: 用于颜色混合
      randoms[i * 3 + 2] = Math.random(); // z: 用于亮度噪点
    }
    
    // 构建 Geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 3));
    
    return geometry;
  }, [originalMesh]);

  // 4. 动画循环
  useFrame(() => {
    if (!groupRef.current) return;

    // 旋转
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      data.rotation,
      0.1
    );

    // 粒子爆炸
    if (pointsRef.current) {
      pointsRef.current.material.uniforms.uExplosion.value = THREE.MathUtils.lerp(
        pointsRef.current.material.uniforms.uExplosion.value,
        data.explosion,
        0.1
      );
    }

    // 实物消失
    if (originalMesh && originalMesh.material) {
      const targetOpacity = 1.0 - data.explosion;
      const mats = Array.isArray(originalMesh.material) ? originalMesh.material : [originalMesh.material];
      mats.forEach((mat) => {
        const stdMat = mat as THREE.MeshStandardMaterial;
        stdMat.opacity = THREE.MathUtils.lerp(stdMat.opacity, targetOpacity, 0.1);
        stdMat.visible = stdMat.opacity > 0.01;
      });
    }
  });

  if (!originalMesh || !particleGeometry) return null;

  return (
    <group ref={groupRef}>
      {/* 实物模型 */}
      <mesh 
        geometry={originalMesh.geometry} 
        material={originalMesh.material}
        scale={[1, 1, 1]} 
      />

      {/* 粒子模型 */}
      <points ref={pointsRef} geometry={particleGeometry}>
        <shaderMaterial attach="material" args={[shaderArgs]} />
      </points>
    </group>
  );
}


// --- 主组件 ---
export default function Scene() {
  // 从 Hook 中获取 stream
  const { cameraStream, ...controls } = useHandTracking();

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      {/* 左上角提示 */}
      <div className="absolute top-5 left-5 text-white z-10 font-mono pointer-events-none select-none">
        <h1 className="text-xl font-bold">岫岩玉雕</h1>
        <p>🤏 拇指食指捏和/张开 缩放粒子</p>
        <p>手指滑动旋转</p>
        <div className="mt-2 text-xs opacity-50">
           Explosion: {controls.explosion.toFixed(2)} <br/>
           Rotation: {controls.rotation.toFixed(2)} rad
        </div>
      </div>

      {/* 右下角相机预览 (新增) */}
      <CameraPreview stream={cameraStream} />

      <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
        <color attach="background" args={['#050505']} />
        
        {/* 这里只传 controls 数据给模型，不传 stream */}
        <JadeModel data={controls} />
        
        <OrbitControls makeDefault enableRotate={false} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}