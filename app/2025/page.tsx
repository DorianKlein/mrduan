"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Play, Pause, Rewind, FastForward, Music2, Camera } from "lucide-react";

// 烟花组件
const Fireworks = () => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const colors = [
    { main: '#ff0080', glow: 'rgba(255, 0, 128, 0.6)' },
    { main: '#00ffff', glow: 'rgba(0, 255, 255, 0.6)' },
    { main: '#ffd700', glow: 'rgba(255, 215, 0, 0.6)' },
    { main: '#ff6b35', glow: 'rgba(255, 107, 53, 0.6)' },
    { main: '#ff00ff', glow: 'rgba(255, 0, 255, 0.6)' },
    { main: '#00ff88', glow: 'rgba(0, 255, 136, 0.6)' }
  ];

  const fireworksData = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: 15 + Math.random() * 70, // 15-85%
    delay: i * 0.8 + Math.random() * 1.5,
    duration: 1.5,
    y: 15 + Math.random() * 40, // 15-55%
    colorSet: colors[Math.floor(Math.random() * colors.length)],
    size: 0.8 + Math.random() * 0.4 // 0.8-1.2
  }));
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {fireworksData.map((fw) => (
        <div key={fw.id}>
          {/* 上升轨迹 */}
          <motion.div
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${fw.x}%`,
              background: fw.colorSet.main,
              boxShadow: `0 0 8px ${fw.colorSet.glow}`
            }}
            initial={{ top: '100%', opacity: 0 }}
            animate={{
              top: `${fw.y}%`,
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: fw.duration,
              delay: fw.delay,
              repeat: Infinity,
              repeatDelay: 8,
              ease: "easeOut"
            }}
          />
          
          {/* 爆炸效果 */}
          <motion.div
            className="absolute"
            style={{
              left: `${fw.x}%`,
              top: `${fw.y}%`
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, fw.size],
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              duration: 2,
              delay: fw.delay + fw.duration,
              repeat: Infinity,
              repeatDelay: 8,
              ease: "easeOut",
              times: [0, 0.3, 0.7, 1]
            }}
          >
            {/* 中心光晕 */}
            <div 
              className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full blur-md"
              style={{
                background: `radial-gradient(circle, ${fw.colorSet.main}, transparent)`,
              }}
            />
            
            {/* 放射线 */}
            {Array.from({ length: 20 }).map((_, idx) => {
              const angle = (360 / 20) * idx;
              const length = 80 + Math.random() * 50;
              return (
                <motion.div
                  key={idx}
                  className="absolute origin-left"
                  style={{
                    width: `${length}px`,
                    height: '2px',
                    left: 0,
                    top: 0,
                    rotate: angle,
                    background: `linear-gradient(90deg, ${fw.colorSet.main}, transparent)`,
                    boxShadow: `0 0 4px ${fw.colorSet.glow}`
                  }}
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{
                    scaleX: [0, 1],
                    opacity: [0, 1, 1, 0]
                  }}
                  transition={{
                    duration: 1.8,
                    delay: fw.delay + fw.duration + idx * 0.015,
                    repeat: Infinity,
                    repeatDelay: 8,
                    ease: "easeOut",
                    times: [0, 0.3, 0.7, 1]
                  }}
                />
              );
            })}
            
            {/* 粒子效果 */}
            {Array.from({ length: 12 }).map((_, idx) => {
              const angle = (360 / 12) * idx;
              const distance = 200 + Math.random() * 100;
              const particleX = Math.cos(angle * Math.PI / 180) * distance;
              const particleY = Math.sin(angle * Math.PI / 180) * distance;
              
              return (
                <motion.div
                  key={`p${idx}`}
                  className="absolute w-1 h-1 rounded-full"
                  style={{
                    background: fw.colorSet.main,
                    boxShadow: `0 0 4px ${fw.colorSet.glow}`
                  }}
                  initial={{ x: 0, y: 0, opacity: 0 }}
                  animate={{
                    x: particleX,
                    y: particleY,
                    opacity: [0, 1, 1, 0],
                    scale: [1, 0.5]
                  }}
                  transition={{
                    duration: 2.2,
                    delay: fw.delay + fw.duration + 0.2,
                    repeat: Infinity,
                    repeatDelay: 8,
                    ease: "easeOut",
                    times: [0, 0.3, 0.7, 1]
                  }}
                />
              );
            })}
          </motion.div>
        </div>
      ))}
    </div>
  );
};

// 定义 Track 类型
type Track = {
  id: string;
  month: string;
  title: string;
  bpm: number;
  desc: string;
  color: string;
  images: string[]; // 图片路径数组
  captions: string[]; // 图片配文
};

// 模拟你的 2025 "Tracklist" 数据
// ⚠️ 请确保在 public/2025/ 目录下放入对应的图片，或者替换为网络图片 URL
const tracks: Track[] = [
  {
    id: "01",
    month: "JAN",
    title: "一月——回家",
    bpm: 120,
    desc: "倒数着回家的日子",
    color: "from-blue-500 to-cyan-400",
    images: ["/2025pictures/1-1.jpg", "/2025pictures/1-2.jpg", "/2025pictures/1-3.jpg", "/2025pictures/1-4.jpg"], // 替换你的图片路径
    captions: ["年底项目交付会", "凌晨5点跟我姐回家", "芥末虾球首秀", "我姐真想出片"]
  },
  {
    id: "02",
    month: "Feb",
    title: "二月——无聊",
    bpm: 138,
    desc: "滑雪？是雪地导弹！",
    color: "from-emerald-400 to-green-500",
    images: ["/2025pictures/2-1.jpg", "/2025pictures/2-2.jpg"],
    captions: ["我弟的单板真是第一次", "还挺惬意的"]
  },
  {
    id: "03",
    month: "Mar",
    title: "三月——我是真想喝酒",
    bpm: 175,
    desc: "酒鬼挑战回家丢了对儿核桃！再也不盘核桃了",
    color: "from-pink-500 to-rose-500",
    images: ["/2025pictures/3-1.jpg", "/2025pictures/3-2.jpg","/2025pictures/3-3.jpg", "/2025pictures/3-4.jpg"],
    captions: ["打卡通关", "这酒啥味儿来着？", "这个又啥味儿来着？", "就在他家丢的核桃"]
  },
  {
    id: "04",
    month: "Apr",
    title: "四月——忙里偷偷偷偷闲",
    bpm: 90,
    desc: "四月是你的谎言",
    color: "from-orange-400 to-amber-500",
    images: ["/2025pictures/4-1.jpg", "/2025pictures/4-2.jpg"],
    captions: ["嘎嘎嘎", "打卡颐和园"]
  },
  {
    id: "05",
    month: "May",
    title: "五月——查无此月",
    bpm: 90,
    desc: "我五月干啥了？一张照片都没有",
    color: "from-rose-100 to-white-500",
    images: [],
    captions: []
  },
  {
    id: "06",
    month: "Jun",
    title: "六月——工地之旅",
    bpm: 125,
    desc: "第一次去内蒙，还造的灰头土脸的",
    color: "from-purple-500 to-indigo-500",
    images: ["/2025pictures/6-1.jpg", "/2025pictures/6-2.jpg", "/2025pictures/6-3.jpg"],
    captions: ["工地小段", "真工地", "夕阳无限好"]
  },
  {
    id: "07",
    month: "Jul",
    title: "七月——东北的夏天",
    bpm: 140,
    desc: "夏天还是东北舒服",
    color: "from-yellow-400 to-orange-300",
    images: ["/2025pictures/7-1.jpg", "/2025pictures/7-2.jpg", "/2025pictures/7-3.jpg", "/2025pictures/7-4.jpg"],
    captions: ["突发奇想的低曝光", "炸板儿面！", "舒服舒服", "燕子哥也热"]
  },
  {
    id: "08",
    month: "Aug",
    title: "八月——化身调酒师",
    bpm: 110,
    desc: "整点儿酒喝喝呢",
    color: "from-teal-500 to-cyan-500",
    images: ["/2025pictures/8-1.jpg", "/2025pictures/8-2.jpg", "/2025pictures/8-3.jpg", "/2025pictures/8-4.jpg"],
    captions: ["深夜西梅", "暮色之约", "蓝白情书", "龙舌兰日落"]
  },
  {
    id: "09",
    month: "Sep",
    title: "九月——继续调调调",
    bpm: 130,
    desc: "咋都不好喝呢，抖音网红酒没一个好喝的",
    color: "from-red-500 to-pink-400",
    images: ["/2025pictures/9-1.jpg", "/2025pictures/9-2.jpg", "/2025pictures/9-3.jpg", "/2025pictures/9-4.jpg"],
    captions: ["占有欲", "薄荷微风", "曦光", "思念"]
  },
  {
    id: "10",
    month: "Oct",
    title: "十月——路口",
    bpm: 115,
    desc: "在生活中挣扎，找到光的方向",
    color: "from-violet-500 to-purple-400",
    images: ["/2025pictures/10-1.jpg", "/2025pictures/10-2.jpg"],
    captions: ["花少“不可思议”我真爱", "叶子给路灯穿上了秋衣"]
  },
  {
    id: "11",
    month: "Nov",
    title: "十一月——北京",
    bpm: 105,
    desc: "是我即将离开的北京",
    color: "from-sky-500 to-blue-400",
    images: ["/2025pictures/11-1.jpg", "/2025pictures/11-2.jpg"],
    captions: ["去见客户", "加班到深夜的街头"]
  },
  {
    id: "12",
    month: "Dec",
    title: "十二月——张昊桐",
    bpm: 8023,
    desc: "一次浪漫的邂逅，故事才刚刚开始...",
    color: "from-fuchsia-500 to-pink-400",
    images: ["/2025pictures/12-1.jpg"],
    captions: ["出门见喜"]
  }
];

export default function Mix2025() {
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // 自动播放音乐
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(err => {
        console.log("自动播放失败，需要用户交互:", err);
      });
      setIsPlaying(true);
    }
  }, []);
  
  // 滚动动效钩子
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // 黑胶唱片旋转控制
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360 * 4]);

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white font-sans selection:bg-pink-500 selection:text-white pb-32">
      
      {/* 背景音乐 */}
      <audio ref={audioRef} src="/2025pictures/music.mp3" loop />
      
      {/* 顶部导航 */}
      <nav className="fixed top-0 left-0 w-full p-6 z-50 flex justify-between items-center mix-blend-difference">
        <a href="/" className="text-sm font-bold tracking-widest hover:text-pink-500 transition-colors">MRDUAN.ME</a>
        <div className="flex items-center gap-2 text-sm font-mono">
           <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-neutral-500'}`}></div>
           REC 00:20:25
        </div>
      </nav>

      {/* Hero Section */}
      <section className="h-screen flex flex-col justify-center items-center relative overflow-hidden sticky top-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-800 via-black to-black opacity-50" />
        
        {/* 动态背景噪点 (可选优化) */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

        <motion.div 
          style={{ rotate: isPlaying ? rotate : 0 }}
          animate={{ rotate: isPlaying ? 360 : 0 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatType: "loop" }}
          className="relative z-10 w-[280px] h-[280px] md:w-[450px] md:h-[450px] rounded-full border-2 border-neutral-800 bg-neutral-900 shadow-[0_0_100px_rgba(255,255,255,0.1)] flex items-center justify-center bottom-10"
        >
            {/* 唱片纹理 */}
            {[1, 2, 3].map((i) => (
                <div key={i} className={`absolute inset-${i * 8} rounded-full border border-neutral-800 opacity-30`} />
            ))}
            
            {/* 唱片封面 */}
            <div className="w-1/3 h-1/3 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
                <span className="relative font-bold text-white text-xl md:text-2xl drop-shadow-md">2025</span>
            </div>
        </motion.div>

        <div className="absolute bottom-32 md:bottom-40 z-20 text-center space-y-2 mix-blend-screen">
            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-white"
            >
                年 终·总 结
            </motion.h1>
            <p className="text-neutral-400 font-mono text-sm md:text-base tracking-[0.2em]">A YEAR IN REVIEW</p>
        </div>
      </section>

      {/* Tracklist / Timeline Section */}
      <section className="relative z-20 bg-black/90 backdrop-blur-md">
        {tracks.map((track, index) => (
          <motion.div 
            key={track.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="min-h-screen md:min-h-[80vh] flex flex-col justify-center py-20 px-6 md:px-24 border-t border-neutral-800/50 group relative"
          >
            {/* 12月份显示烟花效果 */}
            {track.id === '12' && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 1 }}
              >
                <Fireworks />
              </motion.div>
            )}
            
            {/* 头部信息 */}
            <div className="flex items-center space-x-4 text-neutral-500 font-mono text-sm mb-6">
                <span className="opacity-50">{track.id}</span>
                <span className="w-8 h-[1px] bg-neutral-700"></span>
                <span>{track.month}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] border border-current text-white/50`}>
                    BPM {track.bpm}
                </span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-start">
                {/* 左侧：文字内容 */}
                <div className="space-y-6">
                    <h2 className={`text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${track.color} leading-tight`}>
                    {track.title}
                    </h2>
                    
                    <p className="text-lg md:text-xl text-neutral-300 leading-relaxed font-light">
                    {track.desc}
                    </p>

                    {/* 装饰性的 metadata */}
                    <div className="pt-8 flex gap-4">
                        <div className="flex items-center gap-2 text-neutral-600 text-sm">
                            <Music2 size={16} />
                            <span>Mood: Energetic</span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-600 text-sm">
                            <Camera size={16} />
                            <span>Shots: {track.images.length}</span>
                        </div>
                    </div>
                </div>

                {/* 右侧：照片展示 (拍立得风格) */}
                <div className="relative h-[300px] md:h-[500px] w-full mt-8 md:mt-0 perspective-1000">
                    {track.images.map((img, imgIndex) => {
                        // 为每张照片定义不同的位置和旋转角度
                        const positions = [
                            { top: '0', left: '35%', rotate: -8 },
                            { top: '10px', left: '40%', rotate: 5 },
                            { top: '60px', left: '50%', rotate: -5 },
                            { top: '70px', left: '53%', rotate: 8 }
                        ];
                        const pos = positions[imgIndex % 4];
                        
                        return (
                            <motion.div
                                key={imgIndex}
                                initial={{ 
                                    rotate: pos.rotate, 
                                    scale: 0.9 
                                }}
                                whileHover={{ 
                                    rotate: 0, 
                                    scale: 1.1, 
                                    zIndex: 50,
                                    transition: { type: "spring", stiffness: 300 } 
                                }}
                                style={{
                                    top: pos.top,
                                    left: pos.left
                                }}
                                className="absolute w-56 md:w-72 p-3 bg-white shadow-2xl transform-gpu transition-all duration-300"
                            >
                                {/* 照片容器 */}
                                <div className="aspect-square bg-neutral-200 overflow-hidden mb-3 relative">
                                    {/* 如果没有真实图片，用色块代替测试 */}
                                    <div className="absolute inset-0 bg-neutral-800"></div> 
                                    <img 
                                        src={img} 
                                        alt={track.captions[imgIndex]} 
                                        className="relative object-cover w-full h-full transition-all duration-500 z-10"
                                        // 容错处理：如果图片挂了显示占位图
                                        onError={(e) => {
                                            e.currentTarget.src = `https://picsum.photos/400/400?random=${index}${imgIndex}`
                                        }}
                                    />
                                </div>
                                <div className="font-mono text-xs text-neutral-500 text-center tracking-wide uppercase">
                                    {track.captions[imgIndex]}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* 底部播放器 (保持不变，微调样式) */}
      <div className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-xl border-t border-white/5 p-4 z-50">
        <div className="w-full flex justify-between items-center px-6">
          <div className="flex items-center space-x-4">
              <div className="hidden md:block w-12 h-12 bg-gradient-to-br from-pink-500 to-violet-600 rounded shadow-lg animate-pulse" />
              <div className="overflow-hidden">
                  <div className="text-sm font-bold text-white truncate">Year 2025 - The Master Mix</div>
                  <div className="text-xs text-neutral-500 truncate">Mr. Duan • 4 Tracks</div>
              </div>
          </div>
          
          <div className="flex items-center space-x-8 absolute left-1/2 -translate-x-1/2">
              <Rewind size={24} className="text-neutral-500 hover:text-white cursor-pointer transition-colors" />
              <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-14 h-14 bg-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                  {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
              </button>
              <FastForward size={24} className="text-neutral-500 hover:text-white cursor-pointer transition-colors" />
          </div>
          
          <div className="hidden md:flex items-center space-x-3">
              <span className="text-[10px] font-mono text-neutral-500">VOL</span>
              <div className="h-1 w-24 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full w-[80%] bg-white/50" />
              </div>
          </div>
        </div>
      </div>

    </div>
  );
}