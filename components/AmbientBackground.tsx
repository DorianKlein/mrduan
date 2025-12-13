'use client';

// 定义配色方案类型
type ThemeColors = {
  primary: string;   // 主光 (对角线)
  secondary: string; // 副光 (交叉线)
  bottom: string;    // 底光 (氛围)
};

// 🎨 配色配置表
const themes: Record<string, ThemeColors> = {
  // 1. 黑金传说：奢华、尊贵、纪念意义
  gold: {
    primary: '#d97706',   // 琥珀金
    secondary: '#fbbf24', // 亮金
    bottom: '#78350f',    // 深褐金
  },
  // 2. 深海数据：冷静、极客、代码
  ocean: {
    primary: '#0ea5e9',   // 天空蓝
    secondary: '#22d3ee', // 赛博青
    bottom: '#1e3a8a',    // 深海蓝
  },
  // 3. 赤红余烬：热血、能量、警告
  crimson: {
    primary: '#dc2626',   // 猩红
    secondary: '#f97316', // 橘红
    bottom: '#7f1d1d',    // 干涸血红
  },
  // 4. 赛博霓虹 (你之前的默认款)
  neon: {
    primary: '#ff00ff',   // 品红
    secondary: '#00ffff', // 青色
    bottom: '#6d28d9',    // 紫色
  }
};

export default function AmbientBackground() {
  
  // 👇👇👇 在这里切换主题！可选: 'gold' | 'ocean' | 'crimson' | 'neon'
  const currentTheme = 'neon'; 

  const colors = themes[currentTheme];

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none bg-[#050505] -z-10">
      
      {/* --- 第一层：流光层 (暗场参数) --- */}
      
      {/* ✨ 主光 (Flow 1) */}
      <div 
        className="absolute -top-[50%] -left-[50%] w-[200%] h-[80%] 
                   mix-blend-screen opacity-20 blur-[160px] animate-flow-1"
        style={{ backgroundColor: colors.primary }}
      />
      
      {/* ✨ 副光 (Flow 2) */}
      <div 
        className="absolute top-[20%] -right-[60%] w-[180%] h-[70%] 
                   mix-blend-screen opacity-20 blur-[180px] animate-flow-2"
        style={{ backgroundColor: colors.secondary }}
      />
      
      {/* ✨ 底光 (Flow 3) */}
      <div 
        className="absolute -bottom-[40%] left-[10%] w-[150%] h-[60%] 
                   mix-blend-screen opacity-30 blur-[150px] animate-flow-3"
        style={{ backgroundColor: colors.bottom }}
      />


      {/* --- 第二层：压暗遮罩 (保持不变) --- */}
      
      {/* 上下渐变 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/90 via-transparent to-[#050505]/90" />
      
      {/* 四周暗角 (Vignette) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_100%)] opacity-80" />


      {/* --- 第三层：纹理层 --- */}
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'}}></div>
    </div>
  );
}