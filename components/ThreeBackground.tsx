'use client';

import * as THREE from 'three';
import { useRef, useMemo } from 'react';
import { useFrame, useThree, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';

// 定义配色类型 (和你原本的一样)
type ThemeColors = {
  primary: string;
  secondary: string;
  bottom: string;
};

// 1. 定义 Shader 材质
const BackgroundMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorPrimary: new THREE.Color('#ff00ff'),
    uColorSecondary: new THREE.Color('#00ffff'),
    uColorBottom: new THREE.Color('#6d28d9'),
    uResolution: new THREE.Vector2(1, 1),
  },
  // Vertex Shader (标准的顶点处理)
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader (平滑流动的光源效果)
  `
    uniform float uTime;
    uniform vec3 uColorPrimary;
    uniform vec3 uColorSecondary;
    uniform vec3 uColorBottom;
    uniform vec2 uResolution;
    varying vec2 vUv;

    // 改进的噪声函数 - 用于创建自然的流动感
    float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        
        float a = fract(sin(dot(i, vec2(12.9898, 78.233))) * 43758.5453);
        float b = fract(sin(dot(i + vec2(1.0, 0.0), vec2(12.9898, 78.233))) * 43758.5453);
        float c = fract(sin(dot(i + vec2(0.0, 1.0), vec2(12.9898, 78.233))) * 43758.5453);
        float d = fract(sin(dot(i + vec2(1.0, 1.0), vec2(12.9898, 78.233))) * 43758.5453);
        
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }
    
    // 分形布朗运动 - 创建多层次的噪声
    float fbm(vec2 st) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 2.0;
        
        for(int i = 0; i < 4; i++) {
            value += amplitude * noise(st * frequency);
            frequency *= 2.0;
            amplitude *= 0.5;
        }
        return value;
    }

    void main() {
        vec2 uv = vUv;
        
        // 基础深色背景
        vec3 color = vec3(0.01, 0.01, 0.02);
        
        // --- 创建流动的渐变效果 ---
        
        // 第一层：主色调流动
        vec2 flow1 = uv + vec2(sin(uTime * 0.15 + uv.y * 2.0) * 0.3, cos(uTime * 0.1 + uv.x * 1.5) * 0.2);
        float pattern1 = fbm(flow1 * 2.0 + uTime * 0.1);
        
        // 第二层：次要色调流动
        vec2 flow2 = uv + vec2(cos(uTime * 0.12 - uv.y * 1.5) * 0.25, sin(uTime * 0.18 - uv.x * 2.0) * 0.3);
        float pattern2 = fbm(flow2 * 1.8 - uTime * 0.08);
        
        // 第三层：底色流动
        vec2 flow3 = uv + vec2(sin(uTime * 0.08 + uv.x * 3.0) * 0.2, cos(uTime * 0.13 + uv.y * 2.5) * 0.25);
        float pattern3 = fbm(flow3 * 2.2 + uTime * 0.05);
        
        // 创建平滑的位置权重
        float horizontalGrad = smoothstep(0.0, 0.5, uv.x) * (1.0 - smoothstep(0.5, 1.0, uv.x));
        float verticalGrad = smoothstep(0.0, 0.6, uv.y) * (1.0 - smoothstep(0.4, 1.0, uv.y));
        
        // 混合颜色 - 使用 pattern 和位置创建自然过渡
        vec3 primaryContribution = uColorPrimary * pattern1 * 0.4 * (horizontalGrad + 0.3);
        vec3 secondaryContribution = uColorSecondary * pattern2 * 0.35 * (verticalGrad + 0.3);
        vec3 bottomContribution = uColorBottom * pattern3 * 0.3 * (1.0 - uv.y * 0.7);
        
        // 柔和地混合所有层
        color += primaryContribution;
        color += secondaryContribution;
        color += bottomContribution;
        
        // 添加整体的流动感
        float globalFlow = sin(uTime * 0.2 + uv.x * 3.14159) * cos(uTime * 0.15 + uv.y * 3.14159);
        color *= 1.0 + globalFlow * 0.15;
        
        // 柔和的暗角效果
        float dist = length(uv - 0.5);
        float vignette = 1.0 - smoothstep(0.3, 1.5, dist * 1.2);
        color *= mix(0.7, 1.0, vignette);
        
        // 细微的色彩变化让画面更生动
        color = pow(color, vec3(0.95)); // 轻微的 gamma 校正
        
        gl_FragColor = vec4(color, 1.0);
    }
  `
);

extend({ BackgroundMaterial });

// 声明 JSX 类型，不然 TypeScript 会报错
declare global {
  namespace JSX {
    interface IntrinsicElements {
      backgroundMaterial: any;
    }
  }
}

export default function ThreeBackground({ theme }: { theme: ThemeColors }) {
  const materialRef = useRef<any>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport, camera } = useThree();

  // 实时更新时间和背景尺寸
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.elapsedTime;
    }

    // 根据相机距离动态调整背景平面的尺寸
    if (meshRef.current && camera) {
      const distance = Math.abs(camera.position.z + 10); // +10 是因为背景在 z=-10
      const scale = distance / 10; // 基础缩放比例
      meshRef.current.scale.set(
        viewport.width * scale * 1.5,
        viewport.height * scale * 1.5,
        1
      );
    }
  });

  // 当外部 theme 变化时，平滑过渡颜色可以用 gsap，这里先直接赋值
  useMemo(() => {
    if (materialRef.current) {
      materialRef.current.uColorPrimary.set(theme.primary);
      materialRef.current.uColorSecondary.set(theme.secondary);
      materialRef.current.uColorBottom.set(theme.bottom);
    }
  }, [theme]);

  return (
    //创建一个填满视口的平面
    <mesh ref={meshRef} position={[0, 0, -10]}>
      <planeGeometry />
      {/* @ts-ignore */}
      <backgroundMaterial 
        ref={materialRef} 
        uResolution={[viewport.width, viewport.height]}
        uColorPrimary={theme.primary}
        uColorSecondary={theme.secondary}
        uColorBottom={theme.bottom}
      />
    </mesh>
  );
}