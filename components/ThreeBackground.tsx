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
  // Fragment Shader (核心：复刻 CSS 流光效果)
  `
    uniform float uTime;
    uniform vec3 uColorPrimary;
    uniform vec3 uColorSecondary;
    uniform vec3 uColorBottom;
    uniform vec2 uResolution;
    varying vec2 vUv;

    // 简单的伪随机噪点函数
    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    // 柔和的光斑函数 (模拟 CSS 的 blur)
    float blob(vec2 uv, vec2 position, float size) {
        float d = length(uv - position);
        // 使用指数衰减来模拟高斯模糊效果
        return exp(-d * d / (size * size)); 
    }

    void main() {
        // 修正 UV 比例，防止光斑被拉伸
        vec2 uv = vUv;
        uv.x *= uResolution.x / uResolution.y;

        // 基础底色 (深黑)
        vec3 color = vec3(0.02, 0.02, 0.02);

        // --- 1. 模拟三个流动的光斑 ---
        
        // 主光 (Primary) - 对应 CSS animate-flow-1
        // 运动轨迹：大范围的圆周/正弦运动
        vec2 pos1 = vec2(0.5, 0.5); 
        pos1.x += sin(uTime * 0.3) * 0.4;
        pos1.y += cos(uTime * 0.2) * 0.3;
        // 叠加颜色 (Screen 混合模式在 Shader 里近似于加法)
        color += blob(vUv, pos1, 0.6) * uColorPrimary * 0.4;

        // 副光 (Secondary) - 对应 CSS animate-flow-2
        vec2 pos2 = vec2(0.8, 0.2);
        pos2.x += cos(uTime * 0.4 + 2.0) * 0.4;
        pos2.y += sin(uTime * 0.3 + 1.0) * 0.4;
        color += blob(vUv, pos2, 0.5) * uColorSecondary * 0.35;

        // 底光 (Bottom) - 对应 CSS animate-flow-3
        vec2 pos3 = vec2(0.2, 0.1);
        pos3.x += sin(uTime * 0.25 - 1.0) * 0.5;
        color += blob(vUv, pos3, 0.7) * uColorBottom * 0.3;

        // --- 2. 噪点层 (Noise) ---
        //float noise = random(vUv * 999.0 + uTime); // 动态噪点
        //color += (noise - 0.5) * 0.05; // 叠加微弱的噪点

        // --- 3. 暗角 (Vignette) ---
        float dist = length(vUv - 0.5);
        // 边缘压暗，中心亮
        float vignette = 1.0 - smoothstep(0.3, 1.2, dist);
        color *= vignette;

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
  const { viewport } = useThree();

  // 实时更新时间
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.elapsedTime;
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
    <mesh position={[0, 0, -10]} scale={[viewport.width * 2, viewport.height * 2, 1]}>
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