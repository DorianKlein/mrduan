'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage } from '@react-three/drei';
import { useState, Suspense } from 'react';
import { Play, Pause, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

// 面具数据配置
const masks = [
  {
    id: 'dragon',
    name: '【龙】十二生肖 湘西木质傩面',
    modelPath: '/mask/dragon/dragon_mask.glb',
    imagePath: '/mask/dragon/Nuo_Mask_dragon.jpeg',
    description: '辰龙，十二生肖中唯一的幻想动物，地支的第五位。龙是一个神化了的象征，气宇轩昂，威武智慧，代表着神圣与无上、尊严与强大是不可战胜的，辰时群龙行雨',
  },
  {
    id: 'father',
    name: '湘西木质傩公面具',
    modelPath: '/mask/father/father_mask.glb',
    imagePath: '/mask/father/Nuo_Father_Mask.png',
    description: '傩公面部赤色，浓眉大眼，额部硕大突出，湘西的苗族、土家族、瑶族、侗族、汉族信仰的傩公有多种称谓:东山圣公;东山老人、姜良等，傩公在湘西各民族中广受信仰。',
  },
  {
    id: 'judge',
    name: '【判官】泡桐木质傩面具',
    modelPath: '/mask/judge/judge_mask.glb',
    imagePath: '/mask/judge/Judge_Nuo_Mask.jpg',
    description: '中国民俗阴间官名。长相凶神恶煞，但绝大部分都心地善良、正直，职责是判处人的轮回生死，对坏人进行惩罚，对好人进行奖励。',
  },
  {
    id: 'mother',
    name: '湘西木质傩母面具',
    modelPath: '/mask/mother/mother_mask.glb',
    imagePath: '/mask/mother/Nuo_Mother_Mask.png',
    description: '傩母面部造型有头饰发箍，面部没有过多细节饱满圆润，湘西的苗族、土家族、瑶族、侗族、汉族信仰的傩母有多种称谓:南山圣母;南山小妹、姜妹等，傩母在湘西各民族中广受信仰。',
  },
  {
    id: 'rabbit',
    name: '【兔】十二生肖 湘西木质傩面',
    modelPath: '/mask/rabbit/rabbitmask.glb',
    imagePath: '/mask/rabbit/Nuo_Mask_Rabbit.jpeg',
    description: '卯兔，十二生肖之一，地支的第四位。兔外表温顺可爱，天真活泼、自由好动，平静顺从，落落大方。',
  },
];

// 傩文化介绍内容
const culturePages = [
  {
    title: '何为傩与傩面具？',
    content: '傩：一种古老的驱邪逐疫、祈福纳祥的祭祀仪式，后发展为融合了祭祀、戏剧、舞蹈、音乐的复合性民俗活动。其核心是借助神力来保障生命与社区的安宁。\n\n傩面具：傩事活动中至关重要的神圣法器与角色象征，有"无面不成傩"之说。它是人、神、鬼之间身份转换的媒介，也是傩文化最直观的视觉符号。',
  },
  {
    title: '面具的分类与角色',
    content: '根据所代表角色的神格与职能，傩面具主要分为三类：\n\n正神面具：如傩公、傩母、土地、观音、关羽等，慈眉善目，端庄平和。色彩温和（如红、黄），造型写实，富有亲和力。代表善良与秩序的力量，赐予福祉，安抚人心。\n\n凶神面具：如开山莽将、判官、钟馗、雷公等，狰狞威猛，咄咄逼人。特征为凸目、獠牙、火焰眉、头生尖角，色彩对比强烈，极具视觉冲击力。驱邪者与执行者。\n\n世俗人物面具：如歪嘴秦童、媒婆、和尚、孩童等，诙谐生动，质朴夸张。形象贴近生活，常有滑稽表情，富有戏剧性。',
  },
  {
    title: '傩面具在仪式与表演中的用途',
    content: '傩面具并非静态的工艺品，其生命在于动态的仪式与表演之中。\n\n在傩仪中：通神的法器。佩戴上面具，表演者便不再是凡人，而成为神灵的化身或代言人。所谓"戴上面具是神，摘下面具是人"。\n\n在傩舞中：力量的符号。通过夸张的肢体动作，配合面具造型（如甩头展现獠牙、角），直观演绎原始的力量崇拜与图腾信仰。\n\n在傩戏中：戏剧的角色。面具使戏剧角色形象固定化、符号化，观众一见便知角色身份与性格。',
  },
  {
    title: '造型与结构的核心特征',
    content: '傩面具是凝结了信仰、审美与工艺的立体艺术。\n\n整体形制：多遵循"五岳"（额头、两颧、下巴）突出的人面基本结构，但根据角色进行神化或丑化夸张。\n\n局部构件：眼（凸目/咒眼）象征洞穿阴阳的超凡视力；口（獠牙/巨口）象征力量；眉（火焰眉）象征神力与威严；角模仿猛兽，是力量与通天神性的标志。\n\n色彩：红色代表忠勇、吉祥；黑色代表刚直、威严；白色代表奸诈；蓝绿色代表草莽、强悍。',
  },
  {
    title: '承载的象征意义与文化内涵',
    content: '傩面具是解读古老民族精神世界的一把钥匙。\n\n生命哲学：对繁衍、生存、发展的强烈渴望，体现天人合一的宇宙观。\n\n民族精神：凶神面具反映了在艰苦环境中生存所需的勇猛、强悍的生命力。正神与凶神、美与丑的鲜明对比，承载了朴素的道德评判和"惩恶扬善"的社会教化功能。\n\n文化融合：湘西等地傩面具融合了中原巫傩、楚地巫风、本地土著信仰乃至佛教、道教元素，是文化交融的生动见证。',
  },
  {
    title: '非遗保护与现代传播',
    content: '傩面具文化的保护面临传承人老龄化、仪式语境消失等核心挑战。\n\n传统保护：活态传承（支持传承人授徒表演）、数字化存档（记录技艺与仪式）和生态保护（维系特定文化空间）。\n\n创造性转化：通过文旅融合（融入旅游体验）与文创开发（提取元素设计衍生品），使古老文化融入现代生活。将傩面具的美学精神与现代设计、艺术等领域深度结合，激发其文化基因的当代表达。',
  },
  {
    title: '总结',
    content: '傩面具远不止是一张"脸"，它是一个民族信仰的容器、审美的结晶、历史的记忆和生命的礼赞。了解傩面具，就是开启一扇通往古老而充满活力的精神世界的大门。',
  },
];

// 面具模型组件
function MaskModel({ modelPath }: { modelPath: string }) {
  const { scene } = useGLTF(modelPath);
  
  return (
    <primitive 
      object={scene} 
      scale={2}
    />
  );
}

// 加载提示组件
function LoadingPlaceholder() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#8b4513" wireframe />
    </mesh>
  );
}

export default function MaskPage() {
  const [autoRotate, setAutoRotate] = useState(true);
  const [currentMaskIndex, setCurrentMaskIndex] = useState(0);
  const [showMaskButtons, setShowMaskButtons] = useState(true);
  const [currentCulturePage, setCurrentCulturePage] = useState(0);
  
  const currentMask = masks[currentMaskIndex];
  
  const handlePrevPage = () => {
    setCurrentCulturePage((prev) => (prev > 0 ? prev - 1 : culturePages.length - 1));
  };
  
  const handleNextPage = () => {
    setCurrentCulturePage((prev) => (prev < culturePages.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="w-full h-screen bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
      {/* 右上角自动旋转控制按钮 */}
      <button
        onClick={() => setAutoRotate(!autoRotate)}
        className="absolute top-6 right-6 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-3 transition-all duration-300 group"
        title={autoRotate ? "暂停旋转" : "开始旋转"}
      >
        {autoRotate ? (
          <Pause className="w-6 h-6 text-white" />
        ) : (
          <Play className="w-6 h-6 text-white" />
        )}
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-black/80 text-white text-sm px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {autoRotate ? "暂停旋转" : "开始旋转"}
        </span>
      </button>

      {/* 标题 */}
      <div className="absolute top-4 left-2 right-6 md:top-6 z-10">
        <h1 className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg leading-tight">
          {currentMask.name}
        </h1>
        <p className="text-white/70 mt-1 md:mt-2 text-[10px] sm:text-xs md:text-sm">
          
        </p>
      </div>

      {/* 面具切换按钮 - 标题下方左侧 */}
      <div className="absolute left-6 top-24 sm:top-28 md:top-32 z-10 flex items-center gap-2 md:gap-4">
        {/* 展开/收起按钮 */}
        <button
          onClick={() => setShowMaskButtons(!showMaskButtons)}
          className="w-[35px] h-[35px] md:w-[50px] md:h-[50px] rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-all duration-300 hover:scale-110 flex-shrink-0"
          title={showMaskButtons ? "收起菜单" : "展开菜单"}
        >
          {showMaskButtons ? (
            <X className="w-4 h-4 md:w-6 md:h-6 text-white" />
          ) : (
            <Menu className="w-4 h-4 md:w-6 md:h-6 text-white" />
          )}
        </button>

        {/* 面具选择按钮列表 - 横向排列 */}
        {showMaskButtons && (
          <div className="flex gap-2 md:gap-4 animate-in fade-in slide-in-from-left duration-300">
            {masks.map((mask, index) => (
              <button
                key={mask.id}
                onClick={() => setCurrentMaskIndex(index)}
                className={`relative overflow-hidden rounded-full w-[40px] h-[40px] md:w-[70px] md:h-[70px] flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                  currentMaskIndex === index
                    ? 'ring-2 md:ring-4 ring-amber-500 scale-110 shadow-lg shadow-amber-500/50'
                    : 'ring-1 md:ring-2 ring-white/30 hover:ring-white/60 hover:scale-105'
                }`}
                title={mask.name}
              >
                <Image
                  src={mask.imagePath}
                  alt={mask.name}
                  width={70}
                  height={70}
                  className="object-cover w-full h-full rounded-full"
                />
                {currentMaskIndex === index && (
                  <div className="absolute inset-0 bg-amber-500/20 rounded-full" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3D 场景 */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          className="w-full h-full"
        >
        <Suspense fallback={<LoadingPlaceholder />}>
          {/* 环境光 - 提供基础照明 */}
          <ambientLight intensity={0.5} />
          
          {/* 主光源 - 从右前方照射 */}
          <directionalLight 
            position={[5, 5, 5]} 
            intensity={1.5}
            castShadow
          />
          
          {/* 补光 - 从左侧照射，减少阴影 */}
          <directionalLight 
            position={[-5, 3, -5]} 
            intensity={0.8}
          />
          
          {/* 顶光 - 增强立体感 */}
          <pointLight 
            position={[0, 5, 0]} 
            intensity={0.5}
            distance={10}
          />
          
          {/* 舞台灯光 */}
          <Stage
            intensity={1}
            environment="city"
            shadows={{
              type: 'accumulative',
              bias: -0.001,
              intensity: Math.PI,
            }}
            adjustCamera={false}
          >
            <MaskModel modelPath={currentMask.modelPath} />
          </Stage>

          {/* 轨道控制器 - 支持手动旋转和缩放 */}
          <OrbitControls
            autoRotate={autoRotate}
            autoRotateSpeed={2}
            enableZoom={true}
            enablePan={false}
            minDistance={2}
            maxDistance={10}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
          />
        </Suspense>
      </Canvas>
      </div>

      {/* 底部信息面板 */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/95 via-black/85 to-transparent backdrop-blur-sm max-h-[40vh] overflow-hidden">
        {/* 当前面具介绍 */}
        <div className="px-3 md:px-6 py-2 md:py-3 border-b border-white/10">
          <h3 className="text-white font-semibold text-xs md:text-base mb-1">
            面具介绍
          </h3>
          <p className="text-white/80 text-[10px] md:text-sm leading-relaxed line-clamp-2 md:line-clamp-3">
            {currentMask.description}
          </p>
        </div>

        {/* 傩文化知识翻页板块 - 固定高度 */}
        <div className="px-3 md:px-6 py-2 md:py-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-semibold text-xs md:text-base truncate pr-2">
              {culturePages[currentCulturePage].title}
            </h3>
            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
              <button
                onClick={handlePrevPage}
                className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                title="上一页"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </button>
              <span className="text-white/60 text-[10px] md:text-xs whitespace-nowrap">
                {currentCulturePage + 1}/{culturePages.length}
              </span>
              <button
                onClick={handleNextPage}
                className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                title="下一页"
              >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </button>
            </div>
          </div>
          <div className="text-white/70 text-[10px] md:text-sm leading-relaxed whitespace-pre-line h-20 md:h-28 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent pr-1">
            {culturePages[currentCulturePage].content}
          </div>
        </div>
      </div>
    </div>
  );
}

// 预加载所有模型
masks.forEach(mask => {
  useGLTF.preload(mask.modelPath);
});
