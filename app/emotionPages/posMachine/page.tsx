'use client';

import React, { useState, useEffect, useRef } from 'react';

// 随机触发扣减内耗的互动文案库
const CONSUME_ITEMS = [
  { title: '忍住不发火', count: 'x3', baseCost: 3500 },
  { title: '假装听懂老板画大饼', count: 'x1', baseCost: 5200 },
  { title: '早八与被窝生离死别', count: 'x1', baseCost: 6800 },
  { title: '克制翻白眼冲动', count: 'x10', baseCost: 4600 },
  { title: '下班路上被踩脚没吭声', count: 'x2', baseCost: 3200 },
  { title: '硬听废话 45 分钟', count: 'x1', baseCost: 5800 },
  { title: '收到微信“在吗”心梗瞬间', count: 'x2', baseCost: 4200 },
  { title: '假装情绪极其稳定', count: 'x5', baseCost: 4800 },
  { title: '向不专业的人耐心解释', count: 'x3', baseCost: 5500 },
  { title: '深夜网抑云独自疗愈', count: 'x1', baseCost: 6200 },
  { title: '被迫参与毫无意义的无效寒暄', count: 'x4', baseCost: 3900 },
  { title: '强行挤出打工人职业微笑', count: 'x8', baseCost: 4500 },
  { title: '看到消息却不知道怎么回复', count: 'x6', baseCost: 4100 },
  { title: '会议上点头但完全没听懂', count: 'x2', baseCost: 5700 },
  { title: '把“收到”改成更体面的措辞', count: 'x5', baseCost: 2800 },
  { title: '排队时前面的人临时找东西', count: 'x3', baseCost: 3300 },
  { title: '想辞职但又默默打开电脑', count: 'x1', baseCost: 7600 },
  { title: '周日晚上提前焦虑星期一', count: 'x4', baseCost: 6400 },
  { title: '为了合群硬笑了三分钟', count: 'x7', baseCost: 3600 },
  { title: '看到群聊未读但不敢点开', count: 'x9', baseCost: 4300 },
  { title: '被临时拉进完全陌生的会议', count: 'x2', baseCost: 6100 },
  { title: '精心准备的发言最后没有机会说', count: 'x1', baseCost: 7200 },
  { title: '外卖备注被完全忽略', count: 'x2', baseCost: 2500 },
  { title: '打开购物车又默默全部删除', count: 'x5', baseCost: 3000 },
  { title: '电梯关门前和同事对视', count: 'x3', baseCost: 2700 },
  { title: '努力保持礼貌但内心已经报警', count: 'x8', baseCost: 5100 },
  { title: '打字五分钟最后只发了一个“哈哈”', count: 'x4', baseCost: 4700 },
  { title: '被迫解释自己并没有生气', count: 'x3', baseCost: 5400 },
  { title: '假装没看见熟人在街上绕路', count: 'x2', baseCost: 3800 },
  { title: '想起三年前的尴尬瞬间', count: 'x10', baseCost: 4900 },
  { title: '睡前突然复盘白天所有对话', count: 'x6', baseCost: 5900 },
];

// 小票兑换的真实情绪奖励商品
const REWARD_ITEMS = [
  { name: '全糖奶茶热量豁免权', note: '直接转化为纯粹多巴胺，零脂肪吸收', val: '1 份' },
  { name: '今晚早睡 1 小时抵用券', note: '手机砸脸前自主进入深睡状态', val: '1 张' },
  { name: '非紧急工作金钟罩', note: '下班自动开启已读不回结界，免疫一切@所有人', val: '永久' },
  { name: '心平气和自愈能量', note: '允许一切发生，看淡一切破事', val: '88,888 元' },
  { name: '合法摆烂整天特许令', note: '卸下所有功利心，做一个快乐无害的盆栽', val: '1 张' },
];

export default function Page() {
  // 待消费金额（十万至五十万随机：100,000 ~ 500,000 元）
  const [initialPoints, setInitialPoints] = useState<number>(0);
  const [currentPoints, setCurrentPoints] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isSwiping, setIsSwiping] = useState<boolean>(false);
  const [isAutoSwiping, setIsAutoSwiping] = useState<boolean>(false);
  
  // 记录消耗的历史明细
  const [consumedHistory, setConsumedHistory] = useState<
    Array<{ id: number; title: string; count: string; amount: number }>
  >([]);

  // 浮动动效通知（限制在视口内）
  const [floatingTags, setFloatingTags] = useState<
    Array<{ id: number; text: string; amount: number; offsetX: number }>
  >([]);

  // 音频上下文
  const audioCtxRef = useRef<AudioContext | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSwipeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const suppressClickRef = useRef(false);
  const swipeHandlerRef = useRef<() => void>(() => {});

  // 初始化大额随机金额
  const initGame = () => {
    // 随机 100,000 ~ 500,000
    const randomTotal = Math.floor(Math.random() * 4001 + 1000) * 100;
    setInitialPoints(randomTotal);
    setCurrentPoints(randomTotal);
    setConsumedHistory([]);
    setIsFinished(false);
    setFloatingTags([]);
  };

  useEffect(() => {
    initGame();
  }, []);

  // Web Audio 纯原生合成音效
  const playSwipeSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // 短促的双音提示，模拟 POS 机感应成功的“滴、滴”声
      [0, 0.11].forEach((delay, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + delay;
        const endTime = startTime + 0.075;

        osc.type = 'square';
        osc.frequency.setValueAtTime(index === 0 ? 880 : 1320, startTime);
        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, endTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(endTime);
      });

      // 设备触觉震动
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(40);
      }
    } catch {
      // 忽略部分浏览器禁用音频
    }
  };

  const playSuccessSound = () => {
    try {
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      // 欢快和弦
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.3);
      });
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([60, 50, 100]);
      }
    } catch {
      // 忽略
    }
  };

  // 刷卡扣减核心逻辑
  const handleSwipe = () => {
    if (currentPoints <= 0 || isFinished) return;

    setIsSwiping(true);
    playSwipeSound();
    setTimeout(() => setIsSwiping(false), 700);

    // 随机选一条文案
    const randomItem = CONSUME_ITEMS[Math.floor(Math.random() * CONSUME_ITEMS.length)];
    // 每次消耗 2500 ~ 9500 元
    const variance = Math.floor(Math.random() * 3000) - 1000;
    const plannedDeduct = Math.max(1800, randomItem.baseCost + variance);

    let actualDeduct = plannedDeduct;
    if (currentPoints - plannedDeduct <= 0) {
      actualDeduct = currentPoints; // 最后一笔直接清零
    }

    const nextPoints = currentPoints - actualDeduct;
    setCurrentPoints(nextPoints);

    // 记录消费历史
    const record = {
      id: Date.now(),
      title: randomItem.title,
      count: randomItem.count,
      amount: actualDeduct,
    };
    setConsumedHistory((prev) => [record, ...prev]);

    // 弹出动画文案：通过限制左右偏移幅度 (-30px ~ 30px)，绝对保证留在屏幕以内
    const randomOffsetX = Math.floor(Math.random() * 60) - 30;
    const tagId = Date.now();
    setFloatingTags((prev) => [
      ...prev,
      {
        id: tagId,
        text: `${randomItem.title} ${randomItem.count}`,
        amount: actualDeduct,
        offsetX: randomOffsetX,
      },
    ]);

    // 1.1s 后自动销毁浮动气泡
    setTimeout(() => {
      setFloatingTags((prev) => prev.filter((t) => t.id !== tagId));
    }, 1100);

    // 判断清零，触发小票结算
    if (nextPoints <= 0) {
      setTimeout(() => {
        setIsFinished(true);
        playSuccessSound();
      }, 350);
    }
  };

  swipeHandlerRef.current = handleSwipe;

  const handleCardPointerDown = () => {
    if (currentPoints <= 0 || isFinished) return;

    longPressTimerRef.current = setTimeout(() => {
      suppressClickRef.current = true;
      setIsAutoSwiping(true);
      swipeHandlerRef.current();
      autoSwipeTimerRef.current = setInterval(() => {
        swipeHandlerRef.current();
      }, 850);
    }, 500);
  };

  const stopAutoSwipe = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (autoSwipeTimerRef.current) {
      clearInterval(autoSwipeTimerRef.current);
      autoSwipeTimerRef.current = null;
    }
    setIsAutoSwiping(false);
  };

  const handleCardClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    handleSwipe();
  };

  useEffect(() => stopAutoSwipe, []);

  // 生成今日格式化日期与流水号
  const dateStr = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const timeStr = new Date().toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-[#0d0f14] text-slate-100 flex flex-col items-center justify-between p-4 selection:bg-rose-500 selection:text-white font-sans overflow-x-hidden relative">
      {/* 顶部拟物状态栏 */}
      <header className="w-full max-w-md flex justify-between items-center py-2 px-1 text-xs text-slate-400 border-b border-slate-800/80">
        <div className="flex items-center gap-1.5 font-bold tracking-wider text-rose-400">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          你的内耗我消费
        </div>
        <div className="flex items-center gap-3 font-mono">
          <span>POS-886</span>
          <button
            onClick={initGame}
            className="text-slate-400 hover:text-slate-200 underline transition active:opacity-70"
          >
            再次消费
          </button>
        </div>
      </header>

      {/* 主操作区 */}
      <main className="w-full max-w-md flex-1 flex flex-col items-center justify-center py-4 relative">
        {/* 屏幕内浮动反馈区域：严格居中限制宽度，避免溢出 */}
        <div className="pointer-events-none fixed top-20 sm:top-1/4 left-0 right-0 z-[60] flex flex-col items-center overflow-visible">
          {floatingTags.map((tag) => (
            <div
              key={tag.id}
              style={{ transform: `translateX(${tag.offsetX}px)` }}
              className="animate-float-fade my-1 max-w-[85vw] px-4 py-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-full font-bold text-sm shadow-xl flex items-center gap-2 border border-white/20 whitespace-nowrap overflow-hidden text-ellipsis backdrop-blur-sm"
            >
              <span>💥 {tag.text}</span>
              <span className="bg-black/30 px-2 py-0.5 rounded-full font-mono text-xs text-amber-200">
                -{tag.amount.toLocaleString()} 元
              </span>
            </div>
          ))}
        </div>

        {!isFinished ? (
          <div className="w-full flex flex-col items-center gap-5">
            {/* POS 终端显示屏 */}
            <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden backdrop-blur">
              <div className="absolute top-0 right-0 p-3 opacity-10 text-5xl font-mono select-none font-black text-rose-400">
                ¥
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-widest flex items-center justify-between mb-1">
                <span>待消费金额</span>
                <span className="text-emerald-400 font-mono">100% 全额冲抵</span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white flex items-baseline gap-1.5 my-1">
                <span className="text-rose-500 text-2xl font-sans">¥</span>
                <span className="tabular-nums">
                  {currentPoints.toLocaleString()}
                </span>
                <span className="text-sm font-normal text-slate-400">元</span>
              </div>

              {/* 消耗进度条 */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full mt-3 overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-rose-500 via-orange-400 to-emerald-400 h-full rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${
                      initialPoints > 0
                        ? Math.max(5, ((initialPoints - currentPoints) / initialPoints) * 100)
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-2">
                <span>累计已消费: {(initialPoints - currentPoints).toLocaleString()} 元</span>
                <span>目标: 0 元归零</span>
              </div>
            </div>

            {/* 拟真黑金信用卡 */}
            <div
              onClick={handleCardClick}
              onPointerDown={handleCardPointerDown}
              onPointerUp={stopAutoSwipe}
              onPointerLeave={stopAutoSwipe}
              onPointerCancel={stopAutoSwipe}
              className={`w-full h-52 sm:h-56 rounded-2xl p-5 bg-gradient-to-tr from-slate-950 via-zinc-900 to-neutral-800 border border-amber-500/30 shadow-[0_15px_35px_rgba(0,0,0,0.6)] flex flex-col justify-between cursor-pointer select-none touch-none transition-all duration-150 transform active:scale-95 active:rotate-1 relative group overflow-hidden ${
                isSwiping || isAutoSwiping ? 'ring-4 ring-rose-500/60 scale-[0.98]' : 'hover:border-amber-400/60'
              }`}
            >
              {/* 卡片表面动态光斑 */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"></div>

              {/* 卡片顶部：芯片与无线感应 */}
              <div className="flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                  {/* 金色金属接触式芯片 */}
                  <div className="w-11 h-8 rounded bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-300/60 shadow-inner flex flex-col justify-between p-1 opacity-95">
                    <div className="w-full h-[1px] bg-amber-800/40"></div>
                    <div className="w-full h-[1px] bg-amber-800/40"></div>
                    <div className="w-full h-[1px] bg-amber-800/40"></div>
                  </div>
                  {/* 无线刷卡波纹 */}
                  <span className="text-slate-400 text-lg rotate-90">)))</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] tracking-widest uppercase font-bold text-amber-400/80 block">
                    EMOTIONAL BLACK CARD
                  </span>
                  <span className="text-xs font-mono text-slate-400">无限额度</span>
                </div>
              </div>

              {/* 卡号 */}
              <div className="font-mono text-slate-300 tracking-widest text-base sm:text-lg flex justify-between z-10 px-1 font-semibold drop-shadow">
                <span>8888</span>
                <span>9960</span>
                <span>0070</span>
                <span>9999</span>
              </div>

              {/* 卡片底部信息 */}
              <div className="flex justify-between items-end z-10">
                <div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-wider">持卡人</div>
                  <div className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                    DEPRESSED HERO
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-slate-500 uppercase tracking-wider">冲抵状态</div>
                  <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    待刷卡核销
                  </div>
                </div>
              </div>
            </div>

            {/* POS 刷卡槽动画 */}
            <div className="w-full flex flex-col items-center gap-2">
              <div className="relative w-[88%] h-12 rounded-xl border border-slate-700 bg-slate-950/90 p-1.5 shadow-inner overflow-hidden">
                <div className="h-full rounded-lg border border-slate-800 bg-slate-900 flex items-center justify-center">
                  <span className="text-[10px] font-mono tracking-[0.3em] text-slate-600">
                    POS CARD READER
                  </span>
                </div>
                <div
                  className={`absolute top-1.5 bottom-1.5 left-0 w-1/3 rounded-lg bg-gradient-to-r from-transparent via-amber-300 to-transparent opacity-0 ${
                    isSwiping ? 'animate-card-swipe opacity-100' : ''
                  }`}
                ></div>
              </div>
              <p className="text-center text-xs text-slate-500">
                点击刷卡，长按自动连续刷卡
              </p>
            </div>

            {/* 最近扣减实时播报：预留固定高度，避免首笔消费后页面跳动 */}
            <div className="w-full min-h-[96px]">
              {consumedHistory.length > 0 && (
                <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 text-xs">
                  <div className="text-slate-400 mb-2 font-medium flex justify-between">
                    <span>实时消费清单</span>
                    <span className="text-slate-500 font-mono">共 {consumedHistory.length} 笔</span>
                  </div>
                  <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                    {consumedHistory.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center text-slate-300 py-0.5 border-b border-slate-800/40 last:border-none"
                      >
                        <span className="truncate max-w-[200px]">
                          {item.title} <span className="text-slate-500">{item.count}</span>
                        </span>
                        <span className="font-mono text-rose-400 font-bold shrink-0">
                          -{item.amount.toLocaleString()} 元
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* 结算完成状态：吐出逼真的热敏纸小票                        */
          /* ======================================================== */
          <div className="w-full flex flex-col items-center animate-slide-up">
            <div className="text-center mb-4">
              <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full mb-1">
                ✓ 全部内耗清零成功
              </span>
              <h2 className="text-xl font-bold text-white">你的内耗我消费 · 结算小票已出</h2>
            </div>

            {/* 拟物热敏纸长条小票 */}
            <div className="w-full bg-[#fdfcf7] text-zinc-900 font-mono p-6 shadow-2xl relative rounded-sm text-xs leading-relaxed selection:bg-zinc-300 selection:text-black">
              {/* 顶部撕纸锯齿 */}
              <div
                className="absolute -top-2 left-0 right-0 h-2 bg-[#0d0f14]"
                style={{
                  maskImage:
                    'radial-gradient(circle at 5px 0, transparent 5px, black 5.5px)',
                  maskSize: '10px 10px',
                  maskRepeat: 'repeat-x',
                  WebkitMaskImage:
                    'radial-gradient(circle at 5px 0, transparent 5px, black 5.5px)',
                  WebkitMaskSize: '10px 10px',
                  WebkitMaskRepeat: 'repeat-x',
                }}
              ></div>

              {/* 小票店铺抬头 */}
              <div className="text-center border-b border-dashed border-zinc-400 pb-3 mb-3">
                <div className="text-lg font-black tracking-tight font-sans text-black">
                  你的内耗我消费
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">
                  EMOTIONAL CONSUMPTION RECEIPT
                </div>
                <div className="text-[10px] text-zinc-600 mt-1">
                  单号: EM-{Math.floor(Math.random() * 899999 + 100000)} | 机台: #01
                </div>
                <div className="text-[10px] text-zinc-600">
                  消费时间: {dateStr} {timeStr}
                </div>
              </div>

              {/* 冲抵统计 */}
              <div className="flex justify-between font-bold py-1 text-sm border-b border-zinc-300 mb-2">
                <span>消费总金额</span>
                <span className="text-rose-600 font-black">
                  ¥ {initialPoints.toLocaleString()} 元
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-zinc-600 mb-2 pb-1 border-b border-dashed border-zinc-300">
                <span>实际内耗剩余</span>
                <span>0 元 (已彻底清空)</span>
              </div>

              {/* 冲抵出的补偿商品明细 */}
              <div className="mb-3">
                <div className="text-[11px] font-bold text-zinc-800 mb-1.5 flex justify-between">
                  <span>抵扣兑换权益商品</span>
                  <span>数量/规格</span>
                </div>
                <div className="space-y-2">
                  {REWARD_ITEMS.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start text-[11px]">
                      <div className="pr-2">
                        <div className="font-bold text-zinc-900">• {item.name}</div>
                        <div className="text-[9px] text-zinc-500 leading-tight">
                          {item.note}
                        </div>
                      </div>
                      <div className="font-bold text-zinc-900 shrink-0 font-mono">
                        {item.val}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 完整核销消耗明细 */}
              <div className="border-t border-dashed border-zinc-400 pt-2 mb-3">
                <div className="text-[10px] text-zinc-500 mb-1">
                  核销扣减记录（共 {consumedHistory.length} 笔）:
                </div>
                <div className="space-y-0.5 text-[10px] text-zinc-600">
                  {consumedHistory.map((rec) => (
                    <div key={rec.id} className="flex justify-between">
                      <span className="truncate max-w-[180px]">
                        {rec.title} {rec.count}
                      </span>
                      <span>-¥{rec.amount.toLocaleString()} 元</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 条形码拟真 */}
              <div className="pt-2 border-t border-zinc-300 flex flex-col items-center">
                <div className="w-full flex justify-center items-center gap-[2px] h-9 mb-1 px-4 overflow-hidden">
                  {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 4, 1, 2, 1, 3, 4, 2, 1, 3, 2, 4, 1, 2, 3].map(
                    (w, idx) => (
                      <span
                        key={idx}
                        className="h-full bg-zinc-900 inline-block"
                        style={{ width: `${w * 1.5}px` }}
                      ></span>
                    )
                  )}
                </div>
                <div className="text-[9px] tracking-widest text-zinc-500 font-mono">
                  ★ 你的内耗我消费 · 人间不值得你值得 ★
                </div>
              </div>

              {/* 底部撕纸锯齿 */}
              <div
                className="absolute -bottom-2 left-0 right-0 h-2 bg-[#0d0f14]"
                style={{
                  maskImage:
                    'radial-gradient(circle at 5px 10px, transparent 5px, black 5.5px)',
                  maskSize: '10px 10px',
                  maskRepeat: 'repeat-x',
                  WebkitMaskImage:
                    'radial-gradient(circle at 5px 10px, transparent 5px, black 5.5px)',
                  WebkitMaskSize: '10px 10px',
                  WebkitMaskRepeat: 'repeat-x',
                }}
              ></div>
            </div>

            {/* 操作按钮区 */}
            <div className="w-full flex gap-3 mt-5">
              <button
                onClick={initGame}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-sm transition active:scale-95 border border-slate-700 flex items-center justify-center gap-1.5"
              >
                <span>🔄 再次消费</span>
              </button>
              <button
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText(
                      `今日我在「你的内耗我消费」成功核销 ¥${initialPoints.toLocaleString()} 元内耗！兑换了全糖奶茶热量豁免权与早睡抵用券，建议全国推广。`
                    );
                    alert('已复制战报文案，去朋友圈发泄/吐槽吧！');
                  }
                }}
                className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold rounded-xl text-sm transition active:scale-95 shadow-lg shadow-rose-500/20 flex items-center justify-center gap-1.5"
              >
                <span>📋 复制战报文案</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 底部版权 */}
      <footer className="w-full max-w-md text-center py-2 text-[10px] text-slate-600 font-mono">
        © 你的内耗我消费 · 精神自愈终端
      </footer>

      {/* 页面内联 CSS 动效（无需额外 tailwind 配置即可生效） */}
      <style jsx global>{`
        @keyframes floatFade {
          0% {
            opacity: 0;
            transform: translateY(12px) scale(0.9);
          }
          20% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          80% {
            opacity: 1;
            transform: translateY(-20px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-38px) scale(0.95);
          }
        }
        .animate-float-fade {
          animation: floatFade 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes cardSwipe {
          from {
            transform: translateX(-130%);
          }
          to {
            transform: translateX(330%);
          }
        }
        .animate-card-swipe {
          animation: cardSwipe 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}