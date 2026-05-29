"use client";

import React, { useState, useEffect, useRef } from "react";

export default function WavesPage() {
  const [inputText, setInputText] = useState("");
  // 第一次看到的文字
  const [centerText, setCenterText] = useState("点击底部输入你的负面情绪，让他们随波消散");
  
  const [isFloatingUp, setIsFloatingUp] = useState(false);
  const [isDissipating, setIsDissipating] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  
  // 独立的多重点击涟漪状态，每次点击都创建一个新涟漪序列
  const [clickRipples, setClickRipples] = useState<{id: number; x: number; y: number}[]>([]);

  const isAnimatingRef = useRef(false);
  useEffect(() => {
    isAnimatingRef.current = isDissipating || isFloatingUp;
  }, [isDissipating, isFloatingUp]);

  const handleScreenClick = (e: React.MouseEvent) => {
    // 任何时候点击都会出现一组新的涟漪
    const newRipple = { id: Date.now() + Math.random(), x: e.clientX, y: e.clientY };
    setClickRipples((prev) => [...prev, newRipple]);
    
    // 4 结束后清除该点击涟漪
    setTimeout(() => {
      setClickRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 4000);
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isAnimatingRef.current) return;
    
    setCenterText(inputText);
    setInputText("");
    
    // 让文字瞬间到底部并变为透明
    setIsFloatingUp(true);
    
    requestAnimationFrame(() => {
      setTimeout(() => {
        // 开始平滑上升
        setIsFloatingUp(false);
        
        // 文字展示 1.5 秒后，自动触发化作涟漪消散
        setTimeout(() => {
          triggerTextAnimations();
        }, 1500);
      }, 50);
    });
  };

  const triggerTextAnimations = () => {
    setIsDissipating(true); 
    setIsFlashing(true);    

    requestAnimationFrame(() => {
      setTimeout(() => {
        setIsFlashing(false);
      }, 50);
    });

    setTimeout(() => {
      // 在这里恢复到占位文字时，为了防止带入之前的 blur 动画，我们使其瞬间变成隐身状态
      setIsFloatingUp(true);
      setIsDissipating(false);
      // 第二次及以后看到的文字
      setCenterText("我们可以继续负面情绪的消散哦");
      
      requestAnimationFrame(() => {
        setTimeout(() => {
          // 然后再次平滑上升，干干净净
          setIsFloatingUp(false);
        }, 50);
      });
    }, 4000);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes ripple-expand {
          0% { transform: translate(-50%, -50%) scale(0.1); opacity: 0.8; border-width: 2px; }
          100% { transform: translate(-50%, -50%) scale(10); opacity: 0; border-width: 0px; }
        }
        
        @keyframes float-glow {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(4vw, -6vh) scale(1.1); }
          66% { transform: translate(-3vw, 4vh) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }

        .glow-1 { animation: float-glow 18s infinite alternate ease-in-out; }
        .glow-2 { animation: float-glow 22s infinite alternate-reverse ease-in-out; }
        .glow-3 { animation: float-glow 25s infinite alternate ease-in-out; }

        .ripple-layer {
          pointer-events: none;
          position: fixed;
          width: 120px;
          height: 120px;
          border: 2px solid rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.3);
          opacity: 0;
          transform: translate(-50%, -50%) scale(0);
        }
        
        .animate-ripple-1 { animation: ripple-expand 3.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
        .animate-ripple-2 { animation: ripple-expand 3.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s forwards; }
        .animate-ripple-3 { animation: ripple-expand 3.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.6s forwards; }
        .animate-ripple-4 { animation: ripple-expand 3.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.9s forwards; }
        .animate-ripple-5 { animation: ripple-expand 3.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1.2s forwards; }
        .animate-ripple-6 { animation: ripple-expand 3.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1.5s forwards; }
      `}} />
      <div
        className={`relative flex h-[100dvh] w-full flex-col overflow-hidden cursor-pointer transition-colors ${
          isFlashing ? "bg-slate-800 duration-0" : "bg-black duration-[400ms]"
        }`}
        onClick={handleScreenClick}
      >
        {/* 背景动态光晕 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 mix-blend-screen opacity-80">
          <div className="absolute top-[10%] left-[10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-blue-900/40 rounded-full blur-[80px] glow-1" />
          <div className="absolute top-[40%] right-[5%] w-[35vw] h-[35vw] max-w-[450px] max-h-[450px] bg-purple-900/30 rounded-full blur-[80px] glow-2" />
          <div className="absolute bottom-[10%] left-[20%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] bg-indigo-900/30 rounded-full blur-[100px] glow-3" />
        </div>

        {/* 1. 任意点击屏幕产生的游离涟漪组合 (互不冲突) */}
        {clickRipples.map((ripple) => (
          <div key={ripple.id} className="fixed inset-0 pointer-events-none z-10">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={`click-${ripple.id}-${i}`}
                className={`ripple-layer animate-ripple-${i}`}
                style={{ left: ripple.x, top: ripple.y }}
              />
            ))}
          </div>
        ))}

        {/* 2. 发送文字后，文字在中央自动消散产生的居中涟漪 */}
        {isDissipating && (
          <div className="fixed inset-0 pointer-events-none z-10">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={`dissipate-${i}`}
                className={`ripple-layer animate-ripple-${i}`}
                style={{ left: '50%', top: '50%' }}
              />
            ))}
          </div>
        )}

        {/* 顶部/居中动画文字区 */}
        <div className="relative flex flex-1 items-center justify-center px-8 z-20">
          <h1
            className={`text-center text-xl md:text-2xl font-light tracking-[0.1em] leading-relaxed text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all ${
              isFloatingUp 
                ? "translate-y-16 scale-100 blur-0 opacity-0 duration-0" 
                : isDissipating
                ? "translate-y-0 scale-[2.5] blur-[16px] opacity-0 duration-[1200ms] ease-out"
                : "translate-y-0 scale-100 blur-0 opacity-100 duration-700 ease-out"
            }`}
          >
            {centerText}
          </h1>
        </div>

        {/* 底部输入框，点击输入框区域不要触发背景水波 */}
        <div className="w-full px-10 pb-16 pt-4 shrink-0 z-30 cursor-auto" onClick={(e) => e.stopPropagation()}>
          <form onSubmit={handleSend} className="relative w-full">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isDissipating || isFloatingUp}
              placeholder="输入负面情绪后按发送键"
              className="w-full bg-transparent text-center text-xl tracking-widest text-white/50 caret-white outline-none transition-colors focus:text-white placeholder:text-white/30"
              autoComplete="off"
              spellCheck="false"
              maxLength={24}
              enterKeyHint="send"
            />
            <button type="submit" className="hidden">发送</button>
          </form>
        </div>
      </div>
    </>
  );
}
