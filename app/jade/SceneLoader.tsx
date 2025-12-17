'use client'; // 👈 这一行至关重要，标记为客户端组件

import dynamic from 'next/dynamic';
import React from 'react';

// 原来的 dynamic 逻辑移到这里
const Scene = dynamic(() => import('./Scene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-black text-white flex items-center justify-center font-mono">
      Loading 3D Engine...
    </div>
  ),
});

export default function SceneLoader() {
  return <Scene />;
}