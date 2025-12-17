'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useHandTracking } from './useHandTracking';

// --- 完整的 Vertex Shader (顶点着色器) ---
const vertexShader = `
  uniform float uExplosion;
  attribute vec3 aRandom;
  varying vec3 vColor;
  
  void main() {
    // 原始位置
    vec3 pos = position;
    
    // 爆炸逻辑: 沿着法线方向或者随机方向扩散
    vec3 direction = normalize(position) * aRandom; 
    
    // 增加一点旋转扭曲感
    float angle = uExplosion * 3.0 * aRandom.x;
    float s = sin(angle);
    float c = cos(angle);
    mat2 rot = mat2(c, -s, s, c);
    pos.xy = rot * pos.xy;

    // 移动位置
    pos += direction * uExplosion * 3.0;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    // 粒子大小随爆炸减小
    gl_PointSize = (4.0 * (1.0 - uExplosion * 0.5)) * (10.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    
    // 传递颜色
    vColor = mix(vec3(0.1, 0.6, 0.4), vec3(0.8, 1.0, 0.9), aRandom.y);
  }
`;

// --- 完整的 Fragment Shader (片元着色器) ---
const fragmentShader = `
  varying vec3 vColor;
  uniform float uExplosion;

  void main() {
    // 圆形粒子裁切
    if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.5) discard;
    
    // 随着爆炸透明度降低
    float alpha = 1.0 - uExplosion;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

// --- 玉石模型组件 ---
function JadeModel({ data }: { data: { explosion: number, rotation: number } }) {
  const { nodes } = useGLTF('/jade-stone.glb'); 
  
  // 指定 Ref 类型为 Points，包含 BufferGeometry 和 ShaderMaterial
  const pointsRef = useRef<THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>>(null);

  // 查找 Mesh
  const mesh = useMemo(() => {
    const foundMesh = Object.values(nodes).find((n) => n instanceof THREE.Mesh);
    return foundMesh as THREE.Mesh;
  }, [nodes]);

  // Shader 参数
  const shaderArgs = useMemo(() => ({
    uniforms: {
      uExplosion: { value: 0 }
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  }), []);

  // 生成几何体
  const geometry = useMemo(() => {
    if (!mesh || !mesh.geometry) return null;
    const geo = mesh.geometry.clone();
    geo.center();
    const count = geo.attributes.position.count;
    const randoms = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      randoms[i] = Math.random(); 
    }
    geo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 3));
    return geo;
  }, [mesh]);

  // 动画帧循环
  useFrame(() => {
    if (pointsRef.current) {
      // 1. 爆炸插值
      pointsRef.current.material.uniforms.uExplosion.value = THREE.MathUtils.lerp(
        pointsRef.current.material.uniforms.uExplosion.value,
        data.explosion,
        0.1
      );

      // 2. 旋转插值
      pointsRef.current.rotation.y = THREE.MathUtils.lerp(
        pointsRef.current.rotation.y,
        data.rotation,
        0.1
      );
    }
  });

  if (!geometry) return null;

  return (
    <points ref={pointsRef} geometry={geometry}>
      <shaderMaterial attach="material" args={[shaderArgs]} />
    </points>
  );
}

// --- 主场景组件 ---
export default function Scene() {
  const controls = useHandTracking();

  return (
    <div className="w-full h-screen bg-black relative">
      <div className="absolute top-5 left-5 text-white z-10 font-mono pointer-events-none select-none">
        <h1 className="text-xl font-bold">Jade Interactive</h1>
        <p>拇指食指控制收拢与爆炸</p>
        <p>移动手指旋转</p>
        <div className="mt-2 text-xs opacity-50">
           Explosion: {controls.explosion.toFixed(2)} <br/>
           Rotation: {controls.rotation.toFixed(2)} rad
        </div>
      </div>

      <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
        <color attach="background" args={['#050505']} />
        
        <JadeModel data={controls} />
        
        {/* 禁用 OrbitControls 旋转，防止冲突，保留缩放 */}
        <OrbitControls makeDefault enableRotate={false} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}